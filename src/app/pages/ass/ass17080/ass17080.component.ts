import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  QueryASS17080DetailRow,
  QueryASS17080Request,
  QueryASS17080Response,
} from '@pages/ass/ass17080/ass17080.model';
import { ASS17080Service } from '@service/api/ass/ass17080.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { map } from 'rxjs/operators';

/** 耗材庫存查詢作業(含金額) — 查詢條件與結果列表 */
@UntilDestroy()
@Component({
  selector: 'app-ass17080',
  templateUrl: './ass17080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    DropdownComponent,
    CalendarComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS17080Component extends BasicQueryPageComponent<QueryASS17080DetailRow> implements OnInit {
  readonly queryForm = this.formBuilder.nonNullable.group({
    displayFilter: [null as string | null],
    whId: [null as string | null],
    stockDate: [null as Date | null, Validators.required],
    bClassId: [null as string | null],
    mClassId: [null as string | null],
    sClassId: [null as string | null],
    goodsId: [null as string | null],
    pageSize: [3000],
    pageIndex: [1],
  });

  data: QueryASS17080DetailRow[] = [];
  totalRecords = 0;
  readonly tableLoading = signal(false);

  /** 供 app-table-report 捲動載入／排序重查 */
  lastQueryBody: Record<string, unknown> | null = null;
  /** 最近一次成功查詢 API `Data` 上的加總欄位 */
  private lastApiTotals: Pick<
    QueryASS17080Response,
    'StocksQty' | 'ProjectQty' | 'ExamineQty' | 'SafeQty' | 'StocksAmt' | 'StocksTolAmt'
  > | null = null;
  exportExcelLoading = false;
  columns: ReportColumn[] = [
    { field: 'GoodsID', header: '品項編號', visible: true },
    // width 明確指定，避開 TableReportWidthService 對未指定 width 欄位的 200px 自動寬度上限——
    // 品項名稱字串常超過 200px，撞到上限會被 CSS 強制斷行成兩行，跟虛擬捲動假設「每列固定 ItemSize 高度」衝突，
    // 導致捲動計算錯亂、載入到一半就卡住（實測現象：總筆數正確但捲不到底）
    { field: 'GoodName', header: '品項名稱', visible: true, width: '220px' },
    { field: 'StocksQty', header: '目前庫存數量', visible: true },
    { field: 'SafeQty', header: '安全庫存數量', visible: true },
    { field: 'ProjectQty', header: '請購數量', visible: true },
    { field: 'ExamineQty', header: '驗收數量', visible: true },
    { field: 'StocksAmt', header: '月結單價', visible: true },
    { field: 'StocksTolAmt', header: '庫存總金額', visible: true },
  ];

  /** 表尾合計：使用 API `Data` 回傳之加總欄位（見 QueryASS17080Response） */
  get footerData(): Record<string, unknown> | null {
    const t = this.lastApiTotals;
    if (!t) {
      return null;
    }
    return {
      label: '合計',
      StocksQty: this.toSafeNumber(t.StocksQty),
      SafeQty: this.toSafeNumber(t.SafeQty),
      ProjectQty: this.toSafeNumber(t.ProjectQty),
      ExamineQty: this.toSafeNumber(t.ExamineQty),
      StocksAmt: this.toSafeNumber(t.StocksAmt),
      StocksTolAmt: this.toSafeNumber(t.StocksTolAmt),
    };
  }

  displayFilterOptions: { value: string; label: string }[] = [
    { value: '0', label: '全部' },
    { value: '1', label: '只顯示低於安全庫存' },
  ];

  warehouseOptions: Option[] = [];
  bigCategoryOptions: Option[] = [];
  midCategoryOptions: Option[] = [];
  smallCategoryOptions: Option[] = [];
  goodsOptions: Option[] = [];

  constructor(
    private readonly dropdownApi: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly ass17080Service: ASS17080Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17080', '', this.queryForm, frm => this.onSubmit(frm));
    this.loadWarehouseOptions();
    this.loadBigCategoryOptions();
    this.loadGoodsOptions();
    this.setupCategoryCascade();
  }

  get displayFilterCtrl(): FormControl<string | null> {
    return this.queryForm.controls.displayFilter;
  }

  private loadWarehouseOptions(): void {
    this.dropDownListService
      .queryFAHOS_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        const list = res.Data ?? [];
        this.warehouseOptions = list
          .filter(x => (x.WH_ID ?? '').toString().trim() !== '')
          .map(x => ({
            value: (x.WH_ID ?? '').toString(),
            label: `${x.WH_ID ?? ''} - ${x.WH_NAME ?? ''}`.trim(),
          }));
      });
  }

  private loadBigCategoryOptions(): void {
    this.dropdownApi
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.bigCategoryOptions = opts ?? [];
      });
  }

  private loadMidCategoryOptions(bClassId: string): void {
    this.dropdownApi
      .queryFaClass1({ B_CLASS_ID: bClassId || null })
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.midCategoryOptions = opts ?? [];
      });
  }

  private loadSmallCategoryOptions(bClassId: string, mClassId: string): void {
    if (!mClassId) {
      this.smallCategoryOptions = [];
      return;
    }
    this.dropdownApi
      .queryFaClass2({ B_CLASS_ID: bClassId || undefined, M_CLASS_ID: mClassId })
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.smallCategoryOptions = opts ?? [];
      });
  }

  private loadGoodsOptions(): void {
    this.dropdownApi
      .queryFasItemDropdown({ MATERIAL_TYPE: '3' })
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.goodsOptions = opts ?? [];
      });
  }

  private setupCategoryCascade(): void {
    this.queryForm.controls.bClassId.valueChanges.pipe(untilDestroyed(this)).subscribe(bid => {
      this.queryForm.patchValue({ mClassId: null, sClassId: null }, { emitEvent: false });
      this.midCategoryOptions = [];
      this.smallCategoryOptions = [];
      if (bid) {
        this.loadMidCategoryOptions(bid);
      }
    });

    this.queryForm.controls.mClassId.valueChanges.pipe(untilDestroyed(this)).subscribe(mid => {
      this.queryForm.patchValue({ sClassId: null }, { emitEvent: false });
      this.smallCategoryOptions = [];
      if (mid) {
        const bid = this.queryForm.controls.bClassId.value ?? '';
        this.loadSmallCategoryOptions(bid, mid);
      }
    });
  }

  /** 組 lastQueryBody（業務條件 + 分頁鍵，供 table-report 合併 SortBy / 下一頁） */
  private buildLastQueryBodyFromForm(): Record<string, unknown> {
    const raw = this.queryForm.getRawValue();
    const pageIndex = Number(raw.pageIndex) || 1;
    const pageSize = Number(raw.pageSize) || 30;
    return {
      displayFilter: raw.displayFilter,
      whId: raw.whId,
      stockDate: raw.stockDate,
      bClassId: raw.bClassId,
      mClassId: raw.mClassId,
      sClassId: raw.sClassId,
      goodsId: raw.goodsId,
      pageIndex,
      pageSize,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };
  }

  /** 分頁鍵：允許 0（匯出全量）；未給或 NaN 才用預設 */
  private readPagingFromBody(body: Record<string, unknown>): { pageSize: number; pageIndex: number } {
    const rawSize = body['pageSize'] ?? body['PageSize'];
    const rawIndex = body['pageIndex'] ?? body['PageIndex'];
    const pageSize =
      rawSize === null || rawSize === undefined || rawSize === ''
        ? 30
        : Number.isFinite(Number(rawSize))
          ? Number(rawSize)
          : 30;
    const pageIndex =
      rawIndex === null || rawIndex === undefined || rawIndex === ''
        ? 1
        : Number.isFinite(Number(rawIndex))
          ? Number(rawIndex)
          : 1;
    return { pageSize, pageIndex };
  }

  /** 將 table-report / lastQueryBody 的 plain object 轉成 API Request */
  private recordToQueryRequest(body: Record<string, unknown>): QueryASS17080Request {
    const { pageSize, pageIndex } = this.readPagingFromBody(body);
    const sortBy = body['SortBy'] as QueryASS17080Request['SortBy'] | undefined;
    const orderBy = body['OrderBy'] as string | null | undefined;

    const user = this.authService.getUserInfo();
    const stockDateIso = this.toStockDateIso(body['stockDate'] as Date | null);
    const optional = removeEmptyValues({
      WH_ID: body['whId'],
      B_CLASS_ID: body['bClassId'],
      M_CLASS_ID: body['mClassId'],
      S_CLASS_ID: body['sClassId'],
      GOODS_ID: body['goodsId'],
    } as Record<string, unknown>) as Partial<
      Pick<QueryASS17080Request, 'WH_ID' | 'B_CLASS_ID' | 'M_CLASS_ID' | 'S_CLASS_ID' | 'GOODS_ID'>
    >;

    const displayFilter = body['displayFilter'];
    const queryType =
      displayFilter === '1' || Number(displayFilter) === 1 ? 1 : 0;

    const payload: QueryASS17080Request = {
      ...optional,
      OrderBy: orderBy,
      Offset: (pageIndex - 1) * pageSize,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy && Array.isArray(sortBy) && sortBy.length > 0 ? sortBy : undefined,
      MID: user?.mid != null ? String(user.mid) : '',
      STO_NO: user?.SYS_StoreNo ?? '',
      QUERY_TYPE: queryType,
      STOCK_DATE: stockDateIso ?? '',
    };

    return removeEmptyValues(payload as Record<string, unknown>) as QueryASS17080Request;
  }

  private buildQueryBody(
    body: Partial<QueryASS17080Request & { pageSize?: number; pageIndex?: number }> = {},
  ): QueryASS17080Request {
    const pagingBody = body as QueryASS17080Request & { pageSize?: number; pageIndex?: number };
    const raw = this.queryForm.getRawValue();
    const hasLoadMorePaging = pagingBody.pageIndex !== undefined || pagingBody.pageSize !== undefined;
    const pageSize = pagingBody.pageSize ?? pagingBody.PageSize ?? raw.pageSize ?? 30;
    const pageIndex = pagingBody.pageIndex ?? pagingBody.PageIndex ?? raw.pageIndex ?? 1;

    const record: Record<string, unknown> = {
      displayFilter: raw.displayFilter,
      whId: raw.whId,
      stockDate: raw.stockDate,
      bClassId: raw.bClassId,
      mClassId: raw.mClassId,
      sClassId: raw.sClassId,
      goodsId: raw.goodsId,
      pageIndex,
      pageSize,
      SortBy: pagingBody.SortBy,
      OrderBy: pagingBody.OrderBy,
    };

    const req = this.recordToQueryRequest(record);
    if (!hasLoadMorePaging) {
      req.Offset = pagingBody.Offset ?? (pageIndex - 1) * pageSize;
    }
    return req;
  }

  /** 供 app-table-report：捲動載入更多／排序後重查 */
  queryASS17080ForReport = (body: Record<string, unknown>) => {
    const req = this.recordToQueryRequest(body);
    return this.ass17080Service.queryASS17080(req).pipe(
      map(res => {
        if (res?.Status !== '0000' || !res.Data) {
          return { Data: [] as QueryASS17080DetailRow[], TotalCount: 0 };
        }

        this.applyTotalsFromResponse(res.Data);

        const rows = res.Data.Details ?? [];

        const mappedRows = rows.map((row, i) => ({
          ...row,
          ID: `${row.RowNo ?? ''}_${row.GoodsID ?? ''}_${i}`,
        }));

        return {
          Data: mappedRows,
          TotalCount: res.Data.TotalRows ?? mappedRows.length,
        };
      }),
    );
  };

  /** 與 table-report / API 相容的 SortBy 正規化 */
  private normalizeSortByForRequest(sortBy: unknown): NonNullable<QueryASS17080Request['SortBy']> {
    if (!sortBy || !Array.isArray(sortBy) || sortBy.length === 0) {
      return [];
    }
    return sortBy.map(m => ({
      field: String((m as { field?: string; Field?: string }).field ?? (m as { Field?: string }).Field ?? ''),
      order: Number((m as { order?: number; Order?: number }).order ?? (m as { Order?: number }).Order ?? 0),
    }));
  }

  /**
   * 匯出 Excel
   */
  private buildExportPayload(): QueryASS17080Request {
    const lb = this.lastQueryBody;
    const normalizedSortBy = this.normalizeSortByForRequest(lb?.['SortBy']);
    const req = this.buildQueryBody({
      PageIndex: 0,
      PageSize: 0,
      SortBy: normalizedSortBy.length > 0 ? normalizedSortBy : undefined,
      OrderBy: lb?.['OrderBy'] as string | null | undefined,
    });
    req.OrderBy = lb?.['OrderBy'] != null ? String(lb['OrderBy']) : '';
    req.SortBy = normalizedSortBy.length > 0 ? normalizedSortBy : [];
    return req;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  private getTimestamp(): string {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0')
    );
  }

  onExportExcel(): void {
    const payload = this.buildExportPayload();
    this.exportExcelLoading = true;
    this.ass17080Service
      .exportExcelASS17080(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.exportExcelLoading = false;
        }),
      )
      .subscribe({
        next: blob => {
          if (blob) {
            this.downloadBlob(blob, `報廢明細表_${this.getTimestamp()}.xlsx`);
          }
        },
        error: () => {
          this.messageService.errorBubble('檔案匯出失敗，請重試。');
        },
      });
  }

  /** 庫存日期 → API ISO 字串；無效則 null */
  private toStockDateIso(d: Date | null): string | null {
    if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) {
      return null;
    }
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    return new Date(Date.UTC(y, m, day, 0, 0, 0, 0)).toISOString();
  }

  private toSafeNumber(value: unknown): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
      const parsed = Number(value.replaceAll(',', '').trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  private applyTotalsFromResponse(data: QueryASS17080Response | null | undefined): void {
    if (!data) {
      this.lastApiTotals = null;
      return;
    }
    this.lastApiTotals = {
      StocksQty: data.StocksQty,
      ProjectQty: data.ProjectQty,
      ExamineQty: data.ExamineQty,
      SafeQty: data.SafeQty,
      StocksAmt: data.StocksAmt,
      StocksTolAmt: data.StocksTolAmt,
    };
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(
      frm,
      () => {
        if (!this.hasPermission(this.Actions.Query)) {
          this.tableLoading.set(false);
          return;
        }
        this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
        const raw = this.queryForm.getRawValue();
        const snapshot = this.buildLastQueryBodyFromForm();
        this.lastQueryBody = { ...snapshot };
        const body = this.buildQueryBody({
          PageSize: raw.pageSize ?? 30,
          PageIndex: raw.pageIndex ?? 1,
        });
        this.ass17080Service
          .queryASS17080(body)
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.tableLoading.set(false);
              this.loading = false;
            }),
          )
          .subscribe({
            next: res => {
              if (res?.Status === '0000') {
                const rows = res.Data?.Details ?? [];
                this.data = rows.map((row, i) => ({
                  ...row,
                  ID: `${row.RowNo ?? ''}_${row.GoodsID ?? ''}_${i}`,
                }));
                this.totalRecords = res.Data?.TotalRows ?? this.data.length;
                this.applyTotalsFromResponse(res.Data ?? undefined);

                this.lastQueryBody = { ...snapshot };
                this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
              } else {
                this.data = [];
                this.totalRecords = 0;
                this.lastApiTotals = null;
                this.lastQueryBody = null;
                if (res?.Status !== '0000') {
                  this.messageService.warnBubble(
                    res?.Message || (res as { Error?: { Message?: string } })?.Error?.Message || '查詢失敗',
                  );
                }
              }
            },
            error: () => {
              this.data = [];
              this.totalRecords = 0;
              this.lastApiTotals = null;
              this.lastQueryBody = null;
              this.messageService.warnBubble('查詢失敗，請稍後再試');
            },
          });
      },
      v => this.tableLoading.set(v),
    );
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset({
      displayFilter: null,
      whId: null,
      stockDate: null,
      bClassId: null,
      mClassId: null,
      sClassId: null,
      goodsId: null,
      pageSize: 30,
      pageIndex: 1,
    });
    this.submitted = false;
    this.midCategoryOptions = [];
    this.smallCategoryOptions = [];
    this.data = [];
    this.totalRecords = 0;
    this.lastApiTotals = null;
    this.lastQueryBody = null;
  }
}
