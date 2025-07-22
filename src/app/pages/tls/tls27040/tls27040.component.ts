import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { SalesStatusService } from '../../../service/basic/sales-status.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CreditCardInputStatusService } from '../../../service/basic/credit-card-input-status.service';
import { InstallmentPeriodService } from '../../../service/basic/installment-period.service';
import { AcquiringBankService } from '../../../service/basic/acquiring-bank.service';
import { QueryFilterService } from '../../../service/basic/query-filter.service';
import { CreditCardTransactionTypeService } from '../../../service/basic/credit-card-transaction-type.service'; // Import for transaction type
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core'; // Add this import as requested
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';
@Component({
  selector: 'app-tls27040',
  templateUrl: './tls27040.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputNumberRangeComponent, CalendarRangeComponent, TableComponent, TranslateModule]
})
export class TLS27040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    cashierNumber: [],  // 收銀機號
    transactionNumber: [],  // 交易流水號
    counterNumber: [],  // 專櫃編號
    salesStatus: [],  // 銷售狀況
    cardType: [],  // 卡別
    amountStart: [, [this.validationService.numberValidator]],  // 金額開始
    amountEnd: [, [this.validationService.numberValidator]],  // 金額結束
    salesDateStart: [],  // 銷售日期與時間開始
    salesDateEnd: [],  // 銷售日期與時間結束
    cardNumber: [],  // 卡號
    edcNumber: [],  // EDC號碼
    billingDateStart: [],  // 請款日期開始
    billingDateEnd: [],  // 請款日期結束
    transactionType: [],  // 交易類別
    inputStatus: [],  // 輸入狀態
    authorizationCode: [],  // 授權碼
    installmentPeriod: [],  // 分期期數
    acquiringBank: [],  // 收單銀行
    queryFilter: []  // 查詢篩選
  });
  data: any[] = [];
  columns: Column[] = [
    { field: 'cashRegisterCode', header: '收銀機代碼', visible: true },
    { field: 'transactionFlowCode', header: '交易流水號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'cardType', header: '卡別', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'saleTime', header: '銷售時間', visible: true },
    { field: 'requestDate', header: '請款日期', visible: true },
    { field: 'cardNumber', header: '卡號', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'edcCode', header: 'EDC號碼', visible: true },
    { field: 'approvalCode', header: '授權碼', visible: true },
    { field: 'saleStatus', header: '銷售狀況', visible: true },
    { field: 'transactionType', header: '交易類別', visible: true },
    { field: 'inputStatus', header: '輸入狀態', visible: true },
    { field: 'installmentCount', header: '分期期數', visible: true },
    { field: 'bank', header: '收單行', visible: true },
    { field: 'requestSource', header: '請款來源', visible: true },
    { field: 'creator', header: '建立者', visible: true },
    { field: 'creationDate', header: '建立日期', visible: true },
    { field: 'modifier', header: '修改者', visible: true },
    { field: 'modificationDate', header: '修改日期', visible: true },
  ];
  totalRecords = 0;
  salesStatusOptions: any[] = [];
  cardTypeOptions: any[] = [];
  inputStatusOptions: any[] = [];
  installmentPeriodOptions: any[] = [];
  acquiringBankOptions: any[] = [];
  queryFilterOptions: any[] = [];
  transactionTypeOptions: any[] = []; // For transaction type

  constructor(
    private validationService: ValidationService,
    private salesStatusService: SalesStatusService,
    private cardTypeService: CardTypeService,
    private creditCardInputStatusService: CreditCardInputStatusService,
    private installmentPeriodService: InstallmentPeriodService,
    private acquiringBankService: AcquiringBankService,
    private queryFilterService: QueryFilterService,
    private creditCardTransactionTypeService: CreditCardTransactionTypeService // Inject service for transaction type
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', 'TLS/TLS27040cru', this.queryForm, (form) => this.onSubmit(form));
    this.salesStatusService.getSalesStatus().subscribe(data => {
      this.salesStatusOptions = data;
    });
    this.cardTypeService.getCardType().subscribe(data => {
      this.cardTypeOptions = data;
    });
    this.creditCardInputStatusService.getCreditCardInputStatuses().subscribe(data => {
      this.inputStatusOptions = data;
    });
    this.installmentPeriodService.getInstallmentPeriods().subscribe(data => {
      this.installmentPeriodOptions = data;
    });
    this.acquiringBankService.getAcquiringBanks().subscribe(data => {
      this.acquiringBankOptions = data;
    });
    this.queryFilterService.getQueryFilters().subscribe(data => {
      this.queryFilterOptions = data;
    });
    this.creditCardTransactionTypeService.getCreditCardTransactionTypes().subscribe(data => {
      this.transactionTypeOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // Handle the form submission logic here
    });
  }
}
