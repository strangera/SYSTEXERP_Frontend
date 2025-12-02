import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { debounceTime, finalize, map } from 'rxjs/operators';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23020Service } from '../../../service/api/tls/tls23020.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import {
  createPaginationConfig,
  LazyLoadEvent,
} from '../../../shared/componentkit/table/table.model';
import { ValidationService } from '../../../shared/service/validation.service';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
@UntilDestroy()
@Component({
  selector: 'app-tls23020',
  templateUrl: './tls23020.component.html',
  styleUrls: ['./tls23020.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    DropdownComponent,
    CheckboxModule,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    // TableComponent,
    // Table2Component,
    ButtonModule,
    TableReportComponent, // ⬅️ 新增
    InputTextRangeComponent,
  ],
})
export class TLS23020Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  summaryData: any[] = [];
  readonly groupByField = 'groupKey';
  totalRecords = 0;

  btnLoading = false; // ✅ 匯出按鈕 loading
  historyRequestBody: any | null = null; // ✅ 記錄最近一次查詢 payload（匯出沿用）
  showSummary = false;

  // --- 排序狀態 ---
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 }, // ⬅️ 一定要第一個
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];

  // 後端是否接收分頁/排序（提供 OrderBy & SortBy）
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  private readonly includePagingAndSorting = true;
  isRowSelectable = (row: any) => !row?.__isBackendTotal;

  // Request
  queryForm = this.formBuilder.group({
    TXN_Month: [null],
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [],
    TXN_No_Start: [null, [this.validationService.numberValidator]],
    TXN_No_End: [null, [this.validationService.numberValidator]],
    TLT_No: [],
    TXN_GUINo: [''],
    TXN_SaleAmt_Start: [null],
    TXN_SaleAmt_End: [null],
    PLU_TaxType: [],
    PRM_TXN_DiscCode: [],
    TXN_DiscCode: [],
    tlt_id: [],
    PLU_MagNo: [],
    ACT_DiscCode: [],
    IsNoPLU_No: [false],
    rece_yn: [],
    cash_yn: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    showSummary: [false],
    ...createPaginationConfig([
      { field: this.groupByField, order: 1 },
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]),
  });

  // 下拉選單選項
  taxableOptions: any[] = [
    { value: '0', label: '免稅' },
    { value: '1', label: '應稅' },
  ];

  discountOptions = [
    { value: '000', label: '正品' },
    { value: '095', label: '95折' },
    { value: '090', label: '90折' },
    { value: '085', label: '85折' },
    { value: '080', label: '80折' },
    { value: '075', label: '75折' },
    { value: '070', label: '70折' },
    { value: '065', label: '65折' },
    { value: '060', label: '60折' },
    { value: '055', label: '55折' },
    { value: '050', label: '50折' },
    { value: '999', label: '特價' },
  ];
  deductionbigCategoryOptions = [
    { value: 0, label: '類別0' },
    { value: 1, label: '類別1' },
    { value: 2, label: '類別2' },
    { value: 3, label: '類別3' },
    { value: 4, label: '類別4' },
    { value: 5, label: '類別5' },
    { value: 6, label: '類別6' },
    { value: 7, label: '類別7' },
    { value: 8, label: '類別8' },
    { value: 9, label: '類別9' },
  ];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  whetherOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
    { value: null, label: '全部' },
  ];
  txnStatusOptions = [
    { value: 'N', label: '正常交易' },
    { value: 'C', label: '交易取消' },
    { value: 'D', label: '發票作廢' },
    { value: 'E', label: '隔日發票作廢' },
  ];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23020Service: TLS23020Service,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23020');
    this.queryForm.patchValue({ pageSize: 30 }, { emitEvent: false });
    this.queryForm.patchValue(
      { SortBy: this.defaultSort },
      { emitEvent: false },
    );

    this.queryForm.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => {
        this.queryStateService.setQueryState(
          this.ProgNo,
          this.queryForm.getRawValue(),
        );
      });

    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d: Date | null) => {
        if (!d || isNaN(new Date(d).getTime())) return;

        const { start, end } = this.getMonthRange(d);
        // 同步到「銷售日期」的起訖（避免觸發二次查詢所以不 emit）
        this.queryForm.patchValue(
          { TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 },
          { emitEvent: false },
        );
      });

    this.queryForm.controls.TXN_DateStart.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());

    this.queryForm.controls.TXN_DateEnd.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());

    // 初始化 sortMeta
    this.sortMeta = this.defaultSort.map((x) => ({ ...x }));

    // ===== 下面所有初始化資料訂閱都加上 untilDestroyed(this) =====
    this.tls11010Service
      .getBuildingOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.BUILDING_NO_Options = res));

    this.floorService
      .getFloors()
      .pipe(untilDestroyed(this))
      .subscribe((data) => (this.floorOptions = data));

    this.tls11010Service
      .getOrgOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.ECRNoService
      .getECRNo()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.ECRNoOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.counterNameService
      .getCounters()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.CounterOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });
  }

  fetchTLS23020 = (evt: LazyLoadEvent) => {
    // 把畫面上的查詢條件組 payload（你原本的 buildPayload）
    const condPayload = this.buildPayload(this.queryForm.getRawValue());
    const normSort = this.normalizeSortBy(evt?.SortBy, this.groupByField);
    // 只交付 pageIndex / pageSize / SortBy（你要求的三鍵）
    const payload = {
      ...condPayload,
      pageIndex: evt.pageIndex ?? 1,
      pageSize: evt.pageSize ?? 30,
      SortBy: this.toBackendSort(normSort),
    };

    // 呼叫原本的 service（此函式回傳 Observable 交由 table-report 訂閱，不在這裡 unsubscribe）
    return this.tls23020Service.queryTLS23020(payload).pipe(
      map((res: any) => {
        const wrappers = Array.isArray(res?.Data)
          ? res.Data
          : res?.Data
            ? [res.Data]
            : [];

        const rows: any[] = [];
        const totalAgg = {
          Total_TXN_SaleAmt: 0,
          Total_TXN_Net: 0,
          Total_TXN_Tax: 0,
          Total_TXN_Disc: 0,
        };
        const subMap: Record<string, Record<string, number>> = {};

        for (const w of wrappers) {
          totalAgg.Total_TXN_SaleAmt += Number(w?.Total_TXN_SaleAmt ?? 0);
          totalAgg.Total_TXN_Net += Number(w?.Total_TXN_Net ?? 0);
          totalAgg.Total_TXN_Tax += Number(w?.Total_TXN_Tax ?? 0);
          totalAgg.Total_TXN_Disc += Number(w?.Total_TXN_Disc ?? 0);

          const subTotals =
            w?.tLS23020_SubTotals ??
            w?.TLS23020_SubTotals ??
            w?.tls23020_SubTotals ??
            [];
          if (!Array.isArray(subTotals)) continue;

          for (const st of subTotals) {
            const details =
              st?.tLS23020_Details ??
              st?.TLS23020_Details ??
              st?.tls23020_Details ??
              [];

            // 🔑 用每筆明細的「銷售日期(YYYY/MM/DD)+ECR_No+TXN_No」當作群組鍵
            //    若一個小計裡有多筆不同鍵，會分別累加到各自 groupKey。
            for (const item of Array.isArray(details) ? details : []) {
              const dateKey = String(item.TXN_Date ?? '').slice(0, 19);
              const _rowKey = `${dateKey}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;

              const ymd = this.formatYMD(item.TXN_Date);
              const groupKey = `${ymd}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;

              // 累加對應 groupKey 的小計（給需要顯示外部小計時可用；如果交給 table 自動算也沒關係）
              const curr = subMap[groupKey] ?? {
                Subtotal_TXN_SaleAmt: 0,
                Subtotal_TXN_Net: 0,
                Subtotal_TXN_Tax: 0,
                Subtotal_TXN_Disc: 0,
              };
              curr['Subtotal_TXN_SaleAmt'] += Number(item?.TXN_SaleAmt ?? 0);
              curr['Subtotal_TXN_Net'] += Number(item?.TXN_Net ?? 0);
              curr['Subtotal_TXN_Tax'] += Number(item?.TXN_Tax ?? 0);
              curr['Subtotal_TXN_Disc'] += Number(item?.TXN_Disc ?? 0);
              subMap[groupKey] = curr;

              rows.push({ ...item, _rowKey, groupKey });
            }
          }
        }

        const candidates = [
          res?.TotalCount,
          res?.Data?.TotalCount,
          Array.isArray(res?.Data) ? res?.Data?.[0]?.TotalCount : undefined,
          wrappers?.[0]?.TotalCount,
        ];
        const totalRecords =
          candidates
            .map((n) => Number(n))
            .find((n) => Number.isFinite(n) && n >= 0) ?? rows.length;

        return {
          rows,
          totalRecords,
          externalTotals: totalAgg,
          externalSubtotals: subMap,
        };
      }),
    );
  };

  /** 後端可吃的排序：移除 groupKey，確保 TXN_Date、ECR_No、TXN_No 排在最前 */
  private toBackendSort(sortBy: any[] | undefined) {
    const src = (Array.isArray(sortBy) ? sortBy : []).filter(
      (s) => s?.field && s.field !== 'groupKey',
    );

    // 沒帶就補上三個預設
    const need = (f: string) => !src.some((s) => s.field === f);
    if (need('TXN_Date')) src.unshift({ field: 'TXN_Date', order: 1 });
    if (need('ECR_No')) src.push({ field: 'ECR_No', order: 1 });
    if (need('TXN_No')) src.push({ field: 'TXN_No', order: 1 });

    // 去重
    const seen = new Set<string>();
    const dedup: any[] = [];
    for (const s of src) {
      if (seen.has(s.field)) continue;
      seen.add(s.field);
      dedup.push({ field: String(s.field), order: s.order === -1 ? -1 : 1 });
    }
    return dedup;
  }

  public queryTLS23020ForReport = (body: any) =>
    this.tls23020Service
      .queryTLS23020({
        ...(body || {}),
        // ✅ 確保 DateOnly
        TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
        // ✅ 後端可吃的排序
        SortBy: this.toBackendSort(body?.SortBy),
        pageIndex: body?.pageIndex ?? 1,
        pageSize: body?.pageSize ?? 30,
      })
      .pipe(
        map((res: any) => {
          // 兼容 Data 可能為物件或陣列
          const wrappers = Array.isArray(res?.Data)
            ? res.Data
            : res?.Data
              ? [res.Data]
              : [];

          const rows: any[] = [];

          // 總計（由 wrapper 的合計欄位累加）
          const totalAgg = {
            Total_TXN_SaleAmt: 0,
            Total_TXN_Net: 0,
            Total_TXN_Tax: 0,
            Total_TXN_Disc: 0,
          };

          for (const w of wrappers) {
            totalAgg.Total_TXN_SaleAmt += Number(w?.Total_TXN_SaleAmt ?? 0);
            totalAgg.Total_TXN_Net += Number(w?.Total_TXN_Net ?? 0);
            totalAgg.Total_TXN_Tax += Number(w?.Total_TXN_Tax ?? 0);
            totalAgg.Total_TXN_Disc += Number(w?.Total_TXN_Disc ?? 0);

            const subTotals =
              w?.tLS23020_SubTotals ??
              w?.TLS23020_SubTotals ??
              w?.tls23020_SubTotals ??
              [];

            for (const st of Array.isArray(subTotals) ? subTotals : []) {
              const details =
                st?.tLS23020_Details ??
                st?.TLS23020_Details ??
                st?.tls23020_Details ??
                [];

              for (const item of Array.isArray(details) ? details : []) {
                // _rowKey：用 ISO yyyy-MM-ddTHH:mm:ss + ECR_No + TXN_No
                const dateKey = String(item.TXN_Date ?? '').slice(0, 19);
                const _rowKey = `${dateKey}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;

                // groupKey：用 畫面顯示的 YYYY/MM/DD + ECR_No + TXN_No 作為分組鍵
                const ymd = this.formatYMD(item.TXN_Date);
                const groupKey = `${ymd}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;

                rows.push({ ...item, _rowKey, groupKey });
              }
            }
          }

          // 兼容多種 TotalCount 位置
          const candidates = [
            res?.TotalCount,
            res?.Data?.TotalCount,
            Array.isArray(res?.Data) ? res?.Data?.[0]?.TotalCount : undefined,
            wrappers?.[0]?.TotalCount,
          ];
          const totalRecords =
            candidates
              .map((n) => Number(n))
              .find((n) => Number.isFinite(n) && n >= 0) ?? rows.length;

          const GrandTotal = totalAgg;

          // （可選）同步到頁尾顯示容器
          this.detailTotals = { ...GrandTotal };

          // 交給 app-table-report
          return { Data: rows, TotalCount: totalRecords, GrandTotal };
        }),
      );

  onSubmit(form: FormGroup): void {
    // 記錄查詢狀態（你原本就有）
    this.queryStateService.setQueryState(
      this.ProgNo,
      this.queryForm.getRawValue(),
    );

    this.handleSubmit(form, () => {
      // ① 組 payload（條件 + 分頁/排序）
      const condPayload = this.buildPayload(this.queryForm.getRawValue());
      const pageIndex = form.value?.pageIndex ?? 1;
      const pageSize = form.value?.pageSize ?? 30;

      // (可能含 groupKey) 的排序，統一轉成後端可吃
      const rawSort = Array.isArray(form.value?.SortBy)
        ? form.value.SortBy
        : this.defaultSort;
      const sortBy = this.toBackendSort(rawSort);

      const payload = {
        ...condPayload,
        pageIndex,
        pageSize,
        SortBy: sortBy,
      };

      // 匯出沿用（確保排序一致）
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      const isSummary = !!this.queryForm.get('showSummary')?.value;

      if (isSummary) {
        // ================= 彙總查詢 =================
        this.tls23020Service
          .queryTLS23020Summary(payload)
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.loading = false;
              this.messageService?.unblockUi();
            }),
          )
          .subscribe({
            next: (res: any) => {
              const arr = Array.isArray(res?.Data?.QueryData)
                ? res.Data.QueryData
                : [];
              this.summaryData = arr.map((r: any, i: number) => ({
                ...r,
                _rowKey: `${r?.tlt_no ?? ''}|${r?.tlt_name ?? ''}|${i}`,
              }));
              this.totalRecords = this.summaryData.length;

              // 清空明細與加總容器
              this.data = [];
              this.detailTotals = {};
              this.detailSubtotals = {};
            },
            error: (err) => {
              console.error('TLS23020 Summary 查詢失敗', err);
              this.summaryData = [];
              this.totalRecords = 0;
              this.data = [];
              this.detailTotals = {};
              this.detailSubtotals = {};
            },
          });

        return;
      }

      // ================= 明細查詢（只塞當頁資料） =================
      this.tls23020Service
        .queryTLS23020(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          }),
        )
        .subscribe({
          next: (res: any) => {
            // 兼容 Data 可能是物件或陣列
            const wrappers = Array.isArray(res?.Data)
              ? res.Data
              : res?.Data
                ? [res.Data]
                : [];

            const pageRows: any[] = [];

            // 總計聚合（避免多個 wrapper）
            const totalAgg = {
              Total_TXN_SaleAmt: 0,
              Total_TXN_Net: 0,
              Total_TXN_Tax: 0,
              Total_TXN_Disc: 0,
            };

            for (const w of wrappers) {
              totalAgg.Total_TXN_SaleAmt += Number(w?.Total_TXN_SaleAmt ?? 0);
              totalAgg.Total_TXN_Net += Number(w?.Total_TXN_Net ?? 0);
              totalAgg.Total_TXN_Tax += Number(w?.Total_TXN_Tax ?? 0);
              totalAgg.Total_TXN_Disc += Number(w?.Total_TXN_Disc ?? 0);

              const subTotals =
                w?.tLS23020_SubTotals ??
                w?.TLS23020_SubTotals ??
                w?.tls23020_SubTotals ??
                [];

              if (!Array.isArray(subTotals)) continue;

              for (const st of subTotals) {
                const details =
                  st?.tLS23020_Details ??
                  st?.TLS23020_Details ??
                  st?.tls23020_Details ??
                  [];

                for (const item of Array.isArray(details) ? details : []) {
                  // _rowKey：ISO yyyy-MM-ddTHH:mm:ss + ECR_No + TXN_No（穩定唯一）
                  const dateKey = String(item.TXN_Date ?? '').slice(0, 19);
                  const _rowKey = `${dateKey}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;

                  // groupKey：畫面分組鍵 = YYYY/MM/DD + ECR_No + TXN_No
                  const ymd = this.formatYMD(item.TXN_Date);
                  const groupKey = `${ymd}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;

                  pageRows.push({ ...item, _rowKey, groupKey });
                }
              }
            }

            // 套進畫面（data=當頁, totalRecords=總筆數）
            this.data = pageRows;
            this.summaryData = [];

            // 後端總筆數多種位置的兼容讀取（取到第一個有效值）
            const candidates = [
              res?.TotalCount,
              res?.Data?.TotalCount,
              Array.isArray(res?.Data) ? res?.Data?.[0]?.TotalCount : undefined,
              wrappers?.[0]?.TotalCount,
            ];
            const firstValid = candidates
              .map((n) => Number(n))
              .find((n) => Number.isFinite(n) && n >= 0);

            this.totalRecords = firstValid ?? pageRows.length;

            // 表尾用後端總計
            this.detailTotals = totalAgg;

            // 小計交給 table-report 依 groupKey 自動計算；不再維護本地 map
            this.detailSubtotals = {};
          },
          error: (err) => {
            console.error('TLS23020 明細查詢失敗', err);
            this.data = [];
            this.summaryData = [];
            this.totalRecords = 0;
            this.detailTotals = {};
            this.detailSubtotals = {};
          },
        });
    });
  }

  detailTotalFieldMap: Record<string, string> = {
    TXN_SaleAmt: 'Total_TXN_SaleAmt',
    TXN_Net: 'Total_TXN_Net',
    TXN_Tax: 'Total_TXN_Tax',
    TXN_Disc: 'Total_TXN_Disc',
  };

  buildFooterFromTotals(): Record<string, any> | undefined {
    if (!this.detailTotals) return undefined;
    return {
      TXN_SaleAmt: this.detailTotals['Total_TXN_SaleAmt'] ?? 0,
      TXN_Net: this.detailTotals['Total_TXN_Net'] ?? 0,
      TXN_Tax: this.detailTotals['Total_TXN_Tax'] ?? 0,
      TXN_Disc: this.detailTotals['Total_TXN_Disc'] ?? 0,
    };
  }

  /** 組查詢 payload（含排序＆分頁鍵） */
  /** 組查詢 payload（含排序＆分頁鍵） */
  private buildPayload(val: any) {
    // ✅ 用 DateOnly（yyyy-MM-dd）
    const toDateOnly = (x: any) => this.toDateOnly(x);

    const asStrArr = (x: any) =>
      Array.isArray(x) ? x.map(String) : x == null || x === '' ? undefined : [String(x)];
    const asNum = (x: any) =>
      x == null || x === '' || isNaN(Number(x)) ? undefined : Number(x);

    const o: any = {
      // ⬇⬇⬇ 這兩行改成 DateOnly
      TXN_DateStart: toDateOnly(val?.TXN_DateStart),
      TXN_DateEnd: toDateOnly(val?.TXN_DateEnd),

      ECR_No: asStrArr(val?.ECR_No),
      TXN_No_Start: asNum(val?.TXN_No_Start),
      TXN_No_End: asNum(val?.TXN_No_End),
      TLT_No: asStrArr(val?.TLT_No),
      TXN_GUINo: (val?.TXN_GUINo ?? '').toString().trim() || undefined,
      TXN_SaleAmt_Start: asNum(val?.TXN_SaleAmt_Start),
      TXN_SaleAmt_End: asNum(val?.TXN_SaleAmt_End),
      PLU_TaxType: val?.PLU_TaxType == null || val?.PLU_TaxType === '' ? undefined : String(val.PLU_TaxType),
      TXN_DiscCode: asStrArr(val?.TXN_DiscCode),
      PRM_TXN_DiscCode: asStrArr(val?.PRM_TXN_DiscCode),
      tlt_id: asStrArr(val?.tlt_id),
      PLU_MagNo: (val?.PLU_MagNo ?? '').toString().trim() || undefined,
      IsNoPLU_No: !!val?.IsNoPLU_No,
      rece_yn: val?.rece_yn == null || val?.rece_yn === '' ? undefined : String(val.rece_yn),
      cash_yn: val?.cash_yn == null || val?.cash_yn === '' ? undefined : String(val.cash_yn),
      tlt_building: asStrArr(val?.tlt_building),
      tlt_floor: asStrArr(val?.tlt_floor),
      org_id: asStrArr(val?.org_id),
    };

    if (this.includePagingAndSorting) {
      o.pageIndex = val?.pageIndex ?? 1;
      o.pageSize = val?.pageSize ?? 30;
      o.SortBy = Array.isArray(val?.SortBy) ? val.SortBy : undefined;
    }

    Object.keys(o).forEach((k) => {
      const v = o[k];
      if (v === undefined || v === '') delete o[k];
      if (Array.isArray(v) && v.length === 0) delete o[k];
    });
    return o;
  }

  /** 將日期控制項轉成後端要的 yyyy-MM-ddTHH:mm:ss（本地時間、去時區偏移） */
  private toIso(val: any): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }

  // ===== 小工具 =====
  public queryTLS23020SummaryForReport = (body: any) =>
    this.tls23020Service.queryTLS23020Summary({
      ...(body || {}),
      // ✅ 確保 DateOnly
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    }).pipe(
      map((res: any) => {
        // 後端回來的是 Data.QueryData（依你現有程式）
        const arr = Array.isArray(res?.Data?.QueryData)
          ? res.Data.QueryData
          : [];

        // rows 直接就是彙總列
        const rows = arr.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r?.tlt_no ?? ''}|${r?.tlt_name ?? ''}|${i}`,
        }));

        // 你若有後端總計欄位可組 GrandTotal，沒有就給空物件
        // 也可以自己把 rows 加總出 GrandTotal（依需求）
        const GrandTotal = {}; // 或計算合計：{ TXN_TotTax: sum(...), ... }

        const totalRecords = rows.length;
        return { Data: rows, TotalCount: totalRecords, GrandTotal };
      }),
    );

  formatYMD = (val: unknown): string => {
    if (val == null) return '';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    const s = String(val);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;

    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${y}/${mm}/${dd}`;
    }
    return s;
  };

  money = (val: any) => Number(val || 0).toLocaleString('en-US');

  private makeBackendTotalRow(src: any) {
    return {
      _rowKey: '__TOTAL__',
      tlt_name: '總計',
      TXN_SaleAmt: Number(src?.Subtotal_TXN_SaleAmt ?? 0),
      TXN_Net: Number(src?.Subtotal_TXN_Net ?? 0),
      TXN_Tax: Number(src?.Subtotal_TXN_Tax ?? 0),
      TXN_Disc: Number(src?.Subtotal_TXN_Disc ?? 0),
      __isBackendTotal: true,
    };
  }

  onToggleSummary() {
    this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  private padTxnNo(v: any): string {
    const s = String(v ?? '').trim();
    return s ? s.padStart(6, '0') : '';
  }

  // ===== 表格欄位 =====
  columns = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: this.formatYMD,
    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    {
      field: 'TXN_No',
      header: '交易序號',
      visible: true,
      format: (v: any) => this.padTxnNo(v),
    },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },

    // ✅ 這些會在 footer / groupfooter 顯示總計/小計
    {
      field: 'TXN_SaleAmt',
      header: '單項售價',
      visible: true,
      style: 'text-right',
      format: this.money,
      isTotal: true,
      isSubTotal: true,
    },
    {
      field: 'TXN_Net',
      header: '未稅(免稅)金額',
      visible: true,
      style: 'text-right',
      format: this.money,
      isTotal: true,
      isSubTotal: true,
    },
    {
      field: 'TXN_Tax',
      header: '稅額',
      visible: true,
      style: 'text-right',
      format: this.money,
      isTotal: true,
      isSubTotal: true,
    },
    {
      field: 'TXN_Disc',
      header: '折扣金額',
      visible: true,
      style: 'text-right',
      format: this.money,
      isTotal: true,
      isSubTotal: true,
    },
    { field: 'tlt_id', header: '抽成別代號', visible: true },
    { field: 'tlt_id_desc', header: '商品抽成類別', visible: true },
    { field: 'PRM_TXN_DiscName', header: '原折扣', visible: true },
    { field: 'TXN_DiscName', header: '歸屬折扣名稱', visible: true },

    { field: 'PLU_TaxTypeName', header: '稅別名稱', visible: true },
    { field: 'PLU_MagNo', header: '單品編號', visible: true },
    { field: 'TXN_StatusName', header: '狀態', visible: true },
  ];

  summaryColumns = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: this.formatYMD,
    },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '銷售金額(含稅)',
      visible: true,
      style: 'text-right',
      format: this.money,
    },
    {
      field: 'TXN_TotNet',
      header: '未稅(免稅)金額',
      visible: true,
      style: 'text-right',
      format: this.money,
    },
    {
      field: 'TXN_TotTax',
      header: '稅額',
      visible: true,
      style: 'text-right',
      format: this.money,
      isTotal: true,
    },
  ];

  // ① 後端總計（表尾）
  detailTotals: Record<string, number> = {};

  // ② 後端小計（群組尾）
  detailSubtotals: Record<string, Record<string, number>> = {};
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_SaleAmt: 'Subtotal_TXN_SaleAmt',
    TXN_Net: 'Subtotal_TXN_Net',
    TXN_Tax: 'Subtotal_TXN_Tax',
    TXN_Disc: 'Subtotal_TXN_Disc',
  };

  // ========= 匯出 =========
  private buildExportBody(): any {
    const src = this.historyRequestBody ?? {};
    const { pageIndex, pageSize, ...body } = src;
    return body;
  }

  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;

    const body = this.buildExportBody();
    const isSummary = !!this.queryForm.get('showSummary')?.value;

    const obs = isSummary
      ? this.tls23020Service.exportTLS23020SummaryPDF(body)
      : this.tls23020Service.exportTLS23020PDF(body);

    obs
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.btnLoading = false)),
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) =>
          this.handleFileExport(response, '.pdf'),
      });
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;

    const body = this.buildExportBody();
    const isSummary = !!this.queryForm.get('showSummary')?.value;

    const obs = isSummary
      ? this.tls23020Service.exportTLS23020SummaryExcel(body)
      : this.tls23020Service.exportTLS23020Excel(body);

    obs
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.btnLoading = false)),
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) =>
          this.handleFileExport(response, '.xlsx'),
      });
  }

  private handleFileExport(
    response: HttpResponse<Blob>,
    fileExtension: string,
  ): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(
      contentDisposition,
      fileExtension,
    );
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.(
        '沒有找到符合條件的資料，無法生成報表。',
      );
    }
  }

  private getFilenameFromHeader(
    contentDisposition: string | null,
    defaultExtension: string,
  ): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(
          encodedFilename.replace(/^UTF-8''/, ''),
        );
        return decoded;
      } catch {
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }

  private ensureGroupFirst(sortBy: any[] | undefined): any[] {
    const g = this.groupByField;
    const list = Array.isArray(sortBy) ? [...sortBy] : [];
    const exist = list.find((s) => s.field === g);
    const rest = list.filter((s) => s.field !== g);
    // 若使用者有選過群組欄位，就沿用它的 order；否則預設 ASC
    const order = exist?.order ?? 1;
    return [{ field: g, order }, ...rest];
  }

  /** 取得某日期所在月份的起訖（start: 1號 00:00:00, end: 當月最後一天 23:59:59） */
  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-based
    const start = new Date(year, month, 1, 0, 0, 0); // 1號 00:00:00
    const end = new Date(year, month + 1, 0, 23, 59, 59); // 當月最後一天 23:59:59
    return { start, end };
  }

  /** 若目前銷售日期不是「完整整月」，就把 TXN_Month 清空（避免顯示誤會） */
  private clearMonthIfNotExactRange() {
    const start: Date | null = this.queryForm.value.TXN_DateStart ?? null;
    const end: Date | null = this.queryForm.value.TXN_DateEnd ?? null;
    if (!start || !end) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
      return;
    }
    const { start: mStart, end: mEnd } = this.getMonthRange(start);
    const sameStart = new Date(start).getTime() === mStart.getTime();
    const sameEnd = new Date(end).getTime() === mEnd.getTime();
    if (!sameStart || !sameEnd) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
    }
  }

  private normalizeSortBy(
    input: any,
    groupField: string,
  ): Array<{ field: string; order: 1 | -1 }> {
    const list: any[] = Array.isArray(input) ? input : [];
    const cleaned: Array<{ field: string; order: 1 | -1 }> = [];

    for (const s of list) {
      // 1) 取出欄位名稱：若是陣列就拿第一個，最後強制轉字串
      let f: any = s?.field;
      if (Array.isArray(f)) f = f[0];
      const field = (f ?? '').toString().trim();
      if (!field) continue;

      // 2) 正規化排序方向：只接受 1/-1
      const ord: number = Number(s?.order);
      const order: 1 | -1 = ord === -1 ? -1 : 1;

      cleaned.push({ field, order });
    }

    // 3) 去除重複 field（保留第一次出現的）
    const seen = new Set<string>();
    const dedup: Array<{ field: string; order: 1 | -1 }> = [];
    for (const s of cleaned) {
      if (seen.has(s.field)) continue;
      seen.add(s.field);
      dedup.push(s);
    }

    // 4) 確保群組欄位在第一個（沿用原本若已有的排序方向，否則預設 ASC）
    const exist = dedup.find((x) => x.field === groupField);
    const order = exist?.order ?? 1;
    const rest = dedup.filter((x) => x.field !== groupField);
    return [{ field: groupField, order }, ...rest];
  }
  // 1) 新增這個工具函式（放在 component 裡即可）
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    // 輸出 yyyy-MM-dd（只有日期、無時間/時區）
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
