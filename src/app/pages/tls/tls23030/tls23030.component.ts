import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { TLS23030Service } from '../../../service/API/tls/tls23030.service';
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
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

@Component({
  selector: 'app-tls23030',
  templateUrl: './tls23030.component.html',
  styleUrls: ['./tls23030.component.scss']
})
export class TLS23030Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2020-01-01') as Date, [Validators.required]],
    TXN_DateEnd: [new Date(), [Validators.required]],
    ECR_No: [''],
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [''],
    PAY_Type: [''],
    TXN_PayAmt_Start: [null],
    TXN_PayAmt_End: [null],
    TXN_Status: [''],
    TXN_MemCard: [''],
    CRD_Type: [''],
    CRD_No: [''],

    pay_taxtype: [''],
    org_id: [''],
    rece_yn: [''],
    cash_yn: [''],
    tlt_building: [''],
    tlt_floor: [''],
    IsHaveTERM_No: [null], // 預設為 null 而不是 true
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    {
      field: 'TXN_Date', header: '銷售日期', visible: true, format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
    },
    { field: 'ECR_No', header: '收銀機代號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'TXN_Status', header: '交易型態', visible: true, format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions) },
    { field: 'PAY_Type', header: '付款別', visible: true, format: (val: any) => this.getLabelFromOptions(val, this.paymentTypeOptions) },
    {
      field: 'TXN_PayAmt', header: '金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    { field: 'CRD_Type', header: '信用卡別', visible: true },
    {
      field: 'CRD_No', header: '信用卡卡號/條碼', visible: true,
      style: 'text-right'
    },
    { field: 'IsHaveTERM_No', header: '是否分期', visible: true, format: (val: any) => this.getLabelFromOptions(val, this.WhetherOptions) },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'org_id', header: '組織編號', visible: true },
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
    private tls11010Service: Tls11010Service,
    private tls23030Service: TLS23030Service,
    private txnStatusService: TxnStatusService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23030', '', this.queryForm, (form) => this.onSubmit(form));

    this.displayModeService.getDisplayModes().subscribe(data => this.displayModeOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.WhetherOptions = data);
    this.paymentTypeService.getPaymentTypes().subscribe(data => this.paymentTypeOptions = data);
    this.transactionTypeService.getTransactionTypes().subscribe(data => this.transactionTypeOptions = data);
    this.cardTypeService.getCardType().subscribe(data => this.cardTypeOptions = data);
    this.ticketStatusService.getTicketStatuses().subscribe(data => this.ticketStatusOptions = data);
    this.taxableService.getSystemTypes().subscribe(data => this.taxableOptions = data);
    this.discountService.getLocalDiscountOptions().subscribe(data => this.discountOptions = data);
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(data => this.deductionbigCategoryOptions = data);
    this.commissionTypeService.getCommissionTypes().subscribe(data => this.commissionTypeOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.txnStatusService.getTxnStatusOptions().subscribe(data => this.txnStatusOptions = data);
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
  }


  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading) return;

    if (form.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      return;
    }

    this.handleSubmit(form, () => {
      const payload = { ...form.value };

      // ✅ 將 'Y' / 'N' 轉成 true / false
      if (payload.IsHaveTERM_No === 'Y') {
        payload.IsHaveTERM_No = true;
      } else if (payload.IsHaveTERM_No === 'N') {
        payload.IsHaveTERM_No = false;
      }

      // ✅ 將空字串轉 null
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      console.log('查詢參數:', payload);

      this.tls23030Service.queryTLS23030(payload).subscribe({
        next: (res) => {
          console.log('查詢結果:', res);
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, payload);
            this.messageService.successBubble('查詢成功');
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.messageService.errorBubble('查詢錯誤');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }


  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
