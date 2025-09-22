import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
@Component({
  selector: 'app-fin21030-cru',
  templateUrl: './fin21030-cru.component.html',
  styleUrl: './fin21030-cru.component.scss',
  standalone: true,
  imports: [
    MultiSelectComponent,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    AccordionModule,
    InputNumberComponent,
    TranslateModule,
    NgIf,

  ],
})
export class FIN21030CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    vendorCode: ['', [Validators.maxLength(14)]], // 廠客代號
    vendorName: ['', [Validators.maxLength(64)]], // 廠客名稱
    vendorSName: ['', [Validators.maxLength(20)]], // 廠商簡稱
    postCode: ['', [Validators.maxLength(5)]], // 郵遞區號
    postAddress: ['', [Validators.maxLength(100)]], // 郵寄地址
    contactPerson: ['', [Validators.maxLength(20)]], // 聯絡人
    phone: ['', [Validators.maxLength(20)]], // 電話
    fax: ['', [Validators.maxLength(20)]], // 	傳真
    uId: ['', [Validators.maxLength(10)]], // 統一編號
    VEN_RemitFeeMode: ['', Validators.required],
    payoutVendor: [[] as number[]], // 貼現廠商
    noTransfer: [[] as number[]], // 禁止背書轉讓
    paymentMethod: [[] as number[]], // 付款方式
    vendorTransferAccount: ['', [Validators.maxLength(20)]], // 廠商匯款銀行代號
    vendorAccount: ['', [Validators.maxLength(20)]], // 廠商銀行帳號
    vendorAccountName: ['', [Validators.maxLength(64)]], // 廠商帳戶名稱
    payoutLimit: ['', [Validators.maxLength(3)]], // 付款期限
    ticketTitle: ['', [Validators.maxLength(20)]], // 票據抬頭
    systemType: [[] as number[]], // 系統別
    VEN_Status: [[] as number[]], // 審核狀態
  });
  postBelongOptions: any[] = [];
  whetherOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  systemTypeOptions: any[] = [];
  statusOptions: any[] = [];
    remitFeeOptions = [
    { value: '1', label: '廠商負擔' },
    { value: '2', label: '公司負擔' }
  ];
  // ====== Table / Options ======
  approvalOptions: { label: string; value: string }[] = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' },
  ];
  constructor(

  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN21030', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    if (frm.valid) {
      // Handle form submission
    }
  }
}
