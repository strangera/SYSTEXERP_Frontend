import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-fin24010',
  templateUrl: './fin24010.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, InputNumberRangeComponent, MultiSelectComponent, InputTextComponent, CalendarRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN24010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    shouldPayID: [, [Validators.maxLength(14)]], // 應付ID
    organizationCode: [], // 組織代號
    accountYm: [], // 帳款年月
    accountCash: [, [Validators.maxLength(2)]], // 帳款帳次
    startShouldPay: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應付金額
    endShouldPay: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應付金額
    startChargeback: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 沖帳金額
    endChargeback: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 沖帳金額
    startShouldPayBalance: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應付帳款餘額
    endShouldPayBalance: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應付帳款餘額
    startRetainer: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 保留款金額
    endRetainer: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 保留款金額
    startRefundRetainer: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 退保留款金額
    endRefundRetainer: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 退保留款金額
    paymentMethod: [[] as number[]], // 付款方式
    transferBankAccount: [], // 匯款銀行代號
    bankAccount: [, [Validators.maxLength(20)]], // 銀行帳號
    bankAccountName: ['', [Validators.maxLength(64)]], // 帳戶名稱
    ticketTransfer: [[] as number[]], // 票據禁止背書轉讓
    ticketTitle: [, [Validators.maxLength(20)]], // 票據抬頭
    startExpectPayDate: [], // 預計付款日
    endExpectPayfDate: [], // 預計付款日
    startEstablishDate: [], // 立帳日期
    endEstablishfDate: [], // 立帳日期
    factoryID: [], // 廠客代號
    uId: [, [Validators.maxLength(10)]], // 統一編號
    accountingCode: [], // 會計科目代號
    accountSource: [, [Validators.maxLength(20)]], // 帳款來源單號
    summary: ['', [Validators.maxLength(160)]], // 摘要
    summonsNumber: [, [Validators.maxLength(11)]], // 傳票號碼
    subpoenaStatus: [[] as number[]], // 傳票狀態
    status: [[] as number[]], // 狀態
    whetherDiscount: [[] as number[]], // 是否貼現
    objectNumber: [], // 對象別編號
    keyValue: [, [Validators.maxLength(30)]], // 對帳KEY值
  });
  data: any[] = [];
  columns: any[] = [
    { field: 'col1', header: '應付ID', visible: true },
    { field: 'col2', header: '帳款年月', visible: true },
    { field: 'col3', header: '應付金額', visible: true },
    { field: 'col4', header: '沖帳金額', visible: true },
    { field: 'col5', header: '應付帳款餘額', visible: true },
    { field: 'col6', header: '付款方式', visible: true },
    { field: 'col7', header: '立帳日期', visible: true },
    { field: 'col8', header: '預計付款日', visible: true },
    { field: 'col9', header: '廠客代號', visible: true },
    { field: 'col10', header: '摘要', visible: true },
    { field: 'col11', header: '傳票號碼', visible: true },
    { field: 'col12', header: '傳票狀態', visible: true },
    { field: 'col13', header: '狀態', visible: true },
    { field: 'col14', header: '是否貼現', visible: true },
    { field: 'col15', header: '貼現日期', visible: true },
  ];
  organizationCodeOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  bankAccountOptions: any[] = [];
  whetherOptions: any[] = [];
  factoryIDOptions: any[] = [];
  accountingCodeOptions: any[] = [];
  statusOptions: any[] = [];
  subpoenaTypeOptions: any[] = [
    { value: 0, label: '作廢' },
    { value: 1, label: '建立' },
    { value: 2, label: '確認' },
    { value: 3, label: '轉帳' },
  ];
  objectNumberOptions: any[] = [
    { value: 0, label: '68919301/嘉南紡織股份有限公司' },
    { value: 1, label: '73251209/統一企業股份有限公司' },
    { value: 2, label: '96978370/統正開發股份有限公司' },
  ];

  constructor(
    private validationService: ValidationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN24010', 'fin/fin24010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
