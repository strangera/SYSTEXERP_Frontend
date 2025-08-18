import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { timeout, catchError, debounceTime } from 'rxjs/operators';
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
import { Observable } from 'rxjs';
import { TableComponent } from '@shared/componentkit/table/table.component';

type DisplayMode = 'Report' | 'SummaryReport';

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

  ],
})
export class TLS23030Component extends BasicQueryPageComponent<any> {

  data: any[] = [];
  totalRecords = 0;


  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 
   queryForm = this.formBuilder.group({
    
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [], // ✅ 修正為 []
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [], // ✅ 修正為 []
    PAY_Type: [], // ✅ 修正為 []
    TXN_PayAmt_Start: [null],
    TXN_PayAmt_End: [null],
    TXN_Status: [], // ✅ 修正為 []
    TXN_MemCard: [''],
    CRD_Type: [], // ✅ 修正為 []
    CRD_No: [''],
    pay_taxtype: [''],
    org_id: [], // ✅ 修正為 []
    IsPayType: [false],
    rece_yn: [''],
    cash_yn: [''],
    tlt_building: [''],
    tlt_floor: [], // ✅ 修正為 []
    PAY_NO: [], // ✅ 修正為 []
    IsHaveTERM_No: [false],

    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

columns: any[] = [
  { field: 'TXN_Date', header: '銷售日期', visible: true, format: (val: string) => this.formatDate(val) },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'TXN_No', header: '交易序號', visible: true },
  { field: 'tlt_no', header: '專櫃編號', visible: true },
  { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
  { field: 'TXN_StatusName', header: '交易型態', visible: true, },
  { field: 'PAY_NAME', header: '付款別', visible: true,},
  { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: (val: number) => this.formatNumber(val) },
  { field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true, style: 'text-right', format: (val: number) => this.formatNumber(val) },
  { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
  { field: 'TXN_Time', header: '交易時間', visible: true, format: (val: string) => this.formatDateTime(val) },
  { field: 'CRD_Name', header: '信用卡別', visible: true },
  { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, style: 'text-right' },
  // { field: 'IsHaveTERM_No', header: '是否分期', visible: true, format: (v: any) => this.getLabelFromOptions(v, this.WhetherOptions) },
   { field: 'TERM_No', header: '分期', visible: true },
  { field: 'TERM_Name', header: '是否分期', visible: true },
  { field: 'TXN_MemCard', header: '會員卡號', visible: true },
  { field: 'org_id', header: '組織編號', visible: true },
  { field: 'Org_Name', header: '組織名稱', visible: true,},
];


  displayModeOptions: any[] = [];
  WhetherOptions: any[] = [];
  paymentTypeOptions: any[] = [];
  transactionTypeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  ticketStatusOptions: any[] = [];
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  

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
  ) {
    super();
  }
    private loadOptions<K extends keyof TLS23030Component>(
      serviceCall: Observable<any[]>,
      target: K,
      mapFn?: (x: any) => any
    ) {
      serviceCall.subscribe((res: any[] = []) => {
        (this as any)[target] = mapFn ? res.map(mapFn) : res;
      });
    }


  ngOnInit(): void {
  this.initializePage('TLS23030', 'tls/tls23030cru', this.queryForm, (form) => this.onSubmit(form));

  this.loadOptions(this.displayModeService.getDisplayModes(), 'displayModeOptions');
  this.loadOptions(this.whetherService.getWhetherOptions(), 'WhetherOptions');
  this.loadOptions(this.paymentTypeService.getPaymentTypes(), 'paymentTypeOptions');
  this.loadOptions(this.transactionTypeService.getTransactionTypes(), 'transactionTypeOptions');
  this.loadOptions(this.cardTypeService.getCardType(), 'cardTypeOptions');
  this.loadOptions(this.ticketStatusService.getTicketStatuses(), 'ticketStatusOptions');
  this.loadOptions(this.taxableService.getSystemTypes(), 'taxableOptions');
  this.loadOptions(this.discountService.getLocalDiscountOptions(), 'discountOptions');
  this.loadOptions(this.deductionbigCategoryService.getLocalDeductionCategories(), 'deductionbigCategoryOptions');
  this.loadOptions(this.commissionTypeService.getCommissionTypes(), 'commissionTypeOptions');
  this.loadOptions(this.floorService.getFloors(), 'floorOptions');
  this.loadOptions(this.tls11010Service.getBuildingOptions(), 'BUILDING_NO_Options');
  this.loadOptions(this.txnStatusService.getTxnStatusOptions(), 'txnStatusOptions');

  // ✅ 保留 formLabel 的一行寫法
  this.loadOptions(this.tls11010Service.getOrgOptions(), 'OrganizationCodeOptions', 
    (x) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })
  );

  this.loadOptions(this.ECRNoService.getECRNo(), 'ECRNoOptions', 
    (x) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })
  );

  this.loadOptions(this.counterNameService.getCounters(), 'CounterOptions', 
    (x) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })
  );
}


  private cleanFormPayload(payload: any): any {
    for (const key in payload) {
      const val = payload[key];
      if (val === '' || val === null || (Array.isArray(val) && val.length === 0)) {
        payload[key] = null;
      }
    }
    if (payload['IsHaveTERM_No'] === 'Y') payload['IsHaveTERM_No'] = true;
    if (payload['IsHaveTERM_No'] === 'N') payload['IsHaveTERM_No'] = false;

    return {
      ...payload,
      pageSize: payload.pageSize ?? 30,
      pageIndex: (payload.pageIndex ?? 1) - 1,
      Offset: 0,
      OrderBy: '',
      SortBy: payload.SortBy ?? [{ field: 'ID', order: 1 }],
    };
  }

  onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => this.doQuery());
}

/** 後端要 yyyy-MM-ddTHH:mm:ss（本地時區、去偏移） */
private toIso(val: any): string | undefined {
  if (!val) return undefined;
  const d = typeof val === 'string' ? new Date(val) : (val as Date);
  if (isNaN(d.getTime())) return undefined;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19);
}

/** 組查詢 payload + 清掉空值與空陣列 */
private buildPayload(val: any) {
  const o: any = {
    ...val,
    TXN_DateStart: this.toIso(val?.TXN_DateStart),
    TXN_DateEnd:   this.toIso(val?.TXN_DateEnd),
    TXN_No_Start:  val?.TXN_No_Start != null && val?.TXN_No_Start !== '' ? Number(val.TXN_No_Start) : undefined,
    TXN_No_End:    val?.TXN_No_End   != null && val?.TXN_No_End   !== '' ? Number(val.TXN_No_End)   : undefined,
    TXN_PayAmt_Start: val?.TXN_PayAmt_Start != null && val?.TXN_PayAmt_Start !== '' ? Number(val.TXN_PayAmt_Start) : undefined,
    TXN_PayAmt_End:   val?.TXN_PayAmt_End   != null && val?.TXN_PayAmt_End   !== '' ? Number(val.TXN_PayAmt_End)   : undefined,
  };

  Object.keys(o).forEach((k) => {
    const v = o[k];
    if (v === '' || v === null || v === undefined) delete o[k];
    if (Array.isArray(v) && v.length === 0) delete o[k];
  });

  return o;
}

/** 單一入口查詢（不傳 displayMode 第二參數） */
private doQuery(): void {
  const payload = this.buildPayload(this.queryForm.value);
  this.loading = true;
  this.messageService?.blockUi();

  this.tls23030Service
    .queryTLS23030(payload) // 👈 只傳 body，displayMode 不用
    .pipe(finalize(() => {
      this.loading = false;
      this.messageService?.unblockUi();
    }))
    .subscribe({
      next: (res) => {
        const raw = res?.Data ?? [];
        this.data = raw.map((item: any, idx: number) => ({
          ...item,
          _rowKey: `${item.SYS_StoreNo ?? ''}|${String(item.TXN_Date ?? '').slice(0, 19)}|${item.ECR_No ?? ''}|${item.TXN_No ?? idx}`,
        }));
        this.totalRecords = res?.TotalCount ?? this.data.length;
      },
      error: (err) => {
        console.error('TLS23030 查詢失敗', err);
      },
    });
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



}
