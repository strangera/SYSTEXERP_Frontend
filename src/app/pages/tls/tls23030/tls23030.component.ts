import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TLS23030Service } from '../../../service/api/tls/tls23030.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
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
import { finalize } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { timeout, catchError, debounceTime, map } from 'rxjs/operators';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommonModule } from '@angular/common'; // ⬅️ 新增

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
    TableComponent,
    CommonModule,    
  ],
})
export class TLS23030Component extends BasicQueryPageComponent<any> {
    showSummary = false;
  data: any[] = [];
  totalRecords = 0;
payNoToTypeMap = new Map<string, string>();
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  sortMeta: any[] = [];
readonly defaultSort: any[] = [
  { field: 'TXN_Date', order: 1 },
  { field: 'ECR_No',   order: 1 },
  { field: 'TXN_No',   order: 1 },
];

  //
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [], // ✅ 修正為 []
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [], // ✅ 修正為 []
    PAY_NO: [] as string[],
    TXN_PayAmt_Start: [null],
    TXN_PayAmt_End: [null],
    TXN_Status: [], // ✅ 修正為 []
    TXN_MemCard: [''],
    CRD_Type: [], // ✅ 修正為 []
    CRD_No: [''],
    IsHaveTERM_No: [false],
    pay_taxtype: [''],
    org_id: [], // ✅ 修正為 []
    VOU_Check: false,
    rece_yn: [''],
    cash_yn: [''],
    tlt_building: [''],
    tlt_floor: [], // ✅ 修正為 []
    
   

   ...createPaginationConfig([
  { field: 'TXN_Date', order: 1 },
  { field: 'ECR_No',   order: 1 },
  { field: 'TXN_No',   order: 1 },]),
  });

  columns: any[] = [
    { field: 'TXN_Date',header: '銷售日期',visible: true,format: (val: string) => this.formatDate(val),},
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name',header: '櫃位名稱',visible: true,style: 'text-left',},
    { field: 'TXN_StatusName', header: '交易型態', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'TXN_PayAmt',header: '金額',visible: true,style: 'text-right',format: (val: number) => this.formatNumber(val),},
    { field: 'TXN_TaxAlwnc',header: '備抵稅額',visible: true,style: 'text-right',format: (val: number) => this.formatNumber(val),},
    { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
    { field: 'TXN_Time',header: '交易時間',visible: true,format: (val: string) => this.formatDateTime(val),},
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No',header: '信用卡卡號/條碼',visible: true,style: 'text-right',},
    // { field: 'IsHaveTERM_No', header: '是否分期', visible: true, format: (v: any) => this.getLabelFromOptions(v, this.WhetherOptions) },
    { field: 'TERM_No', header: '分期', visible: true },
    { field: 'TERM_Name', header: '是否分期', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  displayModeOptions: any[] = [];
  WhetherOptions: any[] = [];
  paymentTypeOptions: Array<{
  label: string;
  value: string;
  Name: string;
  No: string;
  PAY_Type: string;
}> = [];

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
    private  dropDownListService:DropDownListService
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
    this.initializePage('TLS23030', 'tls/tls23030cru', this.queryForm, (form) =>this.onSubmit(form),);

this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.dropDownListService
    .queryPOS1006_DropDownList()
    .pipe(untilDestroyed(this))
    .subscribe(res => {
      const rows = Array.isArray(res?.Data) ? res.Data : [];
      this.paymentTypeOptions = rows.map(x => {
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


    this.loadOptions(this.displayModeService.getDisplayModes(),'displayModeOptions',);
    this.loadOptions(this.whetherService.getWhetherOptions(), 'WhetherOptions');
   
    this.loadOptions(this.transactionTypeService.getTransactionTypes(),'transactionTypeOptions',);
    this.loadOptions(this.cardTypeService.getCardType(), 'cardTypeOptions');
   
    this.loadOptions(this.taxableService.getSystemTypes(), 'taxableOptions');
    this.loadOptions(this.discountService.getLocalDiscountOptions(),'discountOptions',);
    this.loadOptions(this.deductionbigCategoryService.getLocalDeductionCategories(),'deductionbigCategoryOptions',);
    this.loadOptions(this.commissionTypeService.getCommissionTypes(),'commissionTypeOptions',);
    this.loadOptions(this.floorService.getFloors(), 'floorOptions');
    this.loadOptions(this.tls11010Service.getBuildingOptions(),'BUILDING_NO_Options',);
    // this.loadOptions(this.txnStatusService.getTxnStatusOptions(),'txnStatusOptions',);

    // ✅ 保留 formLabel 的一行寫法
    this.loadOptions(
      this.tls11010Service.getOrgOptions(),
      'OrganizationCodeOptions',
      (x) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }),
    );

    this.loadOptions(this.ECRNoService.getECRNo(), 'ECRNoOptions', (x) => ({
      label: x.label,
      formLabel: `${x.value} - ${x.label}`,
      value: x.value,
    }));

    this.loadOptions(
      this.counterNameService.getCounters(),
      'CounterOptions',
      (x) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }),
    );
      }
private toBoolOrNull(v: any): boolean | null {
  if (typeof v === 'boolean') return v;
  if (v == null || v === '') return null; // 不傳值
  if (v === 'Y' || v === 'true' || v === 1 || v === '1') return true;
  if (v === 'N' || v === 'false' || v === 0 || v === '0') return false;
  return null; // 無法判斷就不傳
}

 // 放在 TLS23030Component 內
// ✅ 放進 TLS23030Component 內，覆蓋原本的 onSubmit
  // ✅ 修改：onSubmit 依 showSummary 分流
  onSubmit(form: FormGroup): void {
    this.loading = true;

    const raw: any = { ...form.getRawValue() };
    // ——— 依你原本處理：日期、陣列、數字、布林、排序 ———
    raw['TXN_DateStart'] = this.toYMD(raw['TXN_DateStart']);
    raw['TXN_DateEnd']   = this.toYMD(raw['TXN_DateEnd']);

    const ensureArr = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
    raw['ECR_No']     = ensureArr(raw['ECR_No']);
    raw['TLT_No']     = ensureArr(raw['TLT_No']);
    raw['TXN_Status'] = ensureArr(raw['TXN_Status']);
    raw['CRD_Type']   = ensureArr(raw['CRD_Type']);
    raw['org_id']     = ensureArr(raw['org_id']);
    raw['tlt_floor']  = ensureArr(raw['tlt_floor']);
    raw['PAY_NO']     = ensureArr(raw['PAY_NO']);

    const toNumOrNull = (v: any) => (v === '' || v == null ? null : Number(v));
    const emptyToNull = (v: any) => (v === '' ? null : v);
    raw['TXN_No_Start']     = toNumOrNull(raw['TXN_No_Start']);
    raw['TXN_No_End']       = toNumOrNull(raw['TXN_No_End']);
    raw['TXN_PayAmt_Start'] = toNumOrNull(raw['TXN_PayAmt_Start']);
    raw['TXN_PayAmt_End']   = toNumOrNull(raw['TXN_PayAmt_End']);
    raw['TXN_MemCard']      = emptyToNull(raw['TXN_MemCard']);
    raw['CRD_No']           = emptyToNull(raw['CRD_No']);
    raw['pay_taxtype']      = emptyToNull(raw['pay_taxtype']);
    raw['rece_yn']          = emptyToNull(raw['rece_yn']);
    raw['cash_yn']          = emptyToNull(raw['cash_yn']);
    raw['tlt_building']     = emptyToNull(raw['tlt_building']);
    raw['IsPayType']        = this.toBoolOrNull(raw['IsPayType']);
    raw['IsHaveTERM_No']    = this.toBoolOrNull(raw['IsHaveTERM_No']);

    // 排序：沿用你現有的 sort 邏輯
    raw['SortBy'] = Array.isArray(raw['SortBy']) && raw['SortBy'].length
      ? raw['SortBy'] : (this.sortMeta.length ? this.sortMeta : this.defaultSort);
    if (!raw['OrderBy']) delete raw['OrderBy'];

    // === 分流 ===
    const done = () => (this.loading = false);

    if (this.showSummary) {
      // ✅ 彙總查詢
      this.tls23030Service.queryTLS23030Summary(raw)
        .pipe(timeout(60_000), catchError(err => {
          console.error('TLS23030 Summary 失敗:', err);
          this.summaryData = [];
          this.summaryTotals = { totalPayAmt: 0, totalTaxAlwnc: 0 };
          return of({ Data: [] } as any);
        }), finalize(done))
        .subscribe((res: any) => {
          const packs = Array.isArray(res?.Data) ? res.Data : [];
          // 累計總計
          const totals = packs.reduce((acc: any, p: any) => ({
            totalPayAmt:   acc.totalPayAmt   + Number(p?.totalPayAmt ?? 0),
            totalTaxAlwnc: acc.totalTaxAlwnc + Number(p?.totalTaxAlwnc ?? 0),
          }), { totalPayAmt: 0, totalTaxAlwnc: 0 });

          this.summaryTotals = totals;

          // 展開 SummaryDetails
          const details = packs.flatMap((p: any) =>
            Array.isArray(p?.SummaryDetails) ? p.SummaryDetails : []
          );

          this.summaryData = details.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${r?.PAY_NO ?? ''}|${i}`,
          }));

          // 切到彙總 → 清空明細
          this.data = [];
          this.totalRecords = this.summaryData.length;
        });

    } else {
      // ✅ 原本明細查詢
      this.tls23030Service.queryTLS23030(raw)
        .pipe(timeout(60_000), catchError(err => {
          console.error('TLS23030 查詢失敗:', err);
          this.data = [];
          this.totalRecords = 0;
          return of({ Data: [], TotalCount: 0 } as any);
        }), finalize(done))
        .subscribe((res: any) => {
          const details = this.extractTLS23030Details(res);
          this.data = details;
          this.summaryData = []; // 清空彙總
          this.totalRecords = res?.TotalCount ?? details.length ?? 0;
        });
    }
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

/** 把回傳物件中的 tLS23030_Details 全部攤平 */
private extractTLS23030Details(res: any): any[] {
  const data = Array.isArray(res?.Data) ? res.Data : [];

  // Data[] → 每筆裡面的 tLS23030_SubTotals[] → 每小計裡的 tLS23030_Details[]
  const flat = data.flatMap((grp: any) =>
    (Array.isArray(grp?.tLS23030_SubTotals) ? grp.tLS23030_SubTotals : []).flatMap(
      (st: any) => (Array.isArray(st?.tLS23030_Details) ? st.tLS23030_Details : [])
    )
  );

  return flat;
}




  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  /** yyyy/MM/dd */
  private formatDate(val: string): string {
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  /** yyyy/MM/dd HH:mm */
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

  /** 千分位 */
  private formatNumber(val: number): string {
    return val?.toLocaleString('en-US') || '0';
  }
  // （可選）若要在畫面上顯示總計，可保留
  summaryTotals = { totalPayAmt: 0, totalTaxAlwnc: 0 };

  // ✅ 新增：切換時回第 1 頁並重查
  onToggleSummary() {
    this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }
    // ✅ 新增：彙總資料與欄位
  summaryData: any[] = [];
  summaryColumns = [
    { field: 'TXN_Date',     header: '銷售日期',     visible: true,  format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No',       header: '收銀機號',     visible: true },
    { field: 'tlt_no',       header: '專櫃編號',     visible: true },
    { field: 'tlt_name',     header: '櫃位名稱',     visible: true,  style: 'text-left' },
    { field: 'PAY_NO',       header: '付款別代號',   visible: true },
    { field: 'PAY_NAME',     header: '付款別',       visible: true },
    { field: 'TXN_PayAmt',   header: '金額',         visible: true,  style: 'text-right', format: (n: number) => this.formatNumber(n) },
    { field: 'TXN_TaxAlwnc', header: '備抵稅額',     visible: true,  style: 'text-right', format: (n: number) => this.formatNumber(n) },
    { field: 'org_id',       header: '組織編號',     visible: true },
    { field: 'Org_Name',     header: '組織名稱',     visible: true },
  ];

}
