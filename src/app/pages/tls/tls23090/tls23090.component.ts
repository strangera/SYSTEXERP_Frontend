
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { TLS23090Service } from '../../../service/api/tls/tls23090.service';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { InstallmentPeriodService } from '../../../service/basic/installment-period.service';
import { AcquiringBankService } from '../../../service/basic/acquiring-bank.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { finalize, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-tls23090',
  templateUrl: './tls23090.component.html',
  styleUrls: ['./tls23090.component.scss'],
  standalone: true,
  imports: [
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
    Table2Component,
    ButtonModule,
    NgIf,
  ],
})
export class TLS23090Component extends BasicQueryPageComponent<any> {
  /* ----------------- 狀態 ----------------- */
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;

  // 匯出沿用最後一次查詢的 payload
  historyRequestBody: any | null = null;

  // 檢視模式（用 getter/setter，自動套欄位）
  private _viewMode: 'credit' | 'counter' = 'credit';
  get viewMode(): 'credit' | 'counter' { return this._viewMode; }
  set viewMode(v: 'credit' | 'counter') {
    if (this._viewMode === v) return;
    this._viewMode = v;
    this.applyViewMode(); // ← 核心：切模式時更新 columns / columnGroup / sort 等
  }

  // 排序
  readonly defaultSortCredit = [
    { field: 'TXN_Date', order: 1 as 1 | -1 },
    { field: 'ECR_No',   order: 1 as 1 | -1 },
    { field: 'TXN_No',   order: 1 as 1 | -1 },
  ];
  readonly defaultSortCounter = [
    { field: 'TXN_Date', order: 1 as 1 | -1 },
    { field: 'ECR_No',   order: 1 as 1 | -1 },
    { field: 'tlt_no',   order: 1 as 1 | -1 },
  ];
  sortMeta: any[] = [];

  // 只保留 PageSize / PageIndex / SortBy（此旗標僅保留可讀性說明）
  private readonly includePagingAndSorting = true;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
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
      { field: 'ECR_No',   order: 1 },
      { field: 'TXN_No',   order: 1 },
    ]),
  });

  /* ----------------- 下拉選項 ----------------- */
  cardTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions: any[] = [];
  installmentPeriodOptions: any[] = [];
  acquiringBankOptions: any[] = [];
  connectionStatusOptions: any[] = [
    { value: '1', label: '連線' },
    { value: '2', label: '離線' },
  ];
  constructor(
    private cardTypeService: CardTypeService,
    private tls23090Service: TLS23090Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private whetherService: WhetherService,
    private installmentPeriodService: InstallmentPeriodService,
    private acquiringBankService: AcquiringBankService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  /* ----------------- 總計 / 小計 ----------------- */
  detailTotals: Record<string, number> = {};
  externalTotalFieldMap: Record<string, string> = {};
  private readonly creditTotalFieldMap: Record<string, string> = {
    TXN_PayAmt:      'TotalPayAmt',
    TXN_Point:       'TotalPoint',
    EDC_InstHeadAmt: 'TotalInstHeadAmt',
    EDC_InstEachAmt: 'TotalInstEachAmt',
  };

  // 供表格群組表頭使用
  columnGroup: any[] | undefined = undefined;

  // counter 的總計對應表（已移除 NCCC）
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

  // 專櫃卡別分析：上層群組
  private readonly columnGroupCounter: any[] = [
    { field: 'AE',        header: 'AE',     align: 'center' },
    { field: 'DA',        header: 'DA',     align: 'center' },
    { field: 'MASTER',    header: 'MASTER', align: 'center' },
    { field: 'VISA',      header: 'VISA',   align: 'center' },
    { field: 'JCB',       header: 'JCB',    align: 'center' },
    { field: 'UnionPay',  header: '銀聯卡', align: 'center' },
    { field: 'Others',    header: '其他',   align: 'center' },
    { field: 'Total',     header: '合計',   align: 'center' },
  ];

  /* ----------------- 欄位設定 ----------------- */
  columns: any[] = []; // 目前作用中的欄位（依 viewMode 切）
  private columnsCredit = [
    { field: 'TXN_Date', header: '銷售日期', format: (v: any) => this.formatDate(v), visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },

    { field: 'TXN_PayAmt', header: '金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
    { field: 'TXN_Point', header: '紅利', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
    { field: 'TERM_No', header: '分期', visible: true },
    { field: 'TERM_Name', header: '分期期數', visible: true },
    { field: 'EDC_InstHeadAmt', header: '頭期款分期金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
    { field: 'EDC_InstEachAmt', header: '每期分期金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
  ];

  // 專櫃卡別分析（每組：筆數/金額）
  private columnsCounter = [
    { field: 'TXN_Date', header: '銷售日期', format: (v: any) => this.formatDate(v), visible: true },
    { field: 'ECR_No',   header: '收銀機號', visible: true },
    { field: 'tlt_no',   header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃編號/名稱', visible: true, style: 'text-left' },

    { field: 'AE_Count',   header: '筆數', groupField: 'AE',       style: 'text-right', isTotal: true, visible: true },
    { field: 'AE_Amount',  header: '金額', groupField: 'AE',       style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'DA_Count',   header: '筆數', groupField: 'DA',       style: 'text-right', isTotal: true, visible: true },
    { field: 'DA_Amount',  header: '金額', groupField: 'DA',       style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'MASTER_Count',  header: '筆數', groupField: 'MASTER', style: 'text-right', isTotal: true, visible: true },
    { field: 'MASTER_Amount', header: '金額', groupField: 'MASTER', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'VISA_Count',  header: '筆數', groupField: 'VISA',  style: 'text-right', isTotal: true, visible: true },
    { field: 'VISA_Amount', header: '金額', groupField: 'VISA',  style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'JCB_Count',  header: '筆數', groupField: 'JCB',  style: 'text-right', isTotal: true, visible: true },
    { field: 'JCB_Amount', header: '金額', groupField: 'JCB',  style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'UnionPay_Count',  header: '筆數', groupField: 'UnionPay',  style: 'text-right', isTotal: true, visible: true },
    { field: 'UnionPay_Amount', header: '金額', groupField: 'UnionPay',  style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'Others_Count',  header: '筆數', groupField: 'Others',  style: 'text-right', isTotal: true, visible: true },
    { field: 'Others_Amount', header: '金額', groupField: 'Others',  style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'Total_Count',  header: '筆數', groupField: 'Total',  style: 'text-right', isTotal: true, visible: true },
    { field: 'Total_Amount', header: '金額', groupField: 'Total',  style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
  ];

  /* ----------------- 生命週期 ----------------- */
  ngOnInit(): void {
    this.initializePage('TLS23090', 'tls/tls23090cru', this.queryForm, (form) => this.onSubmit(form));

    // 預設信用卡明細
    this.sortMeta = this.defaultSortCredit.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });
    this.columns = this.columnsCredit;
    this.externalTotalFieldMap = { ...this.creditTotalFieldMap };
    this.columnGroup = undefined;

    // 選項
    this.cardTypeService.getCardType().subscribe(data => this.cardTypeOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.WhetherOptions = data);
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
    this.installmentPeriodService.getInstallmentPeriods().subscribe(data => this.installmentPeriodOptions = data);
    this.acquiringBankService.getAcquiringBanks().subscribe(data => this.acquiringBankOptions = data);
  }

  /* ----------------- 兩個表共同使用的 lazy 取數 ----------------- */
  fetchTLS23090 = (evt: LazyLoadEvent) => {
    const val = this.queryForm.getRawValue() as any;

    const defaultSort =
      this.viewMode === 'counter' ? this.defaultSortCounter : this.defaultSortCredit;

    const sortBy =
      Array.isArray(evt?.SortBy) && evt.SortBy.length
        ? evt.SortBy
        : (Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : defaultSort);

    const pageIndex =
      Number.isFinite(evt?.pageIndex) ? Number(evt!.pageIndex) : Number(val?.pageIndex ?? 1);

    const pageSize =
      Number.isFinite(evt?.pageSize) ? Number(evt!.pageSize) : Number(val?.pageSize ?? 20);

    const payload = this.prune({
      TXN_DateStart: this.toIso(val?.TXN_DateStart ?? this.yesterday),
      TXN_DateEnd  : this.toIso(val?.TXN_DateEnd   ?? this.yesterday),

      ECR_No     : this.ensureArr(val?.ECR_No),
      TLT_No     : this.ensureArr(val?.tlt_no),
      CRD_Type   : this.ensureArr(val?.CRD_Type),
      CRD_No     : (val?.CRD_No ?? '') || undefined,
      TXN_PayAmt : (val?.TXN_PayAmt === '' || val?.TXN_PayAmt == null) ? undefined : Number(val.TXN_PayAmt),

      tlt_building: (val?.tlt_building ?? '') || undefined,
      tlt_floor   : this.ensureArr(val?.tlt_floor),
      org_id      : this.ensureArr(val?.org_id),

      IsHaveTERM_No: this.toBoolOrNull(val?.IsHaveTERM_No),
      TERM_No      : this.ensureArr(val?.TERM_No),
      Acquirer     : this.ensureArr(val?.Acquirer),
      Conn_Status  : (val?.ConnStatus ?? '') || undefined,

      PageSize : pageSize,
      PageIndex: pageIndex,
      SortBy   : sortBy,
    });

    this.historyRequestBody = { ...payload };

    const call$ =
      this.viewMode === 'counter'
        ? this.tls23090Service.queryTLS23090CounterCard(payload)
        : this.tls23090Service.queryTLS23090(payload);

return call$.pipe(
  map((res: any) => {
    if (this.viewMode === 'counter') {
      // ====== 專櫃卡別分析 ======
      const items: any[] =
        Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
        Array.isArray(res?.Data)            ? res.Data :
        [];

      const pick = (obj: any, brand: string, field: 'Count' | 'Amount') =>
        Number(obj?.[brand]?.[field] ?? 0);

      const rows = items.map((r: any) => {
        const list = r?.CRD_Type_List || {};
        return {
          TXN_Date: r?.TXN_Date,
          ECR_No  : r?.ECR_No,
          tlt_no  : r?.tlt_no,
          tlt_name: r?.tlt_name,

          AE_Count:       pick(list, 'AE', 'Count'),       AE_Amount:       pick(list, 'AE', 'Amount'),
          DA_Count:       pick(list, 'DA', 'Count'),       DA_Amount:       pick(list, 'DA', 'Amount'),
          MASTER_Count:   pick(list, 'MASTER', 'Count'),   MASTER_Amount:   pick(list, 'MASTER', 'Amount'),
          VISA_Count:     pick(list, 'VISA', 'Count'),     VISA_Amount:     pick(list, 'VISA', 'Amount'),
          JCB_Count:      pick(list, 'JCB', 'Count'),      JCB_Amount:      pick(list, 'JCB', 'Amount'),
          UnionPay_Count: pick(list, 'UnionPay', 'Count'), UnionPay_Amount: pick(list, 'UnionPay', 'Amount'),
          Others_Count:   pick(list, 'Others', 'Count'),   Others_Amount:   pick(list, 'Others', 'Amount'),
          Total_Count:    pick(list, 'Total', 'Count'),    Total_Amount:    pick(list, 'Total', 'Amount'),

          _rowKey: `cnt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}`,
        };
      });

      const totalRecords =
        typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

      // ✅ 優先吃 API 總計（支援多種包裝）
      const totalCarrier = Array.isArray(res?.Data) ? res.Data[0] : (res?.Data ?? res ?? null);
      const apiTotals = this.pickApiTotals(totalCarrier, Object.values(this.counterTotalFieldMap));
      const externalTotals = apiTotals ?? this.sumCounterTotals(rows, this.counterTotalFieldMap);

      return { rows, totalRecords, externalTotals, externalSubtotals: {} };
    }

    // ====== 信用卡明細 ======
    const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);

    // ⬇️ 這段是關鍵：容錯抓所有可能的 key
    const takeDetails = (w: any) =>
      w?.tLS23090_CreditDetails ??
      w?.TLS23090_CreditDetails ??
      w?.CreditDetails ??
      w?.Details ??
      [];

    const rows = wrappers
      .flatMap((w: any) => Array.isArray(takeDetails(w)) ? takeDetails(w) : [])
      .map((row: any, idx: number) => ({
        ...row,
        _rowKey: `crt|${row?.TXN_Date ?? ''}|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
      }));

    const totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

    // ✅ externalTotals 用 API 的欄位名做 key
    const externalTotals = wrappers.reduce((acc: any, w: any) => {
      acc.TotalPayAmt      += Number(w?.TotalPayAmt ?? 0);
      acc.TotalPoint       += Number(w?.TotalPoint ?? 0);
      acc.TotalInstHeadAmt += Number(w?.TotalInstHeadAmt ?? 0);
      acc.TotalInstEachAmt += Number(w?.TotalInstEachAmt ?? 0);
      return acc;
    }, { TotalPayAmt: 0, TotalPoint: 0, TotalInstHeadAmt: 0, TotalInstEachAmt: 0 });

    return { rows, totalRecords, externalTotals, externalSubtotals: {} };
  })
);





  };

  /* ----------------- 查詢 ----------------- */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const defaultSort = this.viewMode === 'counter'
        ? this.defaultSortCounter
        : this.defaultSortCredit;

      const sortByArr: any[] =
        (Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy :
         (this.sortMeta.length ? this.sortMeta : defaultSort)).map((s:any) => ({ ...s }));

      const pageSize  = Number.isFinite(val?.pageSize) ? Number(val.pageSize) : 10;
      const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;

      const payload = this.prune({
        TXN_DateStart: this.toIso(val?.TXN_DateStart ?? this.yesterday),
        TXN_DateEnd  : this.toIso(val?.TXN_DateEnd   ?? this.yesterday),

        ECR_No     : this.ensureArr(val?.ECR_No),
        TLT_No     : this.ensureArr(val?.tlt_no),
        CRD_Type   : this.ensureArr(val?.CRD_Type),
        CRD_No     : (val?.CRD_No ?? '') || undefined,
        TXN_PayAmt : (val?.TXN_PayAmt === '' || val?.TXN_PayAmt == null) ? undefined : Number(val.TXN_PayAmt),

        tlt_building: (val?.tlt_building ?? '') || undefined,
        tlt_floor   : this.ensureArr(val?.tlt_floor),
        org_id      : this.ensureArr(val?.org_id),

        IsHaveTERM_No: this.toBoolOrNull(val?.IsHaveTERM_No),
        TERM_No      : this.ensureArr(val?.TERM_No),
        Acquirer     : this.ensureArr(val?.Acquirer),
        Conn_Status  : (val?.ConnStatus ?? '') || undefined,

        PageSize: pageSize,
        PageIndex: pageIndex,
        SortBy: sortByArr,
      });
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      const call$ = this.viewMode === 'counter'
        ? this.tls23090Service.queryTLS23090CounterCard(payload)
        : this.tls23090Service.queryTLS23090(payload);

 call$.subscribe({
  next: (res) => {
    if (this.viewMode === 'counter') {
      // ... rows 組裝（照你原本的）

      this.columns = this.columnsCounter;
      this.columnGroup = this.columnGroupCounter;
      this.externalTotalFieldMap = { ...this.counterTotalFieldMap };

      // ✅ 總計優先吃 API
      const totalCarrier = Array.isArray(res?.Data) ? res.Data[0] : (res?.Data ?? res ?? null);
      const apiTotals = this.pickApiTotals(totalCarrier, Object.values(this.counterTotalFieldMap));
      this.detailTotals = apiTotals ?? this.sumCounterTotals(this.data, this.counterTotalFieldMap);

      this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
    } else {
      // ====== 信用卡明細 ======
      const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);

      const takeDetails = (w: any) =>
        w?.tLS23090_CreditDetails ??
        w?.TLS23090_CreditDetails ??
        w?.CreditDetails ??
        w?.Details ??
        [];

      const flat = wrappers.flatMap((w: any) => Array.isArray(takeDetails(w)) ? takeDetails(w) : []);
      this.data = flat.map((row: any, idx: number) => ({
        ...row, _rowKey: `crt|${row?.TXN_Date ?? ''}|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`
      }));

      this.columns = this.columnsCredit;
      this.columnGroup = undefined;
      this.externalTotalFieldMap = { ...this.creditTotalFieldMap };

      const totals = wrappers.reduce((acc: any, w: any) => {
        acc.TotalPayAmt      += Number(w?.TotalPayAmt ?? 0);
        acc.TotalPoint       += Number(w?.TotalPoint ?? 0);
        acc.TotalInstHeadAmt += Number(w?.TotalInstHeadAmt ?? 0);
        acc.TotalInstEachAmt += Number(w?.TotalInstEachAmt ?? 0);
        return acc;
      }, { TotalPayAmt: 0, TotalPoint: 0, TotalInstHeadAmt: 0, TotalInstEachAmt: 0 });

      this.detailTotals = totals;
      this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
    }
  },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }
  /** 從 API 回應中撈出總計：支援 source.Totals / source.Summary / 直接平鋪在 source 上 */
private pickApiTotals(source: any, keys: string[]): Record<string, number> | null {
  if (!source || typeof source !== 'object') return null;
  const out: Record<string, number> = {};
  let found = false;
  for (const k of keys) {
    const v =
      source?.Totals?.[k] ??
      source?.Summary?.[k] ??
      source?.[k];
    if (v != null) {
      out[k] = Number(v) || 0;
      found = true;
    }
  }
  return found ? out : null;
}


  /* ----------------- 檢視模式套用（給 setter / 舊事件共用） ----------------- */
  onModeChange(): void { this.applyViewMode(); } // 兼容舊 template 綁法

  private applyViewMode(): void {
    const nextDefault = this.viewMode === 'credit' ? this.defaultSortCredit : this.defaultSortCounter;

    this.columns = this.viewMode === 'credit' ? this.columnsCredit : this.columnsCounter;
    this.externalTotalFieldMap = this.viewMode === 'credit'
      ? { ...this.creditTotalFieldMap }
      : { ...this.counterTotalFieldMap };
    this.columnGroup = this.viewMode === 'counter' ? this.columnGroupCounter : undefined;

    this.detailTotals = {};
    this.sortMeta = nextDefault.map(x => ({ ...x }));
    // 重設分頁 & 排序到表單，讓 table 重新打 API
    this.queryForm.patchValue({ pageIndex: 1, SortBy: this.sortMeta }, { emitEvent: false });

    // 立即重查
    this.onSubmit(this.queryForm);
  }

  /* ----------------- 匯出 ----------------- */
  onExportCreditPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23090Service
      .exporttls23090CreditPDF(this.historyRequestBody)
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
    this.tls23090Service
      .exporttls23090CounterPDF(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗（專櫃卡別分析）。'),
      });
  }

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
    if (filenameStarMatch && filenameStarMatch[1]) {
      const encoded = filenameStarMatch[1].trim();
      try {
        return decodeURIComponent(encoded.replace(/^UTF-8''/, ''));
      } catch {
        return encoded;
      }
    }

    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch && filenameMatch[1]) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }
    return `download${defaultExtension}`;
  }

  /* ----------------- 工具 ----------------- */
  private toIso(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }
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

  private sumCounterTotals(rows: any[], map: Record<string, string>): Record<string, number> {
    const totals: Record<string, number> = {};
    Object.values(map).forEach(k => totals[k] = 0);
    rows.forEach(r => {
      Object.entries(map).forEach(([field, key]) => {
        totals[key] += Number(r?.[field] ?? 0);
      });
    });
    return totals;
  }
}
