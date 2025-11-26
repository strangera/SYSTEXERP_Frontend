/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23090Service } from '../../../service/api/tls/tls23090.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { CommonModule, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

import { HttpResponse } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';

import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls23090',
  templateUrl: './tls23090.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    ButtonModule,
    NgIf,
    TableReportComponent,
  ],
})
export class TLS23090Component extends BasicQueryPageComponent<any> {
  /* ----------------- 狀態 ----------------- */
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;

  // 匯出沿用最後一次查詢的 payload + 提供給 app-table-report 的 lastQueryBody
  historyRequestBody: any | null = null;

  // ✅ 總計列暫存（由兩個 queryFunction 同步）
  private grandTotal: Record<string, number> = {};

  // 檢視模式（信用卡明細 / 專櫃卡別分析）
  private _viewMode: 'credit' | 'counter' = 'credit';
  get viewMode(): 'credit' | 'counter' { return this._viewMode; }
  set viewMode(v: 'credit' | 'counter') {
    if (this._viewMode === v) return;
    this._viewMode = v;
    this.applyViewMode();
  }

  // 排序
  readonly defaultSortCredit = [
    { field: 'TXN_Date', order: 1 as 1 | -1 },
    { field: 'ECR_No', order: 1 as 1 | -1 },
    { field: 'TXN_No', order: 1 as 1 | -1 },
  ];
  readonly defaultSortCounter = [
    { field: 'TXN_Date', order: 1 as 1 | -1 },
    { field: 'ECR_No', order: 1 as 1 | -1 },
    { field: 'tlt_no', order: 1 as 1 | -1 },
  ];
  sortMeta: any[] = [];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [],
    tlt_no: [],
    CRD_Type: [[]],
    CRD_No: [],
    TXN_PayAmt: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    TERM_No: [],
    Acquirer: [[]],
    ConnStatus: [],
    IsHaveTERM_No: [null],
    ...createPaginationConfig([
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]),
  });

  /* ----------------- 下拉選項 ----------------- */
  cardTypeOptions = getSYS1000Options('CREDIT_CRD_Type');
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions: any[] = [];
  installmentPeriodOptions = getSYS1000Options('T109');
  acquiringBankOptions = getSYS1000Options('T113');
  connectionStatusOptions: any[] = [
    { value: '1', label: '連線' },
    { value: '2', label: '離線' },
  ];

  constructor(
    private tls23090Service: TLS23090Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  /* ----------------- 總計對應 ----------------- */
  private readonly creditTotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'TotalPayAmt',
    TXN_Point: 'TotalPoint',
    EDC_InstHeadAmt: 'TotalInstHeadAmt',
    EDC_InstEachAmt: 'TotalInstEachAmt',
  };

  private readonly counterTotalFieldMap: Record<string, string> = {
    AE_Count: 'TOTAL_AE_Count', AE_Amount: 'TOTAL_AE_Amount',
    DA_Count: 'TOTAL_DA_Count', DA_Amount: 'TOTAL_DA_Amount',
    MASTER_Count: 'TOTAL_MASTER_Count', MASTER_Amount: 'TOTAL_MASTER_Amount',
    VISA_Count: 'TOTAL_VISA_Count', VISA_Amount: 'TOTAL_VISA_Amount',
    JCB_Count: 'TOTAL_JCB_Count', JCB_Amount: 'TOTAL_JCB_Amount',
    UnionPay_Count: 'TOTAL_UnionPay_Count', UnionPay_Amount: 'TOTAL_UnionPay_Amount',
    Others_Count: 'TOTAL_Others_Count', Others_Amount: 'TOTAL_Others_Amount',
    Total_Count: 'TOTAL_Total_Count', Total_Amount: 'TOTAL_Total_Amount',
  };

  /* ★ 排序欄位 alias：送 API 時把欄位改成後端要的名稱 ----------------- */
  private readonly sortFieldAliasMap: Record<string, string> = {
    Others_Amount: 'O_Amount',
    Others_Count: 'O_Count',
    Total_Amount: 'Amount',
    Total_Count: 'Count',
  };

  private mapSortFields(sortBy: any[] | undefined | null): any[] | undefined {
    if (!Array.isArray(sortBy)) return sortBy ?? undefined;
    return sortBy.map(s => ({
      ...s,
      field: this.sortFieldAliasMap[s.field] ?? s.field,
    }));
  }
  /* ---------------------------------------------------------------- */

  /* ----------------- 欄位設定（依模式切換） ----------------- */
  columns: any[] = [];

  private columnsCredit = [
    { field: 'TXN_Date', header: '銷售日期', format: (v: any) => this.formatDate(v), visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },

    { field: 'TXN_PayAmt', header: '金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
    { field: 'TXN_Point', header: '紅利', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'TERM_Name', header: '分期期數', visible: true },
    { field: 'EDC_InstHeadAmt', header: '頭期款分期金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
    { field: 'EDC_InstEachAmt', header: '每期分期金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
  ];

  /**
   * 方法2：移除 groupField，將多層表頭改為單層欄位，以避免 p-table 計算 scroll 高度出錯
   */
  private columnsCounter = [
    { field: 'TXN_Date', header: '銷售日期', format: (v: any) => this.formatDate(v), visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃編號/名稱', visible: true, style: 'text-left' },

    // AE
    { field: 'AE_Count', header: 'AE 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'AE_Amount', header: 'AE 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    // DA
    { field: 'DA_Count', header: 'DA 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'DA_Amount', header: 'DA 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    // MASTER
    { field: 'MASTER_Count', header: 'MASTER 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'MASTER_Amount', header: 'MASTER 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    // VISA
    { field: 'VISA_Count', header: 'VISA 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'VISA_Amount', header: 'VISA 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    // JCB
    { field: 'JCB_Count', header: 'JCB 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'JCB_Amount', header: 'JCB 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    // UnionPay
    { field: 'UnionPay_Count', header: 'UnionPay 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'UnionPay_Amount', header: 'UnionPay 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    // Others
    { field: 'Others_Count', header: '其他 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'Others_Amount', header: '其他 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    // Total
    { field: 'Total_Count', header: '合計 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'Total_Amount', header: '合計 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
  ];

  /* ----------------- 生命週期 ----------------- */
  ngOnInit(): void {
    this.initializePage('TLS23090', 'tls/tls23090cru', this.queryForm, (form) => this.onSubmit(form));

    // 預設信用卡明細
    this.sortMeta = this.defaultSortCredit.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });
    this.columns = this.columnsCredit;

    // 下拉選項
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.ECRNoService.getECRNo().subscribe(res => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const defaultSort = this.viewMode === 'counter'
        ? this.defaultSortCounter
        : this.defaultSortCredit;

      const rawSortByArr: any[] =
        (Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy :
          (this.sortMeta.length ? this.sortMeta : defaultSort)).map((s: any) => ({ ...s }));

      // ★ 送 API 前，把欄位名稱轉成後端要的 alias
      const sortByArr = this.mapSortFields(rawSortByArr);

      const payloadBase = this.prune({
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart ?? this.yesterday),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd ?? this.yesterday),

        ECR_No: this.ensureArr(val?.ECR_No),
        TLT_No: this.ensureArr(val?.tlt_no),
        CRD_Type: this.ensureArr(val?.CRD_Type),
        CRD_No: (val?.CRD_No ?? '') || undefined,
        TXN_PayAmt: (val?.TXN_PayAmt === '' || val?.TXN_PayAmt == null) ? undefined : Number(val.TXN_PayAmt),

        tlt_building: (val?.tlt_building ?? '') || undefined,
        tlt_floor: this.ensureArr(val?.tlt_floor),
        org_id: this.ensureArr(val?.org_id),

        IsHaveTERM_No: this.toBoolOrNull(val?.IsHaveTERM_No),
        TERM_No: this.ensureArr(val?.TERM_No),
        Acquirer: this.ensureArr(val?.Acquirer),
        Conn_Status: (val?.ConnStatus ?? '') || undefined,

        SortBy: sortByArr,
      });

      // ✅ 只送小寫
      const pageIndex = Number(val?.pageIndex) || 1;
      const pageSize = 30;
      const payload = {
        ...payloadBase,
        pageIndex,
        pageSize,
      };

      // 提供給 app-table-report（也只存小寫，避免外流大寫）
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      const call$ = this.viewMode === 'counter'
        ? this.tls23090Service.queryTLS23090CounterCard(payload)
        : this.tls23090Service.queryTLS23090(payload);

      call$.pipe(finalize(() => {
        this.loading = false;
        this.messageService?.unblockUi();
      })).subscribe({
        next: (res: any) => {
          if (this.viewMode === 'counter') {
            const items: any[] =
              Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
                Array.isArray(res?.Data) ? res.Data :
                  [];

            const pick = (obj: any, brand: string, field: 'Count' | 'Amount') =>
              Number(obj?.[brand]?.[field] ?? 0);

            const rows = items.map((r: any, i: number) => {
              const list = r?.CRD_Type_List || {};
              return {
                TXN_Date: r?.TXN_Date,
                ECR_No: r?.ECR_No,
                tlt_no: r?.tlt_no,
                tlt_name: r?.tlt_name,

                AE_Count: pick(list, 'AE', 'Count'), AE_Amount: pick(list, 'AE', 'Amount'),
                DA_Count: pick(list, 'DA', 'Count'), DA_Amount: pick(list, 'DA', 'Amount'),
                MASTER_Count: pick(list, 'MASTER', 'Count'), MASTER_Amount: pick(list, 'MASTER', 'Amount'),
                VISA_Count: pick(list, 'VISA', 'Count'), VISA_Amount: pick(list, 'VISA', 'Amount'),
                JCB_Count: pick(list, 'JCB', 'Count'), JCB_Amount: pick(list, 'JCB', 'Amount'),
                UnionPay_Count: pick(list, 'UnionPay', 'Count'), UnionPay_Amount: pick(list, 'UnionPay', 'Amount'),
                Others_Count: pick(list, 'Others', 'Count'), Others_Amount: pick(list, 'Others', 'Amount'),
                Total_Count: pick(list, 'Total', 'Count'), Total_Amount: pick(list, 'Total', 'Amount'),

                _rowKey: `cnt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
              };
            });

            this.columns = this.columnsCounter;
            this.data = rows;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

            const summary = res?.Data?.Summary ?? null;
            this.grandTotal = summary
              ? this.summaryToCounterGrandTotal(summary)
              : this.computeCounterGrandTotal(res);
          } else {
            const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);
            const takeDetails = (w: any) =>
              w?.tLS23090_CreditDetails ?? w?.TLS23090_CreditDetails ?? w?.CreditDetails ?? w?.Details ?? [];

            const rows = wrappers
              .flatMap((w: any) => Array.isArray(takeDetails(w)) ? takeDetails(w) : [])
              .map((r: any, idx: number) => ({
                ...r,
                _rowKey: `crt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.TXN_No ?? idx}`,
              }));

            this.columns = this.columnsCredit;
            this.data = rows;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

            this.grandTotal = this.computeCreditGrandTotal(wrappers);
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.grandTotal = {};
        },
      });
    });
  }


  /* ----------------- 給 app-table-report 的查詢函式（統一送大小寫分頁參數） ----------------- */

  /** 信用卡明細（✅ 產出 GrandTotal；僅在 pageIndex===1 同步到 this.grandTotal） */
  public queryTLS23090CreditForReport = (body: any) => {
    // ★ 報表查詢一樣要把 SortBy 欄位轉 alias
    const apiSortBy = this.mapSortFields(body?.SortBy);

    return this.tls23090Service
      .queryTLS23090({
        ...(body || {}),
        SortBy: apiSortBy,
        // ✅ 只補小寫
        TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
        pageSize: body?.pageSize ?? 30,
        pageIndex: body?.pageIndex ?? 1,
        // ⛔ 不再送 PageSize / PageIndex
      })
      .pipe(
        map((res: any) => {
          const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);
          const takeDetails = (w: any) =>
            w?.tLS23090_CreditDetails ?? w?.TLS23090_CreditDetails ?? w?.CreditDetails ?? w?.Details ?? [];

          const rows = wrappers
            .flatMap((w: any) => Array.isArray(takeDetails(w)) ? takeDetails(w) : [])
            .map((r: any, idx: number) => ({
              ...r,
              _rowKey: `crt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.TXN_No ?? idx}`,
            }));

          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          const grand: Record<string, number> = {};
          Object.entries(this.creditTotalFieldMap).forEach(([field, apiKey]) => {
            const sum = wrappers.reduce((acc: number, w: any) => acc + Number(w?.[apiKey] ?? 0), 0);
            grand[field] = sum;
          });

          const isFirstPage = !body?.pageIndex || Number(body?.pageIndex) === 1;
          if (isFirstPage) this.grandTotal = { ...grand };

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );
  }

  /** 專櫃卡別分析（✅ 產出 GrandTotal；僅在 pageIndex===1 同步到 this.grandTotal） */
  public queryTLS23090CounterForReport = (body: any) => {
    // ★ 專櫃卡別分析的報表排序也要轉 alias
    const apiSortBy = this.mapSortFields(body?.SortBy);

    return this.tls23090Service
      .queryTLS23090CounterCard({
        ...(body || {}),
        SortBy: apiSortBy,
        // ✅ 只送小寫
        pageSize: body?.pageSize ?? 30,
        pageIndex: body?.pageIndex ?? 1,
        // ⛔ 不送 PageSize / PageIndex
      })
      .pipe(
        map((res: any) => {
          const items: any[] =
            Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
              Array.isArray(res?.Data) ? res.Data :
                [];

          const pick = (obj: any, brand: string, field: 'Count' | 'Amount') =>
            Number(obj?.[brand]?.[field] ?? 0);

          const rows = items.map((r: any, i: number) => {
            const list = r?.CRD_Type_List || {};
            return {
              TXN_Date: r?.TXN_Date,
              ECR_No: r?.ECR_No,
              tlt_no: r?.tlt_no,
              tlt_name: r?.tlt_name,

              AE_Count: pick(list, 'AE', 'Count'), AE_Amount: pick(list, 'AE', 'Amount'),
              DA_Count: pick(list, 'DA', 'Count'), DA_Amount: pick(list, 'DA', 'Amount'),
              MASTER_Count: pick(list, 'MASTER', 'Count'), MASTER_Amount: pick(list, 'MASTER', 'Amount'),
              VISA_Count: pick(list, 'VISA', 'Count'), VISA_Amount: pick(list, 'VISA', 'Amount'),
              JCB_Count: pick(list, 'JCB', 'Count'), JCB_Amount: pick(list, 'JCB', 'Amount'),
              UnionPay_Count: pick(list, 'UnionPay', 'Count'), UnionPay_Amount: pick(list, 'UnionPay', 'Amount'),
              Others_Count: pick(list, 'Others', 'Count'), Others_Amount: pick(list, 'Others', 'Amount'),
              Total_Count: pick(list, 'Total', 'Count'), Total_Amount: pick(list, 'Total', 'Amount'),

              _rowKey: `cnt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
            };
          });

          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          let grand: Record<string, number> = {};
          const summary = res?.Data?.Summary ?? null;

          if (summary) {
            grand = this.summaryToCounterGrandTotal(summary);
          } else {
            const carrier = Array.isArray(res?.Data) ? res.Data[0] : (res?.Data ?? res ?? {});
            Object.entries(this.counterTotalFieldMap).forEach(([field, apiKey]) => {
              grand[field] = Number(
                carrier?.Totals?.[apiKey] ?? carrier?.Summary?.[apiKey] ?? carrier?.[apiKey] ?? 0
              );
            });
          }

          const isFirstPage = !body?.pageIndex || Number(body?.pageIndex) === 1;
          if (isFirstPage) this.grandTotal = { ...grand };

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );
  }

  /* ----------------- 檢視模式切換 ----------------- */
  onModeChange(): void { this.applyViewMode(); }

  private applyViewMode(): void {
    const nextDefault = this.viewMode === 'credit' ? this.defaultSortCredit : this.defaultSortCounter;

    this.columns = this.viewMode === 'credit' ? this.columnsCredit : this.columnsCounter;
    this.sortMeta = nextDefault.map(x => ({ ...x }));

    // 切換時清空 footer，避免殘留
    this.grandTotal = {};

    // 重設分頁 & 排序到表單，並立即重新查詢
    this.queryForm.patchValue({ pageIndex: 1, SortBy: this.sortMeta }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  /* ----------------- 匯出（不帶 pageSize/pageIndex） ----------------- */
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { ...rest } = this.historyRequestBody; // ✅ 去掉分頁欄位
    return rest;
  }

  onExportCreditPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23090Service
      .exporttls23090CreditPDF(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗（信用卡明細）。'),
      });
  }

  onExportCounterPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23090Service
      .exporttls23090CounterPDF(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗（專櫃卡別分析）。'),
      });
  }

  /* ----------------- 下載工具 ----------------- */
  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
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
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      const encoded = filenameStarMatch[1].trim();
      try { return decodeURIComponent(encoded.replace(/^UTF-8''/, '')); } catch { return encoded; }
    }

    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' ')); } catch { return filenameMatch[1]; }
    }
    return `download${defaultExtension}`;
  }

  /* ----------------- 小工具 ----------------- */
  private ensureArr = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
  private toBoolOrNull(v: any): boolean | null {
    if (typeof v === 'boolean') return v;
    if (v == null || v === '') return null;
    const s = String(v).toUpperCase();
    if (s === 'Y' || s === 'TRUE' || s === '1') return true;
    if (s === 'N' || s === 'FALSE' || s === '0') return false;
    return null;
  }
  private prune<T extends Record<string, any>>(obj: T): T {
    const out: any = { ...obj };
    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === '' || v === null || v === undefined) delete out[k];
      else if (Array.isArray(v) && v.length === 0) delete out[k];
      else if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) delete out[k];
    });
    return out as T;
  }

  money = (val: any) => Number(val || 0).toLocaleString('en-US');
  formatDate(val: string): string {
    const date = new Date(val);
    return isNaN(date.getTime())
      ? val
      : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
        .getDate()
        .toString()
        .padStart(2, '0')}`;
  }
  private padTxnNo(v: any): string {
    const s = String(v ?? '').trim();
    return s ? s.padStart(6, '0') : '';
  }

  /** ✅ 提供給 [footerData] 的總計列資料，只輸出有標 isTotal 的欄位 */
  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) footer[col.field] = this.grandTotal[col.field] ?? 0;
    }
    return footer;
  }

  private computeCreditGrandTotal(wrappers: any[]): Record<string, number> {
    const grand: Record<string, number> = {};
    Object.entries(this.creditTotalFieldMap).forEach(([field, apiKey]) => {
      const sum = wrappers.reduce((acc: number, w: any) => acc + Number(w?.[apiKey] ?? 0), 0);
      grand[field] = sum;
    });
    return grand;
  }

  private computeCounterGrandTotal(res: any): Record<string, number> {
    const carrier = Array.isArray(res?.Data) ? res.Data[0] : (res?.Data ?? res ?? {});
    const grand: Record<string, number> = {};
    Object.entries(this.counterTotalFieldMap).forEach(([field, apiKey]) => {
      grand[field] = Number(
        carrier?.Totals?.[apiKey] ?? carrier?.Summary?.[apiKey] ?? carrier?.[apiKey] ?? 0
      );
    });
    return grand;
  }
  /** 專櫃卡別分析：把 Data.Summary 映射成 footer 需要的 GrandTotal */
  private summaryToCounterGrandTotal(summary: any): Record<string, number> {
    if (!summary || typeof summary !== 'object') return {};

    const pick = (brand: string, key: 'Count' | 'Amount') =>
      Number(summary?.[brand]?.[key] ?? 0);

    return {
      // AE
      AE_Count: pick('AE', 'Count'),
      AE_Amount: pick('AE', 'Amount'),

      // DA
      DA_Count: pick('DA', 'Count'),
      DA_Amount: pick('DA', 'Amount'),

      // MASTER
      MASTER_Count: pick('MASTER', 'Count'),
      MASTER_Amount: pick('MASTER', 'Amount'),

      // VISA
      VISA_Count: pick('VISA', 'Count'),
      VISA_Amount: pick('VISA', 'Amount'),

      // JCB
      JCB_Count: pick('JCB', 'Count'),
      JCB_Amount: pick('JCB', 'Amount'),

      // UnionPay
      UnionPay_Count: pick('UnionPay', 'Count'),
      UnionPay_Amount: pick('UnionPay', 'Amount'),

      // Others
      Others_Count: pick('Others', 'Count'),
      Others_Amount: pick('Others', 'Amount'),

      // Total
      Total_Count: pick('Total', 'Count'),
      Total_Amount: pick('Total', 'Amount'),
    };
  }


  // yyyy-MM-dd（date-only）
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
