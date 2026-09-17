import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { ASS15030Service } from '@service/api/ass/ass15030.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { distinctUntilChanged, finalize, map, Observable, startWith } from 'rxjs';
import { Option } from '../../../service/utility/dropdown-api.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { formatAmount2, formatDate } from '../../../shared/components/table-report/table-report.model';
import { FileExportService } from '../../../shared/service/file-export.service';
import { removeEmptyValues } from '../../../shared/utils/object-utils';
import {
  QueryASS15030DetailResponse,
  QueryASS15030DetailResult,
  QueryASS15030Request,
  QueryASS15030SumResponse,
  QueryASS15030SumResult,
} from './ass15030.model';

//3.1.5.3  財產目錄
@UntilDestroy()
@Component({
  selector: 'app-ass15030',
  templateUrl: './ass15030.component.html',
  styleUrl: './ass15030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, RadiobuttonComponent, DropdownComponent, CalendarRangeComponent, CalendarComponent, CheckboxModule, ButtonComponent, TableReportComponent, TranslateModule, ButtonModule]
})
export class ASS15030Component extends BasicQueryPageComponent<any> implements OnInit {
  private static readonly SUBTOTAL_SEQ = '小計';
  private static readonly GRANDTOTAL_SEQ = '總合計';

  queryForm = this.formBuilder.group({
    paperType: ['1'], // 報表型態 1=折舊前試算 2=拋轉
    accountCode: [null as string | null], // 會計科目代碼
    keeperUnit: [null as string | null], // 保管單位
    purchaseDateFrom: [null as Date | null], // 購入日期(起)
    purchaseDateTo: [null as Date | null], // 購入日期(訖)
    bigCategoryCode: [null as string | null], // 大分類編號
    midCategoryCode: [null as string | null], // 中分類編號
    smlCategoryCode: [null as string | null], // 小分類編號
    entryDateFrom: [null as Date | null], // 入帳日期(起)
    entryDateTo: [null as Date | null], // 入帳日期(訖)
    itemCode: [null as string | null], // 品項編號
    baseYYMM: [null as string | null, [Validators.required]], // 基準日 YYYYMM
    showReceiveAmount: [false], // 是否顯示取得金額為0 (勾選=true)
    showScrapData: [false], // 是否顯示當期報廢、變賣資料 (勾選=true)
    reportStyle: ['1'], // 報表樣式 1=彙總 2=明細
  });
  data: any[] = [];
  totalRecords = 0;
  footerData: any = null;
  readonly tableLoading = signal(false);
  exportPdfLoading = false;
  exportExcelLoading = false;
  private readonly defaultPageSize = 100000;
  lastQueryBody?: QueryASS15030Request & { pageIndex?: number; pageSize?: number };
  // 跨頁累計筆數：parent.data 不會被 table-report 的 loadMoreData 同步回來，
  // 所以末頁偵測必須自己累計，否則 pageIndex>=3 的末頁 TotalCount 會錯。
  private accumulatedRowCount = 0;

  // 小計列套用此 class，重現原本群組底小計樣式（灰底/粗體/主色/小字）
  private readonly subtotalCellClass = (row: any): string =>
    this.isSubtotalRow(row?.SEQ) ? 'ass15030-subtotal-cell' : '';

  private readonly summaryColumns: any[] = [
    { field: 'SEQ', header: '項次', visible: true, width: '70px' },
    { field: 'GOODS_ID', header: '品項編號', visible: true, width: '110px' },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true, width: '160px' },
    { field: 'HOLD_ORG_NAME', header: '保管單位', visible: true, width: '140px' },
    { field: 'GET_COST_TTL', header: '取得價格\n合計', visible: true, isSubTotal: true, align: 'right', width: '120px', format: (v: number) => formatAmount2(v) },
    { field: 'FIX_AMT_TTL', header: '異動價格\n合計', visible: true, isSubTotal: true, align: 'right', width: '120px', format: (v: number) => formatAmount2(v) },
    { field: 'AFT_AMT_TTL', header: '異動後價格\n合計', visible: true, isSubTotal: true, align: 'right', width: '120px', format: (v: number) => formatAmount2(v) },
    { field: 'RESI_VALUE_TTL', header: '預留總值\n合計', visible: true, isSubTotal: true, align: 'right', width: '120px', format: (v: number) => formatAmount2(v) },
    { field: 'PRE_DEPRE_TTL', header: '前期折舊金額', visible: true, isSubTotal: true, align: 'right', width: '120px', format: (v: number) => formatAmount2(v) },
    { field: 'CUR_DEPRE_TTL', header: '本期\n折舊金額\n合計', visible: true, isSubTotal: true, align: 'right', width: '120px', format: (v: number) => formatAmount2(v) },
    { field: 'ACC_DEPRE_TTL', header: '累計\n折舊金額\n合計', visible: true, isSubTotal: true, align: 'right', width: '120px', format: (v: number) => formatAmount2(v) },
    { field: 'UNDEPRE_TTL', header: '未折舊金額\n合計', visible: true, isSubTotal: true, align: 'right', width: '120px', format: (v: number) => formatAmount2(v) },
  ];

  private readonly detailColumns: any[] = [
    { field: 'SEQ', header: '項次', visible: true, width: '70px' },
    { field: 'ASSET_ID', header: '資產編號', visible: true, width: '110px' },
    { field: 'GOODS_NAME', header: '項目名稱', visible: true, width: '160px' },
    { field: 'GET_DATE', header: '購入\n日期', visible: true, width: '100px', format: (v: string) => formatDate(v) },
    { field: 'BILL_DATE', header: '入帳\n日期', visible: true, width: '100px', format: (v: string) => formatDate(v) },
    { field: 'HOLD_ORG_ID', header: '保管單位', visible: true, width: '140px' },
    { field: 'FIR_GET_COST', header: '取得價格', visible: true, isSubTotal: true, align: 'right', width: '110px', format: (v: number) => formatAmount2(v) },
    { field: 'MODIFY_AMT', header: '異動價格', visible: true, isSubTotal: true, align: 'right', width: '110px', format: (v: number) => formatAmount2(v) },
    { field: 'GET_COST', header: '異動後價格', visible: true, isSubTotal: true, align: 'right', width: '110px', format: (v: number) => formatAmount2(v) },
    { field: 'RESI_VALUE', header: '預留\n殘值', visible: true, isSubTotal: true, align: 'right', width: '100px', format: (v: number) => formatAmount2(v) },
    { field: 'FIR_EXP_YEAR', header: '耐用\n年數', visible: true, isSubTotal: true, width: '80px' },
    { field: 'MODIFY_YEAR', header: '異動\n耐用\n年數', visible: true, isSubTotal: true, width: '80px' },
    { field: 'EXP_YEAR', header: '異動後\n耐用\n年數', visible: true, isSubTotal: true, width: '80px' },
    { field: 'BUY_MONTHS', header: '已購入\n月數', visible: true, isSubTotal: true, width: '80px' },
    { field: 'BILL_MONTHS', header: '已入帳\n月數', visible: true, isSubTotal: true, width: '80px' },
    { field: 'DEPRE_MONTHS', header: '已攤提\n月數', visible: true, isSubTotal: true, width: '80px' },
    { field: 'DEPRE_AMOUNT', header: '本年\n折舊金額', visible: true, isSubTotal: true, align: 'right', width: '110px', format: (v: number) => formatAmount2(v) },
    { field: 'THIS_DEPRE_AMT', header: '本期\n折舊金額', visible: true, isSubTotal: true, align: 'right', width: '110px', format: (v: number) => formatAmount2(v) },
    { field: 'TAL_DEPRE_AMT', header: '累計\n折舊金額', visible: true, isSubTotal: true, align: 'right', width: '110px', format: (v: number) => formatAmount2(v) },
    { field: 'NO_DEPRE_AMT', header: '未折舊金額', visible: true, isSubTotal: true, align: 'right', width: '110px', format: (v: number) => formatAmount2(v) },
    { field: 'NOTES', header: '財產註記', visible: true, width: '160px' },
  ];

  columns: any[] = this.getColumnsByReportStyle('1');

  paperTypeOptions: Option[] = [
    { value: '1', label: '折舊前試算' },
    { value: '2', label: '拋轉' },
  ];
  accountCodeOptions: Option[] = [];
  keeperUnitOptions: Option[] = [];
  bigCategoryCodeOptions: Option[] = [];
  midCategoryCodeOptions: Option[] = [];
  smlCategoryCodeOptions: Option[] = [];
  itemCodeOptions: Option[] = [];
  reportStyleOptions: Option[] = [
    { value: '1', label: '彙總' },
    { value: '2', label: '明細' },
  ];

  private readonly fileExportService = inject(FileExportService);

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly ass15030Service: ASS15030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15030', '', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdownOptions();
    this.setupCategoryCascade();
    this.setupReportStyleSync();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(
      frm,
      () => {
        if (!this.hasPermission(this.Actions.Query)) {
          this.tableLoading.set(false);
          return;
        }
        this.columns = this.getColumnsByReportStyle(this.queryForm.controls.reportStyle.value);
        const request = this.buildRequest({
          pageSize: this.defaultPageSize,
          pageIndex: 1,
          SortBy: this.lastQueryBody?.SortBy,
        });
        this.lastQueryBody = request;

        this.tableLoading.set(true);
        this.queryFunction(request)
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.tableLoading.set(false);
              this.loading = false;
            }),
          )
          .subscribe({
            next: res => {
              this.data = res.Data ?? [];
              this.totalRecords = res.TotalCount ?? 0;
              this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
            },
          });
      },
      v => this.tableLoading.set(v),
    );
  }

  queryFunction = (body: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): Observable<{ Data: any[]; TotalCount: number }> => {
    const apiPageIndex = Number(body.pageIndex ?? body.PageIndex ?? 1) || 1;
    const apiPageSize =
      Number(body.pageSize ?? body.PageSize ?? this.defaultPageSize) || this.defaultPageSize;
    const sortBy = Array.isArray(body.SortBy) ? body.SortBy : undefined;

    const request = this.buildRequest({
      pageIndex: apiPageIndex,
      PageIndex: apiPageIndex,
      pageSize: apiPageSize,
      PageSize: apiPageSize,
      SortBy: sortBy,
    });

    this.lastQueryBody = {
      ...request,
      pageIndex: apiPageIndex,
      pageSize: apiPageSize,
    };

    return this.queryByReportStyle(request).pipe(
      map(({ rows, totalCount, footer, rawCount }) => {
        // 只在第一頁更新 footer（總合計），避免後續分頁回傳的 page-scoped TOTAL_* 蓋掉
        if (apiPageIndex === 1) {
          this.footerData = footer;
          this.accumulatedRowCount = rows.length;
        } else {
          this.accumulatedRowCount += rows.length;
        }

        // 末頁偵測：後端原始 row 數 < pageSize → 視為末頁，
        // 把 TotalCount 設為「append 後累計筆數」讓 table-report 停止再觸發
        // const isLastPage = rawCount < apiPageSize;
        // 後端 TOTAL_COUNT 若缺漏/未正確填值，很容易剛好等於目前已載入筆數（甚至 0），
        // 導致 table-report 誤判「已載入=總筆數」而永久停止捲動載入。
        // 只有當後端回報的總數確實大於目前累計筆數時才採信，否則假設還有下一頁，
        // 交給上面 isLastPage（依實際回傳筆數 < pageSize）去真正判斷末頁。
        // const reliableTotal = totalCount > this.accumulatedRowCount ? totalCount : this.accumulatedRowCount + 1;
        // const adjustedTotal = isLastPage ? this.accumulatedRowCount : reliableTotal;

        return {
          Data: rows,
          TotalCount: totalCount,
        };
      }),
    );
  };

  private loadDropdownOptions(): void {
    this.dropdownApiService
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accountCodeOptions = opts ?? []));

    this.dropdownApiService
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.keeperUnitOptions = opts ?? []));

    this.dropdownApiService
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.bigCategoryCodeOptions = opts ?? []));

    this.dropdownApiService
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.itemCodeOptions = opts ?? []));
  }

  private setupCategoryCascade(): void {
    this.queryForm.controls.bigCategoryCode.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(bigCode => {
        this.queryForm.patchValue(
          { midCategoryCode: null, smlCategoryCode: null },
          { emitEvent: false },
        );
        this.midCategoryCodeOptions = [];
        this.smlCategoryCodeOptions = [];
        if (!bigCode) return;
        this.dropdownApiService
          .queryFaClass1({ B_CLASS_ID: bigCode })
          .pipe(untilDestroyed(this))
          .subscribe(opts => (this.midCategoryCodeOptions = opts ?? []));
      });

    this.queryForm.controls.midCategoryCode.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(midCode => {
        this.queryForm.patchValue({ smlCategoryCode: null }, { emitEvent: false });
        this.smlCategoryCodeOptions = [];
        if (!midCode) return;
        this.dropdownApiService
          .queryFaClass2({ M_CLASS_ID: midCode })
          .pipe(untilDestroyed(this))
          .subscribe(opts => (this.smlCategoryCodeOptions = opts ?? []));
      });
  }

  // 切換報表樣式時立即同步欄位定義；同時清掉上一個樣式的資料/footer，
  // 避免新欄位套到舊資料形狀上造成空白欄與錯誤總合計
  private setupReportStyleSync(): void {
    const initialStyle = this.queryForm.controls.reportStyle.value;
    this.queryForm.controls.reportStyle.valueChanges
      .pipe(startWith(initialStyle), distinctUntilChanged(), untilDestroyed(this))
      .subscribe(style => {
        this.columns = this.getColumnsByReportStyle(style);
        this.data = [];
        this.footerData = null;
        this.totalRecords = 0;
        this.accumulatedRowCount = 0;
      });
  }

  private buildRequest(body?: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): QueryASS15030Request {
    const q = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? this.defaultPageSize;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy) ? body?.SortBy : undefined;

    const payload: QueryASS15030Request = {
      STYPE_ID: q.accountCode || undefined,
      HOLD_ORG_ID: q.keeperUnit || undefined,
      GET_DATE_S: this.toApiDateValue(q.purchaseDateFrom),
      GET_DATE_E: this.toApiDateValue(q.purchaseDateTo),
      B_CLASS_ID: q.bigCategoryCode || undefined,
      M_CLASS_ID: q.midCategoryCode || undefined,
      S_CLASS_ID: q.smlCategoryCode || undefined,
      BILL_DATE_S: this.toApiDateValue(q.entryDateFrom),
      BILL_DATE_E: this.toApiDateValue(q.entryDateTo),
      GOODS_ID: q.itemCode || undefined,
      BaseYM: this.toBaseYm(q.baseYYMM),
      Type: q.paperType || undefined,
      SHOW_ZERO: q.showReceiveAmount ? '1' : '0',
      SHOW_HANDLE: q.showScrapData ? '1' : '0',
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    };

    return removeEmptyValues(payload) as QueryASS15030Request;
  }

  private queryByReportStyle(
    request: QueryASS15030Request,
  ): Observable<{ rows: any[]; totalCount: number; footer: any; rawCount: number }> {
    const reportStyle = this.queryForm.controls.reportStyle.value;
    if (reportStyle === '2') {
      return this.ass15030Service.queryASS15030Detail(request).pipe(
        map(res => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(res.Message);
            return { rows: [], totalCount: 0, footer: null, rawCount: 0 };
          }
          const result = res.Data;
          const list = result?.detail ?? [];
          const rows = this.mapDetailRows(list);
          const totalCount = result?.TOTAL_COUNT ?? res.TotalCount ?? rows.length;
          const footer = result ? this.buildDetailFooter(result) : null;
          return { rows, totalCount, footer, rawCount: list.length };
        }),
      );
    }
    return this.ass15030Service.queryASS15030Sum(request).pipe(
      map(res => {
        if (res.Status !== '0000') {
          this.messageService.errorBubble(res.Message);
          return { rows: [], totalCount: 0, footer: null, rawCount: 0 };
        }
        const result = res.Data;
        const list = result?.detail ?? [];
        const rows = this.mapSummaryRows(list);
        const totalCount = result?.TOTAL_COUNT ?? res.TotalCount ?? rows.length;
        const footer = result ? this.buildSumFooter(result) : null;
        return { rows, totalCount, footer, rawCount: list.length };
      }),
    );
  }

  private mapSummaryRows(rows: QueryASS15030SumResponse[]): any[] {
    // 過濾掉總合計列（由 wrapper TOTAL_* 走 footerData），其餘明細+小計依 API 順序保留
    return (rows ?? [])
      .filter(row => !this.isGrandTotalRow(row.SEQ))
      .map((row, idx) => ({
        ...row,
        SEQ: this.normalizeSeqValue(row.SEQ, `${idx + 1}`),
        GOODS_ID: this.isSubtotalRow(row.SEQ) ? null : (row.GOODS_ID ?? ''),
        GOODS_NAME: this.isSubtotalRow(row.SEQ) ? null : (row.GOODS_NAME ?? ''),
        HOLD_ORG_NAME: this.isSubtotalRow(row.SEQ) ? null : (row.HOLD_ORG_NAME ?? ''),
        GET_COST_TTL: row.GET_COST_TTL ?? 0,
        FIX_AMT_TTL: row.FIX_AMT_TTL ?? 0,
        AFT_AMT_TTL: row.AFT_AMT_TTL ?? 0,
        RESI_VALUE_TTL: row.RESI_VALUE_TTL ?? 0,
        PRE_DEPRE_TTL: row.PRE_DEPRE_TTL ?? 0,
        CUR_DEPRE_TTL: row.CUR_DEPRE_TTL ?? 0,
        ACC_DEPRE_TTL: row.ACC_DEPRE_TTL ?? 0,
        UNDEPRE_TTL: row.UNDEPRE_TTL ?? 0,
      }));
  }

  private mapDetailRows(rows: QueryASS15030DetailResponse[]): any[] {
    return (rows ?? [])
      .filter(row => !this.isGrandTotalRow(row.SEQ))
      .map((row, idx) => ({
        ...row,
        SEQ: this.normalizeSeqValue(row.SEQ, `${idx + 1}`),
        ASSET_ID: this.isSubtotalRow(row.SEQ) ? null : (row.ASSET_ID ?? ''),
        GOODS_NAME: this.isSubtotalRow(row.SEQ) ? null : (row.GOODS_NAME ?? ''),
        GET_DATE: this.isSubtotalRow(row.SEQ) ? null : (row.GET_DATE ?? ''),
        BILL_DATE: this.isSubtotalRow(row.SEQ) ? null : (row.BILL_DATE ?? ''),
        HOLD_ORG_ID: this.isSubtotalRow(row.SEQ) ? null : (row.HOLD_ORG_ID ?? ''),
        FIR_GET_COST: row.FIR_GET_COST ?? 0,
        MODIFY_AMT: row.MODIFY_AMT ?? 0,
        GET_COST: row.GET_COST ?? 0,
        RESI_VALUE: row.RESI_VALUE ?? 0,
        FIR_EXP_YEAR: row.FIR_EXP_YEAR ?? 0,
        MODIFY_YEAR: row.MODIFY_YEAR ?? 0,
        EXP_YEAR: row.EXP_YEAR ?? 0,
        BUY_MONTHS: row.BUY_MONTHS ?? 0,
        BILL_MONTHS: row.BILL_MONTHS ?? 0,
        DEPRE_MONTHS: row.DEPRE_MONTHS ?? 0,
        DEPRE_AMOUNT: row.DEPRE_AMOUNT ?? 0,
        THIS_DEPRE_AMT: row.THIS_DEPRE_AMT ?? 0,
        TAL_DEPRE_AMT: row.TAL_DEPRE_AMT ?? 0,
        NO_DEPRE_AMT: row.NO_DEPRE_AMT ?? 0,
        NOTES: row.NOTES ?? '',
      }));
  }

  private getColumnsByReportStyle(reportStyle: string | null | undefined): any[] {
    const base = reportStyle === '2' ? this.detailColumns : this.summaryColumns;
    return base.map(col => ({
      ...col,
      cellClass: col.cellClass ?? this.subtotalCellClass,
    }));
  }

  private normalizeSeqValue(seq: string | undefined, fallback: string): string {
    const trimmed = String(seq ?? '').trim();
    return trimmed || fallback;
  }

  private isSubtotalRow(seq: string | undefined): boolean {
    return String(seq ?? '').trim() === ASS15030Component.SUBTOTAL_SEQ;
  }

  private isGrandTotalRow(seq: string | undefined): boolean {
    return String(seq ?? '').trim() === ASS15030Component.GRANDTOTAL_SEQ;
  }

  private buildSumFooter(r: QueryASS15030SumResult): any {
    return {
      GET_COST_TTL: r.TOTAL_GET_COST_TTL ?? 0,
      FIX_AMT_TTL: r.TOTAL_FIX_AMT_TTL ?? 0,
      AFT_AMT_TTL: r.TOTAL_AFT_AMT_TTL ?? 0,
      RESI_VALUE_TTL: r.TOTAL_RESI_VALUE_TTL ?? 0,
      PRE_DEPRE_TTL: r.TOTAL_PRE_DEPRE_TTL ?? 0,
      CUR_DEPRE_TTL: r.TOTAL_CUR_DEPRE_TTL ?? 0,
      ACC_DEPRE_TTL: r.TOTAL_ACC_DEPRE_TTL ?? 0,
      UNDEPRE_TTL: r.TOTAL_UNDEPRE_TTL ?? 0,
    };
  }

  private buildDetailFooter(r: QueryASS15030DetailResult): any {
    // 年/月欄位 (FIR_EXP_YEAR / MODIFY_YEAR / EXP_YEAR / BUY_MONTHS / BILL_MONTHS / DEPRE_MONTHS)
    // 後端無對應 TOTAL_* 欄位，footer 該幾格留白即可。
    return {
      FIR_GET_COST: r.TOTAL_FIR_GET_COST ?? 0,
      MODIFY_AMT: r.TOTAL_MODIFY_AMT ?? 0,
      GET_COST: r.TOTAL_GET_COST ?? 0,
      RESI_VALUE: r.TOTAL_RESI_VALUE ?? 0,
      DEPRE_AMOUNT: r.TOTAL_DEPRE_AMOUNT ?? 0,
      THIS_DEPRE_AMT: r.TOTAL_THIS_DEPRE_AMT ?? 0,
      TAL_DEPRE_AMT: r.TOTAL_TAL_DEPRE_AMT ?? 0,
      NO_DEPRE_AMT: r.TOTAL_NO_DEPRE_AMT ?? 0,
    };
  }

  // 匯出固定送 PageSize/PageIndex = 0 取全部資料，避免只匯出第一頁
  private buildExportPayload(): QueryASS15030Request {
    return this.buildRequest({
      PageSize: 0,
      PageIndex: 0,
      SortBy: this.lastQueryBody?.SortBy,
    });
  }

  onExportPdf(): void {
    const request = this.buildExportPayload();
    const isDetail = this.queryForm.controls.reportStyle.value === '2';
    const export$ = isDetail
      ? this.ass15030Service.exportPDFASS15080Detail(request)
      : this.ass15030Service.exportPDFASS15080Sum(request);
    this.fileExportService
      .executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', v => (this.exportPdfLoading = v))
      .subscribe();
  }

  onExportExcel(): void {
    const request = this.buildExportPayload();
    const isDetail = this.queryForm.controls.reportStyle.value === '2';
    const export$ = isDetail
      ? this.ass15030Service.exportExcelASS15030Detail(request)
      : this.ass15030Service.exportExcelASS15030Sum(request);
    this.fileExportService
      .executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', v => (this.exportExcelLoading = v))
      .subscribe();
  }

  private toApiDateValue(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return undefined;
  }

  private toBaseYm(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = (value.getMonth() + 1).toString().padStart(2, '0');
      return `${y}${m}`;
    }
    if (typeof value === 'string') {
      const nums = value.replaceAll(/\D/g, '');
      if (nums.length >= 6) return nums.substring(0, 6);
    }
    return undefined;
  }
}
