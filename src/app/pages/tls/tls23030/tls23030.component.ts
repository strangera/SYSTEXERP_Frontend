// src/app/pages/tls/tls23030/tls23030.component.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { finalize, timeout, catchError, map, take, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { TLS23030Service } from '../../../service/api/tls/tls23030.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { WhetherService } from '../../../service/basic/whether.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TransactionTypeService } from '../../../service/basic/transaction-type.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { TicketStatusService } from '../../../service/basic/ticket-status-service.service';
import { TaxableService } from '../../../service/basic/taxable.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';
// === 小計/總計欄位對應：用具名鍵避免 TS4111 ===
const TOTAL_FIELD_MAP = {
  TXN_PayAmt: 'Total_TXN_PayAmt',
  TXN_TaxAlwnc: 'Total_TXN_TaxAlwnc',
} as const;
type TotalFieldMap = typeof TOTAL_FIELD_MAP;

const SUBTOTAL_FIELD_MAP = {
  TXN_PayAmt: 'SubTotal_TXN_PayAmt',
  TXN_TaxAlwnc: 'SubTotal_TXN_TaxAlwnc',
} as const;
type SubtotalFieldMap = typeof SUBTOTAL_FIELD_MAP;

@UntilDestroy()
@Component({
  selector: 'app-tls23030',
  templateUrl: './tls23030.component.html',
  styleUrls: ['./tls23030.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    InputTextComponent,
    CheckboxModule,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    TableComponent,
    Table2Component,
    CommonModule,
    ButtonModule,
    DecimalPipe
  ],
})
export class TLS23030Component extends BasicQueryPageComponent<any> {
  /** 以「日期 + 收銀機」分組 */
  readonly groupByField = '_grp';

  /** 預設排序（_grp 置前） */
 readonly defaultSort: any[] = [
  { field: this.groupByField, order: 1 },
  { field: 'TXN_Date', order: 1 },
  { field: 'ECR_No',   order: 1 },
  { field: 'TXN_No',   order: 1 },
];

  // 視圖狀態
  showSummary = false;

  // 明細
  data: any[] = [];
  totalRecords = 0;
  sortMeta: any[] = [];

  // 彙總
  summaryData: any[] = [];
  summaryTotals = { totalPayAmt: 0, totalTaxAlwnc: 0 };

  // 總計/小計（給 table2）
  detailTotals: Record<string, number> = {};

detailSubtotals: Record<string, Record<string, number>> = {};

// ✅ 用具名鍵避免 TS4111（這兩行是新的，取代原本的 Record<string,string>）
detailTotalFieldMap: TotalFieldMap = TOTAL_FIELD_MAP;
detailSubtotalFieldMap: SubtotalFieldMap = SUBTOTAL_FIELD_MAP;


  /** 後端所有群組的小計（groupKey -> fields） */
  private allSubtotals: Record<string, Record<string, number>> = {};
  /** 只放本頁「要顯示」的小計（給 table2 畫 footer） */
  visibleSubtotals: Record<string, Record<string, number>> = {};

  

  // 其他
  btnLoading = false;
  historyRequestBody: any | null = null;
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;
  private readonly includePagingAndSorting = true;

  // 下拉（略）
  displayModeOptions: any[] = [];
  WhetherOptions: any[] = [];
  paymentTypeOptions: Array<{ label: string; value: string; Name: string; No: string; PAY_Type: string; }> = [];
  transactionTypeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions: any[] = [];
  txnStatusOptions: any[] = [
    { value: '1', label: '正常交易' },
    { value: '2', label: '作廢' },
    { value: '3', label: '退貨' },
  ];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  ticketStatusOptions: any[] = [
    { value: '1', label: '已開' },
    { value: '0', label: '未開' },
  ];

  // 表單
  readonly yesterday: Date = (() => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-1); return d; })();
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [],
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [],
    PAY_NO: [] as string[],
    TXN_PayAmt_Start: [null],
    TXN_PayAmt_End: [null],
    TXN_Status: [],
    TXN_MemCard: [''],
    CRD_Type: [],
    CRD_No: [''],
    IsHaveTERM_No: [],
    pay_taxtype: [''],
    org_id: [],
    VOU_Check: false,
    rece_yn: [''],
    cash_yn: [''],
    tlt_building: [''],
    tlt_floor: [],

    ...createPaginationConfig(this.defaultSort),
  });

  // 欄位
  columns: any[] = [
    { field: this.groupByField, header: 'grp', visible: false, hidden: true },
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_StatusName', header: '交易型態', visible: true },
    { field: 'PAY_NO', header: '付款別代號', visible: false },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    {
      field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right',
      format: (n: number) => this.money(n), isTotal: true, isSubTotal: true,
    },
    {
      field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true, style: 'text-right',
      format: (n: number) => this.money(n), isTotal: true, isSubTotal: true,
    },
    { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '交易時間', visible: true, format: (v: string) => this.formatDateTime(v) },
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, style: 'text-right' },
    { field: 'TERM_No', header: '分期', visible: true },
    {
      field: 'IsHaveTERM_No', header: '是否分期', visible: true,
      format: (_: any, row: any) => (Number(row?.TERM_No ?? 0) > 1 ? '是' : '否')
    },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  summaryColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別代號', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: (n: number) => this.money(n) },
    { field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true, style: 'text-right', format: (n: number) => this.money(n) },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  constructor(
    private whetherService: WhetherService,
    private displayModeService: DisplayModeService,
    private paymentTypeService: PaymentTypeService,
    private transactionTypeService: TransactionTypeService,
    private cardTypeService: CardTypeService,
    private ticketStatusService: TicketStatusService,
    private taxableService: TaxableService,
    private discountService: DiscountService,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private commissionTypeService: CommissionTypeService,
    private floorService: FloorService,
    private tls23030Service: TLS23030Service,
    private tls11010Service: Tls11010Service,
    private txnStatusService: TxnStatusService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private dropDownListService: DropDownListService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS23030', 'tls/tls23030cru', this.queryForm, (f) => this.onSubmit(f));
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

    this.dropDownListService.queryPOS1006_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.paymentTypeOptions = rows.map((x: any) => ({
          label: `${x.No ?? ''}-${x.Name ?? ''}`, value: x.No ?? '',
          Name: x.Name ?? '', No: x.No ?? '', PAY_Type: x.PAY_Type ?? '',
        }));
      });

    // 其餘下拉
    this.displayModeService.getDisplayModes().subscribe(v => this.displayModeOptions = v || []);
    this.whetherService.getWhetherOptions().subscribe(v => this.WhetherOptions = v || []);
    this.transactionTypeService.getTransactionTypes().subscribe(v => this.transactionTypeOptions = v || []);
    this.cardTypeService.getCardType().subscribe(v => this.cardTypeOptions = v || []);
    this.taxableService.getSystemTypes().subscribe(v => this.taxableOptions = v || []);
    this.discountService.getLocalDiscountOptions().subscribe(v => this.discountOptions = v || []);
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(v => this.deductionbigCategoryOptions = v || []);
    this.commissionTypeService.getCommissionTypes().subscribe(v => this.commissionTypeOptions = v || []);
    this.floorService.getFloors().subscribe(v => this.floorOptions = v || []);
    this.tls11010Service.getBuildingOptions().subscribe(v => this.BUILDING_NO_Options = v || []);
    this.tls11010Service.getOrgOptions().subscribe(v =>
      this.OrganizationCodeOptions = (v || []).map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value }))
    );
    this.ECRNoService.getECRNo().subscribe(v =>
      this.ECRNoOptions = (v || []).map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value }))
    );
    this.counterNameService.getCounters().subscribe(v =>
      this.CounterOptions = (v || []).map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value }))
    );
    
  }

// === 提供給 Table2 的 lazy 取數 ===
fetchTLS23030 = (evt: LazyLoadEvent) => {
  // 讀目前條件
  const raw: any = this.queryForm.getRawValue();

  // 小工具
  const ensureArr   = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
  const toNumOrNull = (v: any) => (v === '' || v == null ? null : Number(v));
  const emptyToNull = (v: any) => (v === '' ? null : v);

  // 分頁/排序（evt 優先，其次沿用表單/預設）
  const pageSize  = Number.isFinite(evt?.pageSize)  ? Number(evt.pageSize)  : (Number(raw?.pageSize)  || 20);
  const pageIndex = Number.isFinite(evt?.pageIndex) ? Number(evt.pageIndex) : (Number(raw?.pageIndex) || 1);

  const uiSort = this.ensureGroupFirst(
    Array.isArray((evt as any)?.SortBy) && (evt as any).SortBy.length
      ? (evt as any).SortBy
      : (Array.isArray(raw?.SortBy) && raw.SortBy.length ? raw.SortBy : this.defaultSort)
  );
  const apiSort = this.toApiSort(uiSort);

  // 組 payload（與 onSubmit 對齊，用 yyyy-MM-dd）
  const payload: any = {
    TXN_DateStart: this.toYMD(raw['TXN_DateStart']),
    TXN_DateEnd:   this.toYMD(raw['TXN_DateEnd']),

    ECR_No:            ensureArr(raw['ECR_No']),
    TLT_No:            ensureArr(raw['TLT_No']),
    PAY_NO:            ensureArr(raw['PAY_NO']),
    TXN_Status:        ensureArr(raw['TXN_Status']),
    CRD_Type:          ensureArr(raw['CRD_Type']),
    org_id:            ensureArr(raw['org_id']),
    tlt_floor:         ensureArr(raw['tlt_floor']),

    TXN_No_Start:      toNumOrNull(raw['TXN_No_Start']),
    TXN_No_End:        toNumOrNull(raw['TXN_No_End']),
    TXN_PayAmt_Start:  toNumOrNull(raw['TXN_PayAmt_Start']),
    TXN_PayAmt_End:    toNumOrNull(raw['TXN_PayAmt_End']),

    TXN_MemCard:       emptyToNull(raw['TXN_MemCard']),
    CRD_No:            emptyToNull(raw['CRD_No']),
    pay_taxtype:       emptyToNull(raw['pay_taxtype']),
    rece_yn:           emptyToNull(raw['rece_yn']),
    cash_yn:           emptyToNull(raw['cash_yn']),
    tlt_building:      emptyToNull(raw['tlt_building']),

    VOU_Check:         this.toBoolOrNull(raw['VOU_Check']),
    IsHaveTERM_No:     this.toBoolOrNull(raw['IsHaveTERM_No']),

    // 分頁/排序（API 使用 pageIndex/pageSize）
    pageIndex,
    pageSize,
    SortBy: apiSort,
  };

  // 清空空值（保留 0/false）
  Object.keys(payload).forEach(k => {
    const v = payload[k];
    if (v === '' || v === null || v === undefined) delete payload[k];
    if (Array.isArray(v) && v.length === 0) delete payload[k];
  });

  // 主查詢 →（可能）偷看下一頁第一筆，決定最後一組是否在本頁結束
  return this.tls23030Service.queryTLS23030(payload).pipe(
    switchMap((res: any) => {
      // 1) 展平 rows
      const wrappers: any[] = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
      const rawRows = this.extractRows(wrappers);

      // 2) 本頁 rows 加上 _grp 與 _rowKey
      const pageRows = rawRows.map((item: any, i: number) => {
        const ymd = this.toYMD(item?.TXN_Date) ?? '';
        const ecr = String(item?.ECR_No ?? '').trim();
        const txn = String(item?.TXN_No ?? '').trim();
        const grp = `${ymd}|${ecr}|${txn}`;                 // 與 onSubmit 保持一致
        const rowKey = `${grp}|${i}`;
        return { ...item, _rowKey: rowKey, [this.groupByField]: grp };
      });

      // 3) 總筆數/總頁數
      const totalCount = Number(res?.TotalCount ?? 0);
      const totalPage  = Number(res?.TotalPage ?? Math.ceil((totalCount || 0) / (pageSize || 1))) || 0;
      const totalRecords = Number.isFinite(totalCount) ? totalCount : pageRows.length;

      // 4) 後端小計（所有群組）
      const allSubtotals = this.buildSubtotalsMapFromResponse(wrappers);

      // 5) 後端總計（多包合併）→ externalTotals（用具名鍵避免 TS4111）
      const externalTotals = wrappers.reduce((agg, w) => {
        const a = Number(w?.Total_TXN_PayAmt   ?? 0);
        const b = Number(w?.Total_TXN_TaxAlwnc ?? 0);
        const keyA = this.detailTotalFieldMap.TXN_PayAmt;
        const keyB = this.detailTotalFieldMap.TXN_TaxAlwnc;
        agg[keyA] = Number(agg[keyA] ?? 0) + a;
        agg[keyB] = Number(agg[keyB] ?? 0) + b;
        return agg;
      }, {} as Record<string, number>);

      // 6) 本頁哪些群組在本頁結束？
      const ended = new Set<string>();
      for (let i = 0; i < pageRows.length - 1; i++) {
        const g1 = pageRows[i][this.groupByField];
        const g2 = pageRows[i + 1][this.groupByField];
        if (g1 !== g2) ended.add(g1);
      }
      const lastRow = pageRows[pageRows.length - 1];
      const lastKey = lastRow?.[this.groupByField] as string | undefined;

      const hasNext = totalPage
        ? pageIndex < totalPage
        : (pageIndex * pageSize < totalRecords);

      // 組裝回傳物件的工廠
      const finalizeReturn = (endedSet: Set<string>) => {
        const externalSubtotals: Record<string, Record<string, number>> = {};
        endedSet.forEach(k => {
          if (allSubtotals[k]) externalSubtotals[k] = allSubtotals[k];
        });

        return {
          rows: pageRows,
          totalRecords,
          externalTotals,
          externalSubtotals, // 只帶「本頁真正結束」的群組小計
        };
      };

      // 不需偷看下一頁（沒 lastKey 或本頁已是最後一頁）
      if (!lastKey) {
        return of(finalizeReturn(ended));
      }
      if (!hasNext) {
        ended.add(lastKey);
        return of(finalizeReturn(ended));
      }

      // 需要偷看下一頁第一筆的 groupKey
      return this.peekNextPageFirstGroupKey(payload, pageIndex + 1, 1).pipe(
        map((nextKey: string | null) => {
          if (!nextKey || nextKey !== lastKey) ended.add(lastKey);
          return finalizeReturn(ended);
        }),
        catchError(() => of(finalizeReturn(ended)))
      );
    })
  );
};


  // ====== 查詢 ======
  onSubmit(form: FormGroup): void {
    this.loading = true;

    const raw: any = { ...form.getRawValue() };
    raw['TXN_DateStart'] = this.toYMD(raw['TXN_DateStart']);
    raw['TXN_DateEnd']   = this.toYMD(raw['TXN_DateEnd']);

    const ensureArr   = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
    const toNumOrNull = (v: any) => (v === '' || v == null ? null : Number(v));
    const emptyToNull = (v: any) => (v === '' ? null : v);

    raw['ECR_No']       = ensureArr(raw['ECR_No']);
    raw['TLT_No']       = ensureArr(raw['TLT_No']);
    raw['TXN_Status']   = ensureArr(raw['TXN_Status']);
    raw['CRD_Type']     = ensureArr(raw['CRD_Type']);
    raw['org_id']       = ensureArr(raw['org_id']);
    raw['tlt_floor']    = ensureArr(raw['tlt_floor']);
    raw['PAY_NO']       = ensureArr(raw['PAY_NO']);
    raw['TXN_No_Start']     = toNumOrNull(raw['TXN_No_Start']);
    raw['TXN_No_End']       = toNumOrNull(raw['TXN_No_End']);
    raw['TXN_PayAmt_Start'] = toNumOrNull(raw['TXN_PayAmt_Start']);
    raw['TXN_PayAmt_End']   = toNumOrNull(raw['TXN_PayAmt_End']);
    raw['TXN_MemCard']  = emptyToNull(raw['TXN_MemCard']);
    raw['CRD_No']       = emptyToNull(raw['CRD_No']);
    raw['pay_taxtype']  = emptyToNull(raw['pay_taxtype']);
    raw['rece_yn']      = emptyToNull(raw['rece_yn']);
    raw['cash_yn']      = emptyToNull(raw['cash_yn']);
    raw['tlt_building'] = emptyToNull(raw['tlt_building']);
    raw['VOU_Check']    = this.toBoolOrNull(raw['VOU_Check']);
    raw['IsHaveTERM_No']= this.toBoolOrNull(raw['IsHaveTERM_No']);

    const pageSize  = Number.isFinite(raw?.pageSize)  ? Number(raw.pageSize)  : 20;
    const pageIndex = Number.isFinite(raw?.pageIndex) ? Number(raw.pageIndex) : 1;

    const uiSortBy: any[] = this.ensureGroupFirst(
      (Array.isArray(raw?.SortBy) && raw.SortBy.length ? raw.SortBy : (this.sortMeta?.length ? this.sortMeta : this.defaultSort))
    ).map((s: any) => ({ ...s }));

    const payload: any = {
      TXN_DateStart: raw['TXN_DateStart'], TXN_DateEnd: raw['TXN_DateEnd'],
      ECR_No: raw['ECR_No'], TXN_No_Start: raw['TXN_No_Start'], TXN_No_End: raw['TXN_No_End'],
      TLT_No: raw['TLT_No'], PAY_NO: raw['PAY_NO'], TXN_PayAmt_Start: raw['TXN_PayAmt_Start'], TXN_PayAmt_End: raw['TXN_PayAmt_End'],
      TXN_Status: raw['TXN_Status'], TXN_MemCard: raw['TXN_MemCard'], CRD_Type: raw['CRD_Type'], CRD_No: raw['CRD_No'],
      IsHaveTERM_No: raw['IsHaveTERM_No'], pay_taxtype: raw['pay_taxtype'], org_id: raw['org_id'], VOU_Check: raw['VOU_Check'],
      rece_yn: raw['rece_yn'], cash_yn: raw['cash_yn'], tlt_building: raw['tlt_building'], tlt_floor: raw['tlt_floor'],
    };
    if (this.includePagingAndSorting) Object.assign(payload, { pageSize, pageIndex, SortBy: this.toApiSort(uiSortBy) });

    Object.keys(payload).forEach(k => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.historyRequestBody = { ...payload };

    // ===== 彙總 =====
    if (this.showSummary) {
      this.tls23030Service.queryTLS23030Summary(payload)
        .pipe(
          timeout(60_000),
          catchError(err => { console.error('TLS23030 Summary 失敗:', err); return of({ Data: [] }); }),
          finalize(() => this.loading = false)
        )
        .subscribe((res: any) => {
          const packs = Array.isArray(res?.Data) ? res.Data : [];
          const totals = packs.reduce((acc: any, p: any) => ({
            totalPayAmt   : acc.totalPayAmt   + Number(p?.totalPayAmt ?? 0),
            totalTaxAlwnc : acc.totalTaxAlwnc + Number(p?.totalTaxAlwnc ?? 0),
          }), { totalPayAmt: 0, totalTaxAlwnc: 0 });
          this.summaryTotals = totals;

          const details = packs.flatMap((p: any) => Array.isArray(p?.SummaryDetails) ? p.SummaryDetails : []);
          this.summaryData = details.map((r: any, i: number) => ({
            ...r, _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${r?.PAY_NO ?? ''}|${i}`,
          }));
          this.data = [];
          this.totalRecords = this.summaryData.length;
        });
      return;
    }

    // ===== 明細（小計依後端，且只在群組真正結束的那頁顯示） =====
    this.tls23030Service.queryTLS23030(payload)
      .pipe(
        timeout(60_000),
        catchError(err => {
          console.error('TLS23030 查詢失敗:', err);
          return of({ Data: [], TotalCount: 0, TotalPage: 0 });
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((res: any) => {
        // 1) 展平 rows + 加上 _grp/_rowKey
        const wrappers: any[] = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
        const rows: any[] = this.extractRows(wrappers);
   const pageRows = rows.map((item: any, i: number) => {
  const ymd = this.toYMD(item?.TXN_Date) ?? '';
  const ecr = String(item?.ECR_No ?? '').trim();
  const txn = String(item?.TXN_No ?? '').trim();
  const grp = `${ymd}|${ecr}|${txn}`;
  const rowKey = `${grp}|${i}`;
  return { ...item, _rowKey: rowKey, [this.groupByField]: grp };
});
        this.data = pageRows;

        // 2) 總筆數、總頁數
        const totalCount = Number(res?.TotalCount ?? 0);
        const totalPage  = Number(res?.TotalPage ?? Math.ceil(totalCount / pageSize)) || 0;
        this.totalRecords = Number.isFinite(totalCount) ? totalCount : pageRows.length;

        // 3) 後端小計 -> 建立 allSubtotals（groupKey => fields）
        this.allSubtotals = this.buildSubtotalsMapFromResponse(wrappers);

        // 4) 後端總計（多包合併）——★中括號版，避免 TS4111
        this.detailTotals = wrappers.reduce((agg, w) => {
          const a = Number(w?.Total_TXN_PayAmt ?? 0);
          const b = Number(w?.Total_TXN_TaxAlwnc ?? 0);
          const keyA = this.detailTotalFieldMap.TXN_PayAmt;
          const keyB = this.detailTotalFieldMap.TXN_TaxAlwnc; 
          agg[keyA] = Number(agg[keyA] ?? 0) + a;
          agg[keyB] = Number(agg[keyB] ?? 0) + b;
          return agg;
        }, {} as Record<string, number>);

        // 5) 本頁哪些群組結束？
        const ended = new Set<string>();
        for (let i = 0; i < pageRows.length - 1; i++) {
          const g1 = pageRows[i][this.groupByField];
          const g2 = pageRows[i + 1][this.groupByField];
          if (g1 !== g2) ended.add(g1);
        }

        const lastRow = pageRows[pageRows.length - 1];
        const lastKey = lastRow?.[this.groupByField];
        const hasNext = totalPage > 0 ? pageIndex < totalPage : (pageIndex * pageSize < this.totalRecords);

        const finalizeVisible = (endedSet: Set<string>) => {
          const vis: Record<string, Record<string, number>> = {};
          endedSet.forEach(k => {
            if (this.allSubtotals[k]) vis[k] = this.allSubtotals[k];
          });
          this.visibleSubtotals = vis;
        };

        if (!lastKey) { finalizeVisible(ended); return; }
        if (!hasNext) { ended.add(lastKey); finalizeVisible(ended); return; }

        // 偷看下一頁第一筆
        this.peekNextPageFirstGroupKey(payload, pageIndex + 1, 1)
          .pipe(take(1))
          .subscribe(nextKey => {
            if (!nextKey || nextKey !== lastKey) ended.add(lastKey);
            finalizeVisible(ended);
          });
      });
  }

  // ===== 偷看下一頁第一筆的 groupKey =====
private peekNextPageFirstGroupKey(basePayload: any, pageIndex: number, pageSize: number): Observable<string | null> {
  const peekPayload = { ...basePayload, pageIndex, pageSize };
  return this.tls23030Service.queryTLS23030(peekPayload).pipe(
    map((res: any) => {
      const wrappers: any[] = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
      const rows = this.extractRows(wrappers);
      if (!rows.length) return null;
      const ymd = this.toYMD(rows[0]?.TXN_Date) ?? '';
      const ecr = String(rows[0]?.ECR_No ?? '').trim();
      const txn = String(rows[0]?.TXN_No ?? '').trim();
      return `${ymd}|${ecr}|${txn}`;
    }),
    catchError(() => of(null))
  );
}

  // 展平 wrapper -> rows
  private extractRows(wrappers: any[]): any[] {
    const rows: any[] = [];
    for (const w of (wrappers || [])) {
      const detailBags = w?.tLS23030_SubTotals
                      ?? w?.TLS23030_SubTotals
                      ?? w?.tls23030_SubTotals
                      ?? [];
      if (Array.isArray(detailBags) && detailBags.length) {
        for (const st of detailBags) {
          const details = st?.tLS23030_Details
                       ?? st?.TLS23030_Details
                       ?? st?.tls23030_Details
                       ?? [];
          if (Array.isArray(details)) rows.push(...details);
        }
      } else {
        const d = w?.Details ?? w?.details ?? w?.Rows ?? w?.rows ?? [];
        if (Array.isArray(d)) rows.push(...d);
      }
    }
    return rows;
  }

  // 後端小計 -> Map<groupKey, {SubTotal_*...}>
private buildSubtotalsMapFromResponse(wrappers: any[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const w of (wrappers || [])) {
    const list = w?.tLS23030_SubTotals ?? w?.TLS23030_SubTotals ?? w?.tls23030_SubTotals ?? [];
    if (!Array.isArray(list)) continue;

    for (const st of list) {
      const details = st?.tLS23030_Details ?? st?.TLS23030_Details ?? st?.tls23030_Details ?? [];
      if (!Array.isArray(details) || details.length === 0) continue;

      const ymd = this.toYMD(details[0]?.TXN_Date) ?? '';
      const ecr = String(details[0]?.ECR_No ?? '').trim();
      const txn = String(details[0]?.TXN_No ?? '').trim();
      const key = `${ymd}|${ecr}|${txn}`;

      out[key] = {
        [this.detailSubtotalFieldMap.TXN_PayAmt]  : Number(st?.SubTotal_TXN_PayAmt ?? st?.subTotal_TXN_PayAmt ?? 0),
        [this.detailSubtotalFieldMap.TXN_TaxAlwnc]: Number(st?.SubTotal_TXN_TaxAlwnc ?? st?.subTotal_TXN_TaxAlwnc ?? 0),
      };
    }
  }
  return out;
}

  // ===== 工具 =====
  private toYMD(d: any): string | null {
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date.getTime())
      ? null
      : `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
  private toBoolOrNull(v: any): boolean | null {
    if (typeof v === 'boolean') return v;
    if (v == null || v === '') return null;
    if (v === 'Y' || v === 'true' || v === 1 || v === '1') return true;
    if (v === 'N' || v === 'false' || v === 0 || v === '0') return false;
    return null;
  }
  private formatDate(val: string): string {
    const d = new Date(val); if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`;
  }
  private formatDateTime(val: string): string {
    const d = new Date(val); if (isNaN(d.getTime())) return val;
    const yyyy=d.getFullYear(), MM=(d.getMonth()+1).toString().padStart(2,'0'), dd=d.getDate().toString().padStart(2,'0');
    const HH=d.getHours().toString().padStart(2,'0'), mm=d.getMinutes().toString().padStart(2,'0');
    return `${yyyy}/${MM}/${dd} ${HH}:${mm}`;
  }
  money(val: number): string { return Number(val ?? 0).toLocaleString('en-US'); }

  onToggleSummary() { this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false }); this.onSubmit(this.queryForm); }

  private ensureGroupFirst(sortBy: any[] | undefined): any[] {
    const g = this.groupByField;
    const list = Array.isArray(sortBy) ? [...sortBy] : [];
    const exist = list.find((s) => s.field === g);
    const rest = list.filter((s) => s.field !== g);
    const order = exist?.order ?? 1;
    return [{ field: g, order }, ...rest];
  }

  onExportPDF() {
    if (!this.historyRequestBody) { this.messageService?.warnBubble?.('請先執行查詢以產生報表。'); return; }
    this.btnLoading = true;
    const obs = this.showSummary
      ? this.tls23030Service.exportTLS23030SummaryPDF(this.historyRequestBody)
      : this.tls23030Service.exportTLS23030PDF(this.historyRequestBody);
    obs.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
       .subscribe({ next: (r: HttpResponse<Blob>) => this.handleFileExport(r, '.pdf') });
  }
  onExportXLSX() {
    if (!this.historyRequestBody) { this.messageService?.warnBubble?.('請先執行查詢以產生報表。'); return; }
    this.btnLoading = true;
    const obs = this.showSummary
      ? this.tls23030Service.exportTLS23030SummaryExcel(this.historyRequestBody)
      : this.tls23030Service.exportTLS23030Excel(this.historyRequestBody);
    obs.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
       .subscribe({ next: (r: HttpResponse<Blob>) => this.handleFileExport(r, '.xlsx') });
  }
  private handleFileExport(response: HttpResponse<Blob>, ext: string): void {
    const cd = response.headers.get('Content-Disposition');
    const name = this.getFilenameFromHeader(cd, ext);
    const blob = response.body;
    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }
  private getFilenameFromHeader(cd: string | null, def: string): string {
    if (!cd) return `download${def}`;
    const star = /filename\*=([^;]+)/.exec(cd);
    if (star?.[1]) { try { return decodeURIComponent(star[1].replace(/^UTF-8''/, '')); } catch { return star[1]; } }
    const m = /filename="([^"]+)"/.exec(cd);
    if (m?.[1]) { try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch { return m[1]; } }
    return `download${def}`;
  }

private toApiSort(uiSort: Array<{field: string; order: 1 | -1}>): Array<{field: string; order: 1 | -1}> {
  const out: Array<{field: string; order: 1 | -1}> = [];
  for (const s of (uiSort ?? [])) {
    if (s.field === this.groupByField) {
      out.push({ field: 'TXN_Date', order: s.order });
      out.push({ field: 'ECR_No',   order: s.order });
      out.push({ field: 'TXN_No',   order: s.order });
    } else {
      out.push(s);
    }
  }
  const seen = new Set<string>();
  return out.filter(s => (seen.has(s.field) ? false : (seen.add(s.field), true)));
}
  paymentSummary: any[] = [];
    
paymentSummaryColumns = [
  { header: '支付別', field: 'PAY_NAME', style: 'text-left' },
  { header: '卡別',   field: 'CRD_Type', style: 'text-center' },
  {
    header: '合計金額',
    field: 'TXN_PayAmt',
    style: 'text-right',
    format: (val: number) => (Number(val ?? 0)).toLocaleString(),
    isTotal: true,
  },
];

}
