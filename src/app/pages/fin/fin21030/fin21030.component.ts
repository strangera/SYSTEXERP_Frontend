
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';


//1.2.1.3 廠客資料維護
@Component({
    selector: 'app-fin21030',
    templateUrl: './fin21030.component.html',
    styleUrl: './fin21030.component.scss',
    standalone: true,
    imports: [MenubarComponent, DropdownComponent,
     AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, MultiSelectComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class FIN21030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    vendorCode: [, [Validators.maxLength(14)]], // 廠客代號
    vendorName: ['', [Validators.maxLength(64)]], // 廠客名稱
    vendorSName: ['', [Validators.maxLength(20)]], // 廠商簡稱
    postCode: [, [Validators.maxLength(5)]], // 郵遞區號
    postAddress: ['', [Validators.maxLength(100)]], // 郵寄地址
    contactPerson: ['', [Validators.maxLength(20)]], // 聯絡人
    phone: ['', [Validators.maxLength(20)]], // 電話
    fax: ['', [Validators.maxLength(20)]], // 	傳真
    uId: ['', [Validators.maxLength(10)]], // 統一編號
    VEN_RemitFeeMode: ['', Validators.required],
    payoutVendor: [[] as number[]], // 貼現廠商
    noTransfer: [[] as number[]], // 禁止背書轉讓
    paymentMethod: [[] as number[]], // 付款方式
    vendorTransferAccount: [, [Validators.maxLength(20)]], // 廠商匯款銀行代號
    vendorAccount: [, [Validators.maxLength(20)]], // 廠商銀行帳號
    vendorAccountName: ['', [Validators.maxLength(64)]], // 廠商帳戶名稱
    payoutLimit: [, [Validators.maxLength(3)]], // 付款期限
    ticketTitle: ['', [Validators.maxLength(20)]], // 票據抬頭
    systemType: [[] as number[]], // 系統別
    VEN_Status: [[] as number[]], // 審核狀態
  });
  data: any[] = [];
  totalRecords = 0;
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
    remitFeeOptions = [
    { value: '1', label: '廠商負擔' },
    { value: '2', label: '公司負擔' }
  ];
  // ====== Table / Options ======
  approvalOptions: { label: string; value: string }[] = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' },
  ];
  columns: any[] = [
    { field: 'col1', header: '廠客代號', visible: true },
    { field: 'col2', header: '廠客名稱', visible: true },
    { field: 'col3', header: '聯絡人', visible: true },
    { field: 'col4', header: '電話', visible: true },
    { field: 'col5', header: '傳真', visible: true },
    { field: 'col6', header: '統一編號', visible: true },
    { field: 'col7', header: '貼現廠商', visible: true },
    { field: 'col8', header: '付款方式', visible: true },
    { field: 'col9', header: '廠商匯款銀行代號', visible: true },
    { field: 'col10', header: '廠商銀行帳號', visible: true },
    { field: 'col11', header: '廠商帳戶名稱', visible: true },
    { field: 'col12', header: '付款期限', visible: true },
    { field: 'col13', header: '票據抬頭', visible: true },
    { field: 'col14', header: '審核狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  postBelongOptions: any[] = [];
  whetherOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  systemTypeOptions: any[] = [];
  statusOptions: any[] = [];

  constructor(

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN21030', 'fin/fin21030cru', this.queryForm, form => this.onSubmit(form));

  }
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();


    this.loading = false;
    this.messageService.unblockUi();
  }

}
