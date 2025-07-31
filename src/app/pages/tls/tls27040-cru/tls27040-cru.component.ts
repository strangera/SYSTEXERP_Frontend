import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesStatusService } from '../../../service/basic/sales-status.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CreditCardInputStatusService } from '../../../service/basic/credit-card-input-status.service';
import { InstallmentPeriodService } from '../../../service/basic/installment-period.service';
import { AcquiringBankService } from '../../../service/basic/acquiring-bank.service';
import { QueryFilterService } from '../../../service/basic/query-filter.service';
import { CreditCardTransactionTypeService } from '../../../service/basic/credit-card-transaction-type.service'; // Import for transaction type
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common'; // Add this import as requested
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-tls27040-cru',
  templateUrl: './tls27040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputNumberComponent, CalendarComponent, TableComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS27040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ECR_No: ['', Validators.required],  // 收銀機號
    TXN_No: ['', Validators.required],  // 交易流水號
    TLT_No: ['', Validators.required],  // 專櫃編號
    NCML_PayCrdType: [null],    // 卡別
    NCML_TxnType: [null],         // 銷售狀況
    NCML_TxnAmt: [null, [Validators.max(9999999999)]],       // 交易金額起 decimal 12, 2
    CTBC_PayDate: [null, Validators.required],  // 請款日期
    salesCondition: [, Validators.required],  // 銷售狀況
    cardCategory: [, Validators.required],  // 卡別
    amount: [, Validators.required],  // 金額
    salesDateStart: [],  // 銷售日期與時間開始
    salesDateEnd: [],  // 銷售日期與時間結束
    cardID: [],  // 卡號
    edcID: [],  // EDC號碼
    postingDate: [, Validators.required],  // 入帳日期
    billingDate: [, Validators.required],  // 請款日期
    transactionCategory: [],  // 交易類別
    entryStatus: [1, Validators.required],  // 輸入狀態
    authorizationCode: [],  // 授權碼
    installmentPeriodCount: [],  // 分期期數
    acquirerBank: [1, Validators.required],  // 收單銀行
    queryFilter: [],  // 查詢篩選
    transactionTime: [, Validators.required],  // 時間
  });
  salesConditionOptions: any[] = [];
  cardCategoryOptions: any[] = [];
  entryStatusOptions: any[] = [];
  installmentPeriodCountOptions: any[] = [];
  acquirerBankOptions: any[] = [];
  queryFilterOptions: any[] = [];
  transactionCategoryOptions: any[] = []; // For transaction category
  constructor(
    private salesStatusService: SalesStatusService,
    private cardTypeService: CardTypeService,
    private creditCardInputStatusService: CreditCardInputStatusService,
    private installmentPeriodService: InstallmentPeriodService,
    private acquiringBankService: AcquiringBankService,
    private queryFilterService: QueryFilterService,
    private creditCardTransactionTypeService: CreditCardTransactionTypeService // Inject service for transaction category
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', this.dataForm);
    this.salesStatusService.getSalesStatus().subscribe(data => {
      this.salesConditionOptions = data;
    });

    this.cardTypeService.getCardType().subscribe(data => {
      this.cardCategoryOptions = data;
    });
    this.creditCardInputStatusService.getCreditCardInputStatuses().subscribe(data => {
      this.entryStatusOptions = data;
    });
    this.installmentPeriodService.getInstallmentPeriods().subscribe(data => {
      this.installmentPeriodCountOptions = data;
    });
    this.acquiringBankService.getAcquiringBanks().subscribe(data => {
      this.acquirerBankOptions = data;
    });
    this.queryFilterService.getQueryFilters().subscribe(data => {
      this.queryFilterOptions = data;
    });
    this.creditCardTransactionTypeService.getCreditCardTransactionTypes().subscribe(data => {
      this.transactionCategoryOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
