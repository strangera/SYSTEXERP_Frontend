// src/app/pages/tls/tls23030/tls23030.component.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, timeout, catchError } from 'rxjs/operators';
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

type DisplayMode = 'Report' | 'SummaryReport';

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
    TableComponent, // 彙總表
    Table2Component, // 明細（小計/總計）
    CommonModule,
    ButtonModule,
  ],
})
export class TLS23030Component extends BasicQueryPageComponent<any> {
  // === 檢視狀態 ===
  showSummary = false;

  // === 明細資料 ===
  data: any[] = [];
  totalRecords = 0;

  // === 彙總資料 ===
  summaryData: any[] = [];
  summaryTotals = { totalPayAmt: 0, totalTaxAlwnc: 0 };

  // 匯出
  btnLoading = false;
  historyRequestBody: any | null = null;

  // 排序狀態
  sortMeta: any[] = [];
  readonly groupByField = 'PAY_NO'; // ⬅️ 以「付款別」分組顯示小計
  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 }, // 分組欄位放第一順位
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No',   order: 1 },
    { field: 'TXN_No',   order: 1 },
  ];

  /** 去重簽章 + 去抖動 */
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  /** 後端是否需要分頁/排序參數 */
  private readonly includePagingAndSorting = true;

  payNoToTypeMap = new Map<string, string>();

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單 =====
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

    // 內建預設排序（與 defaultSort 同步）
    ...createPaginationConfig(this.defaultSort),
  });

  // ===== 欄位（在金額欄位標記 isTotal/isSubTotal） =====
  columns: any[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (val: string) => this.formatDate(val) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_StatusName', header: '交易型態', visible: true },
    { field: 'PAY_NO', header: '付款別代號', visible: false },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => this.money(val),
      isTotal: true,
      isSubTotal: true,
    },
    {
      field: 'TXN_TaxAlwnc',
      header: '備抵稅額',
      visible: true,
      style: 'text-right',
      format: (val: number) => this.money(val),
      isTotal: true,
      isSubTotal: true,
    },
    { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '交易時間', visible: true, format: (val: string) => this.formatDateTime(val) },
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, style: 'text-right' },
    { field: 'TERM_No', header: '分期', visible: true },
    {
      field: 'IsHaveTERM_No',
      header: '是否分期',
      visible: true,
      format: (_: any, row: any) => {
        const term = Number(row?.TERM_No ?? 0);
        return (!term || term === 0 || term === 1) ? '否' : '是';
      }
    },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  summaryColumns = [
    { field: 'TXN_Date',     header: '銷售日期',  visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No',       header: '收銀機號',  visible: true },
    { field: 'tlt_no',       header: '專櫃編號',  visible: true },
    { field: 'tlt_name',     header: '櫃位名稱',  visible: true, style: 'text-left' },
    { field: 'PAY_NO',       header: '付款別代號', visible: true },
    { field: 'PAY_NAME',     header: '付款別',    visible: true },
    { field: 'TXN_PayAmt',   header: '金額',      visible: true, style: 'text-right', format: (n: number) => this.money(n) },
    { field: 'TXN_TaxAlwnc', header: '備抵稅額',  visible: true, style: 'text-right', format: (n: number) => this.money(n) },
    { field: 'org_id',       header: '組織編號',  visible: true },
    { field: 'Org_Name',     header: '組織名稱',  visible: true },
  ];

  // ===== 下拉選單 =====
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

  // ===== 小計/總計容器（對應後端鍵名） =====
  detailTotals: Record<string, number> = {};
  detailTotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'Total_TXN_PayAmt',
    TXN_TaxAlwnc: 'Total_TXN_TaxAlwnc',
  };

  detailSubtotals: Record<string, Record<string, number>> = {};
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'SubTotal_TXN_PayAmt',
    TXN_TaxAlwnc: 'SubTotal_TXN_TaxAlwnc',
  };

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
  ) {
    super();
  }

  private loadOptions<K extends keyof TLS23030Component>(
    serviceCall: Observable<any[]>,
    target: K,
    mapFn?: (x: any) => any,
  ) {
    serviceCall.subscribe((res: any[] = []) => {
      (this as any)[target] = mapFn ? res.map(mapFn) : res;
    });
  }

  ngOnInit(): void {
    this.initializePage('TLS23030', 'tls/tls23030cru', this.queryForm, (form) => this.onSubmit(form));

    // 初始化排序狀態並同步到表單
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

    this.dropDownListService
      .queryPOS1006_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.paymentTypeOptions = rows.map((x: any) => {
          this.payNoToTypeMap.set(x.No ?? '', x.PAY_Type ?? '');
          return {
            label: `${x.No ?? ''}-${x.Name ?? ''}`,
            value: x.No ?? '',
            Name: x.Name ?? '',
            No: x.No ?? '',
            PAY_Type: x.PAY_Type ?? '',
          };
        });
      });

    this.loadOptions(this.displayModeService.getDisplayModes(), 'displayModeOptions');
    this.loadOptions(this.whetherService.getWhetherOptions(), 'WhetherOptions');
    this.loadOptions(this.transactionTypeService.getTransactionTypes(), 'transactionTypeOptions');
    this.loadOptions(this.cardTypeService.getCardType(), 'cardTypeOptions');
    this.loadOptions(this.taxableService.getSystemTypes(), 'taxableOptions');
    this.loadOptions(this.discountService.getLocalDiscountOptions(), 'discountOptions');
    this.loadOptions(this.deductionbigCategoryService.getLocalDeductionCategories(), 'deductionbigCategoryOptions');
    this.loadOptions(this.commissionTypeService.getCommissionTypes(), 'commissionTypeOptions');
    this.loadOptions(this.floorService.getFloors(), 'floorOptions');
    this.loadOptions(this.tls11010Service.getBuildingOptions(), 'BUILDING_NO_Options');

    this.loadOptions(
      this.tls11010Service.getOrgOptions(),
      'OrganizationCodeOptions',
      (x) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value }),
    );
    this.loadOptions(this.ECRNoService.getECRNo(), 'ECRNoOptions', (x) => ({
      label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
    }));
    this.loadOptions(this.counterNameService.getCounters(), 'CounterOptions', (x) => ({
      label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
    }));
  }

  /** 表格 lazy 事件（分頁/排序） */
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    const nextSort = this.ensureGroupFirst(event.SortBy ?? []);
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSortStr = JSON.stringify(nextSort);
    const nextPageIndex = currSort !== nextSortStr ? 1 : (event.pageIndex ?? form.value.pageIndex ?? 1);

    form.patchValue({
      pageIndex: nextPageIndex,
      pageSize : event.pageSize ?? form.value.pageSize,
      SortBy   : nextSort,
    }, { emitEvent: false });

    // 更新表頭排序狀態
    this.sortMeta = nextSort.map(s => ({ ...s }));

    // 去重簽章（避免重複請求）
    const sig = JSON.stringify({
      pageIndex: form.value.pageIndex,
      pageSize : form.value.pageSize,
      SortBy   : form.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

  // === 提交查詢（明細/彙總共用） ===
  onSubmit(form: FormGroup): void {
    this.loading = true;

    // 取 raw 並標準化
    const raw: any = { ...form.getRawValue() };

    raw['TXN_DateStart'] = this.toYMD(raw['TXN_DateStart']);
    raw['TXN_DateEnd']   = this.toYMD(raw['TXN_DateEnd']);

    const ensureArr = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
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

    // 分頁
    const pageSize  = Number.isFinite(raw?.pageSize)  ? Number(raw.pageSize)  : 10;
    const pageIndex = Number.isFinite(raw?.pageIndex) ? Number(raw.pageIndex) : 1;


    // 排序：確保分組欄位優先
    const sortByArr = this.ensureGroupFirst(
      (Array.isArray(raw?.SortBy) && raw.SortBy.length ? raw.SortBy : (this.sortMeta.length ? this.sortMeta : this.defaultSort))
    ).map((s: any) => ({ ...s }));



    // 最終 payload（去除空值/空陣列）
    const payload: any = {
      TXN_DateStart: raw.TXN_DateStart,
      TXN_DateEnd  : raw.TXN_DateEnd,
      ECR_No       : raw.ECR_No,
      TXN_No_Start : raw.TXN_No_Start,
      TXN_No_End   : raw.TXN_No_End,
      TLT_No       : raw.TLT_No,
      PAY_NO       : raw.PAY_NO,
      TXN_PayAmt_Start: raw.TXN_PayAmt_Start,
      TXN_PayAmt_End  : raw.TXN_PayAmt_End,
      TXN_Status   : raw.TXN_Status,
      TXN_MemCard  : raw.TXN_MemCard,
      CRD_Type     : raw.CRD_Type,
      CRD_No       : raw.CRD_No,
      IsHaveTERM_No: raw.IsHaveTERM_No,
      pay_taxtype  : raw.pay_taxtype,
      org_id       : raw.org_id,
      VOU_Check    : raw.VOU_Check,
      rece_yn      : raw.rece_yn,
      cash_yn      : raw.cash_yn,
      tlt_building : raw.tlt_building,
      tlt_floor    : raw.tlt_floor,
    };

    if (this.includePagingAndSorting) {
      Object.assign(payload, {
        pageSize,
        pageIndex,

        SortBy:  sortByArr,

      });
    }

    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    // 匯出沿用同一包參數
    this.historyRequestBody = { ...payload };

    const done = () => (this.loading = false);

    if (this.showSummary) {
      // ✅ 彙總查詢（維持原本）
      this.tls23030Service.queryTLS23030Summary(payload)
        .pipe(
          timeout(60_000),
          catchError(err => {
            console.error('TLS23030 Summary 失敗:', err);
            this.summaryData = [];
            this.summaryTotals = { totalPayAmt: 0, totalTaxAlwnc: 0 };
            return of({ Data: [] } as any);
          }),
          finalize(done)
        )
        .subscribe((res: any) => {
          const packs = Array.isArray(res?.Data) ? res.Data : [];
          const totals = packs.reduce((acc: any, p: any) => ({
            totalPayAmt:   acc.totalPayAmt   + Number(p?.totalPayAmt ?? 0),
            totalTaxAlwnc: acc.totalTaxAlwnc + Number(p?.totalTaxAlwnc ?? 0),
          }), { totalPayAmt: 0, totalTaxAlwnc: 0 });
          this.summaryTotals = totals;

          const details = packs.flatMap((p: any) =>
            Array.isArray(p?.SummaryDetails) ? p.SummaryDetails : []
          );

          this.summaryData = details.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${r?.PAY_NO ?? ''}|${i}`,
          }));

          this.data = [];
          this.totalRecords = this.summaryData.length;
        });

      return;
    }

    // ✅ 明細查詢（加入小計/總計）
    this.tls23030Service.queryTLS23030(payload)
      .pipe(
        timeout(60_000),
        catchError(err => {
          console.error('TLS23030 查詢失敗:', err);
          this.data = [];
          this.totalRecords = 0;
          // 清掉加總容器
          this.detailTotals = {};
          this.detailSubtotals = {};
          return of({ Data: [], TotalCount: 0 } as any);
        }),
        finalize(done)
      )
      .subscribe((res: any) => {
        // wrappers 可能是 array or object
        const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
        const pageRows: any[] = [];

        // 後端總計聚合
        const totalAgg = {
          Total_TXN_PayAmt: 0,
          Total_TXN_TaxAlwnc: 0,
        };

        // 小計：以付款別（PAY_NO）為 group key
        const subMap: Record<string, Record<string, number>> = {};

        for (const w of wrappers) {
          totalAgg.Total_TXN_PayAmt += Number(w?.Total_TXN_PayAmt ?? 0);
          totalAgg.Total_TXN_TaxAlwnc += Number(w?.Total_TXN_TaxAlwnc ?? 0);

          const subTotals = w?.tLS23030_SubTotals ?? w?.TLS23030_SubTotals ?? w?.tls23030_SubTotals ?? [];
          if (!Array.isArray(subTotals)) continue;

          for (const st of subTotals) {
            const details = st?.tLS23030_Details ?? st?.TLS23030_Details ?? st?.tls23030_Details ?? [];
            // 以第一筆明細的 PAY_NO 當作群組鍵（和 [groupRowsBy]="PAY_NO" 對齊）
// ✅ 這行建議也順手補 trim，避免 "10 " / "10" 對不到
const groupKey = String(details?.[0]?.PAY_NO ?? '').trim();

const curr = subMap[groupKey] ?? {
  SubTotal_TXN_PayAmt: 0,
  SubTotal_TXN_TaxAlwnc: 0,
};

// ⬇⬇ 這兩行改成中括號
curr['SubTotal_TXN_PayAmt']   = (curr['SubTotal_TXN_PayAmt']   ?? 0) + Number(st?.SubTotal_TXN_PayAmt ?? 0);
curr['SubTotal_TXN_TaxAlwnc'] = (curr['SubTotal_TXN_TaxAlwnc'] ?? 0) + Number(st?.SubTotal_TXN_TaxAlwnc ?? 0);

subMap[groupKey] = curr;


            // 當頁明細
            for (let i = 0; i < details.length; i++) {
              const item = details[i];
              const dateKey = String(item.TXN_Date ?? '').slice(0, 19);
              const key = `${dateKey}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;
              pageRows.push({ ...item, _rowKey: key });
            }
          }
        }

        // 表格資料
        this.data = pageRows;
        this.summaryData = [];

        // 總筆數（兼容多種位置）
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

        // 餵給 app-table2 的總計/小計
        this.detailTotals = totalAgg;
        this.detailSubtotals = subMap;
      });
  }

  /** yyyy-MM-dd */
  private toYMD(d: any): string | null {
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date.getTime())
      ? null
      : `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
          .getDate()
          .toString()
          .padStart(2, '0')}`;
  }

  private toBoolOrNull(v: any): boolean | null {
    if (typeof v === 'boolean') return v;
    if (v == null || v === '') return null;
    if (v === 'Y' || v === 'true' || v === 1 || v === '1') return true;
    if (v === 'N' || v === 'false' || v === 0 || v === '0') return false;
    return null;
  }

  // ===== 工具 =====
  private formatDate(val: string): string {
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  private formatDateTime(val: string): string {
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    const yyyy = date.getFullYear();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${yyyy}/${MM}/${dd} ${HH}:${mm}`;
  }

  money(val: number): string {
    return Number(val ?? 0).toLocaleString('en-US');
  }

  // 切換明細/彙總：回到第一頁並重查
  onToggleSummary() {
    this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  private ensureGroupFirst(sortBy: any[] | undefined): any[] {
    const g = this.groupByField;
    const list = Array.isArray(sortBy) ? [...sortBy] : [];
    const exist = list.find((s) => s.field === g);
    const rest = list.filter((s) => s.field !== g);
    const order = exist?.order ?? 1; // 預設 ASC
    return [{ field: g, order }, ...rest];
  }

  // ========= 匯出 =========
onExportPDF() {
  if (!this.historyRequestBody) {
    this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
    return;
  }
  this.btnLoading = true;

  const obs = this.showSummary
    ? this.tls23030Service.exportTLS23030SummaryPDF(this.historyRequestBody)
    : this.tls23030Service.exportTLS23030PDF(this.historyRequestBody);

  obs.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
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

  const obs = this.showSummary
    ? this.tls23030Service.exportTLS23030SummaryExcel(this.historyRequestBody)
    : this.tls23030Service.exportTLS23030Excel(this.historyRequestBody);

  obs.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
     .subscribe({
       next: (response: HttpResponse<Blob>) =>
         this.handleFileExport(response, '.xlsx'),
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

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
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
}
