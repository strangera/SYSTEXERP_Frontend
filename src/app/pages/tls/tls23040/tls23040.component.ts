import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import {
  createPaginationConfig,
  LazyLoadEvent,
} from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrls: ['./tls23040.component.scss'],
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
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> {
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;
  private firstLazyFired = false;

  data: any[] = [];
  totalRecords = 0;
  backendTotals: Record<string, number> | null = null;
  // ===== 新增：檢視模式（預設 invoice）=====
viewMode: 'invoice' | 'payment' | 'discount' = 'invoice';
// ===== 新增：三組資料 =====
invoiceRows: any[] = [];
paymentRows: any[] = [];
discountRows: any[] = [];

  // 🔽 排序設定
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: 'TXN_Date', order: -1 },
    { field: 'ECR_No',   order: 1 },
    { field: 'TXN_No',   order: 1 },
  ];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    ECR_No: [],
    TXN_No_Start: [null],
    TXN_No_End:   [null],
    TLT_No: [],
    TXN_Status: [],
    TXN_FlagStatus: [],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [],
    org_id: [],
    // 🔽 這裡帶入排序欄位
    ...createPaginationConfig([
      { field: 'TXN_Date', order: -1 },
      { field: 'ECR_No',   order: 1 },
      { field: 'TXN_No',   order: 1 },
    ]),
  });

  statusFlagOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  txnStatusOptions: any[] = [
    { value: '1', label: '正常交易' },
    { value: '2', label: '作廢' },
    { value: '3', label: '退貨' },
  
  ];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  WhetherOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23040Service: TLS23040Service,
    private statusFlagService: StatusFlagService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private txnStatusService: TxnStatusService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23040', 'tls/tls23040cru', this.queryForm, (form) =>
      this.onSubmit(form),
    );
    // 🔽 初始化排序 meta
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.statusFlagService
      .getStatusFlags()
      .subscribe((data) => (this.statusFlagOptions = data));

    this.TXN_SubtypeService.getTXNSubtype().subscribe(
      (data) => (this.TXN_SubtypeOptions = data),
    );

    // this.txnStatusService
    //   .getTxnStatusOptions()
    //   .subscribe((data) => (this.txnStatusOptions = data));

    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));

    this.tls11010Service
      .getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));

    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  /** 子層 Table lazy 事件 */
  override onLazyLoadData(event: LazyLoadEvent, queryForm: FormGroup): void {
    // 1) 當排序變更時回到第一頁
    const currentSort = JSON.stringify(queryForm.value?.SortBy ?? []);
    const nextSort    = JSON.stringify(event.SortBy ?? []);
    const nextPageIdx = currentSort !== nextSort ? 1
                      : (event.pageIndex ?? queryForm.value.pageIndex ?? 1);

    // 2) 同步回表單（不觸發 valueChanges）
    queryForm.patchValue(
      {
        pageIndex: nextPageIdx,
        pageSize : event.pageSize ?? queryForm.value.pageSize,
        SortBy   : event.SortBy ?? queryForm.value.SortBy,
      },
      { emitEvent: false },
    );

    // 3) 更新表頭多欄位排序狀態
    this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

    // 4) 生成這次查詢的簽章，避免重複打 API
    const sig = JSON.stringify({
      pageIndex: queryForm.value.pageIndex,
      pageSize : queryForm.value.pageSize,
      SortBy   : queryForm.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    // 5) 只呼叫一次 onSubmit（無需在 HTML 再呼叫）
    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(queryForm), 0);
  }

onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const raw = this.queryForm.getRawValue() as any;

    // yyyy-MM-ddTHH:mm:ss（以本地時間、去掉時區偏移）
    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);
    };

    // 1) 分頁 / 排序
    const pageSize  = Number(raw?.pageSize)  || 10;
    const pageIndex = Number(raw?.pageIndex) || 1;
    const offset    = Math.max(0, (pageIndex - 1) * pageSize);

    const sortByArr = Array.isArray(raw?.SortBy) && raw.SortBy.length
      ? raw.SortBy
      : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

    const orderBy = sortByArr.length
      ? sortByArr.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
      : undefined;

    // 2) 組 payload
    const payload: any = {
      ...raw,
      TXN_DateStart: toIso(raw?.TXN_DateStart ?? this.yesterday),
      TXN_DateEnd:   toIso(raw?.TXN_DateEnd   ?? this.yesterday),
      // 數字欄位轉型
      ...(raw?.TXN_No_Start !== '' && raw?.TXN_No_Start != null ? { TXN_No_Start: Number(raw.TXN_No_Start) } : {}),
      ...(raw?.TXN_No_End   !== '' && raw?.TXN_No_End   != null ? { TXN_No_End:   Number(raw.TXN_No_End)   } : {}),
      // 分頁/排序鍵
      pageSize,
      pageIndex,
      Offset: offset,
      SortBy: sortByArr,
      ...(orderBy ? { OrderBy: orderBy } : {}),
    };

    // 3) 清空空值（保留 0/false）
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    // 4) 呼叫 API
    this.loading = true;
    this.messageService?.blockUi();

    this.tls23040Service.queryTLS23040(payload).subscribe({
      next: (res) => {
        const packs = Array.isArray(res?.Data) ? res.Data : [];

        // ===== 發票明細 =====
        const invoiceDetails = packs.flatMap((p: any) =>
          Array.isArray(p?.invoice?.InvoiceDetail) ? p.invoice.InvoiceDetail : []
        );
        this.invoiceRows = invoiceDetails.map((r: any, i: number) => {
          const isNormal = String(r?.TXN_StatusName ?? '') === '正常交易';
          return {
            ...r,
            ORG_TXN_Date: isNormal ? '' : r?.ORG_TXN_Date ?? '',
            ORG_ECR_No:   isNormal ? '' : r?.ORG_ECR_No   ?? '',
            ORG_TXN_No:   isNormal ? '' : r?.ORG_TXN_No   ?? '',
            _rowKey: `inv|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
          };
        });

        // ===== 付款明細 =====
        const paymentDetails = packs.flatMap((p: any) =>
          Array.isArray(p?.payment?.PaymentDetail) ? p.payment.PaymentDetail : []
        );
        this.paymentRows = paymentDetails.map((r: any, i: number) => ({
          ...r,
          _rowKey: `pay|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
        }));

        // ===== 折扣明細 =====
        const discountDetails = packs.flatMap((p: any) =>
          Array.isArray(p?.discount?.DiscountDetail) ? p.discount.DiscountDetail : []
        );
        this.discountRows = discountDetails.map((r: any, i: number) => ({
          ...r,
          _rowKey: `disc|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
        }));

        // 依目前檢視模式更新總計與筆數
        this.updateBackendTotalsForView();
        this.totalRecords = Number(res?.TotalCount ?? this.activeData.length ?? 0);
      },
      error: () => {
        this.invoiceRows = [];
        this.paymentRows = [];
        this.discountRows = [];
        this.totalRecords = 0;
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      },
    });
  });
}



  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  
  // ===== 新增：動態欄位/資料 getter =====
get activeColumns() {
  return this.viewMode === 'payment' ? this.paymentColumns
       : this.viewMode === 'discount' ? this.discountColumns
       : this.invoiceColumns;
}
get activeData() {
  return this.viewMode === 'payment' ? this.paymentRows
       : this.viewMode === 'discount' ? this.discountRows
       : this.invoiceRows;
}

// ===== 新增：切換時更新總計與筆數 =====
onViewChange() {
  this.updateBackendTotalsForView();
  this.totalRecords = this.activeData.length;
}
  private formatNumber(val: number): string {
    return val?.toLocaleString('en-US') || '0';
  }
// ===== 新增：依檢視模式設定 backendTotals（欄位名需對應 columns 的 field）=====
private updateBackendTotalsForView() {
  if (this.viewMode === 'invoice') {
    // 來自後端 invoice.TotalGUI / TotalSaleAmt，若沒有就用明細加總
    const guiSum  = this.invoiceRows.reduce((s, r) => s + Number(r?.TXN_TotGUI ?? 0), 0);
    const saleSum = this.invoiceRows.reduce((s, r) => s + Number(r?.TXN_TotSaleAmt ?? 0), 0);
    this.backendTotals = { TXN_TotGUI: guiSum, TXN_TotSaleAmt: saleSum };
  } else if (this.viewMode === 'payment') {
    const amt = this.paymentRows.reduce((s, r) => s + Number(r?.TXN_PayAmt ?? 0), 0);
    const tax = this.paymentRows.reduce((s, r) => s + Number(r?.TXN_TaxAlwnc ?? 0), 0);
    this.backendTotals = { TXN_PayAmt: amt, TXN_TaxAlwnc: tax };
  } else {
    const salePrc = this.discountRows.reduce((s, r) => s + Number(r?.PLU_SalePrc ?? 0), 0);
    const net     = this.discountRows.reduce((s, r) => s + Number(r?.TXN_Net ?? 0), 0);
    const tax     = this.discountRows.reduce((s, r) => s + Number(r?.TXN_Tax ?? 0), 0);
    this.backendTotals = { PLU_SalePrc: salePrc, TXN_Net: net, TXN_Tax: tax };
  }
}
  /** yyyy/MM/dd */
  private formatDate(val: string): string {
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  // ★原本的 columns 改名：
invoiceColumns = [
  {
    field: 'TXN_Date', header: '銷售日期', visible: true,
    format: (val: string) => {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val :
        `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    },
  },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'TXN_No', header: '交易序號', visible: true },
  { field: 'tlt_no', header: '專櫃編號', visible: true },
  { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
  { field: 'gui_track', header: '發票起始號碼(字軌)', visible: true },
  { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
  { field: 'GUIEndNo', header: '發票結束號碼', visible: true },
  { field: 'TXN_TotGUI', header: '發票金額', isTotal: true, visible: true, style: 'text-right',
    format: (val: number) => val?.toLocaleString('en-US') || '0' },
  { field: 'TXN_TotSaleAmt', header: '業績金額', isTotal: true, visible: true, style: 'text-right',
    format: (val: number) => val?.toLocaleString('en-US') || '0' },
  { field: 'TXN_StatusName', header: '交易型態', visible: true,
    format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions) },
  { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
  { field: 'USR_No', header: '收銀員', visible: true },
  { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
  {
    field: 'ORG_TXN_Date', header: '原交易日期', visible: true,
    format: (val: string) => {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val :
        `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    },
  },
  { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
  { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
  { field: 'TXN_MemCard', header: '會員卡號', visible: true },
  { field: 'TXN_TotPayScoreAmt', header: '會員積點折抵', visible: true, style: 'text-right',
    format: (val: number) => val?.toLocaleString('en-US') || '0' },
];


// ===== 新增：Payment 欄位 =====
paymentColumns = [
  { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'TXN_No', header: '交易序號', visible: true },
  { field: 'tlt_no', header: '專櫃編號', visible: true },
  { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
  { field: 'PAY_NO', header: '付款別代號', visible: true },
  { field: 'PAY_NAME', header: '付款別', visible: true },
  { field: 'TXN_PayAmt', header: '金額', visible: true, isTotal: true, style: 'text-right',
    format: (val: number) => this.formatNumber(val) },
  { field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true, isTotal: true, style: 'text-right',
    format: (val: number) => this.formatNumber(val) },
  { field: 'CRD_Name', header: '信用卡別', visible: true },
  { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, style: 'text-right' },
  { field: 'TERM_No', header: '分期', visible: true },
];

// ===== 新增：Discount 欄位 =====
discountColumns = [
  { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'TXN_No', header: '交易序號', visible: true },
  { field: 'tlt_no', header: '專櫃編號', visible: true },
  { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
  { field: 'TXN_GUINo', header: '發票號碼', visible: true },
  { field: 'PLU_SalePrc', header: '單項售價', visible: true, isTotal: true, style: 'text-right',
    format: (val: number) => this.formatNumber(val) },
  { field: 'TXN_Net', header: '未稅(免稅)金額', visible: true, isTotal: true, style: 'text-right',
    format: (val: number) => this.formatNumber(val) },
  { field: 'TXN_Tax', header: '稅額', visible: true, isTotal: true, style: 'text-right',
    format: (val: number) => this.formatNumber(val) },
  { field: 'tlt_id_desc', header: '商品抽成類別', visible: true },
  { field: 'TXN_DiscCode', header: '歸屬折扣代號', visible: true },
  { field: 'TXN_DiscName', header: '歸屬折扣名稱', visible: true },
  { field: 'PLU_TaxTypeName', header: '稅別名稱', visible: true },
  { field: 'PLU_MagNo', header: '單品編號', visible: true },
  { field: 'TXN_StatusName', header: '狀態', visible: true },
];
}
