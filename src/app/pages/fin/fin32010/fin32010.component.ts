import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//1.3.2.1 應收帳款維護
@Component({
  selector: 'app-fin32010',
  templateUrl: './fin32010.component.html',
  styleUrl: './fin32010.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, InputNumberRangeComponent, CalendarRangeComponent, MultiSelectComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN32010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    receiveID: [, [Validators.maxLength(14)]], // 應收ID
    organizationCode: [], // 組織代號
    accountYm: [], // 帳款年月
    accountCash: [, [Validators.maxLength(2)]], // 帳款帳次
    startShouldReceive: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應收金額
    endShouldReceive: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應收金額
    startChargeback: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 沖帳金額
    endChargeback: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 沖帳金額
    startReceivePayBalance: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應收帳款餘額
    endShouldReceiveBalance: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應收帳款餘額
    startExpectReceiveDate: [], // 預計收款日
    endExpectReceivefDate: [], // 預計收款日
    startEstablishDate: [], // 立帳日期
    endEstablishfDate: [], // 立帳日期
    factoryID: [], // 廠客代號
    uId: [, [Validators.maxLength(10)]], // 統一編號
    accountingCode: [], // 會計科目代號
    accountSource: [, [Validators.maxLength(20)]], // 帳款來源單號
    summonsNumber: [, [Validators.maxLength(11)]], // 傳票號碼
    subpoenaStatus: [[] as number[]], // 傳票狀態
    status: [[] as number[]], // 狀態
    objectNumber: [], // 對象別編號
    keyValue: [, [Validators.maxLength(30)]], // 對帳KEY值
    summary: ['', [Validators.maxLength(160)]], // 摘要
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { 'name': 'Emily', 'age': 28, 'email': 'emily@example.com', 'city': 'Kaohsiung' },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '應收ID', visible: true },
    { field: 'col2', header: '應收金額', visible: true },
    { field: 'col3', header: '沖帳金額', visible: true },
    { field: 'col4', header: '應收帳款餘額', visible: true },
    { field: 'col5', header: '立帳日期', visible: true },
    { field: 'col6', header: '預計收款日', visible: true },
    { field: 'col7', header: '廠客代號', visible: true },
    { field: 'col8', header: '摘要', visible: true },
    { field: 'col9', header: '傳票號碼', visible: true },
    { field: 'col10', header: '傳票狀態', visible: true },
    { field: 'col11', header: '狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  organizationCodeOptions: any[] = [];
  factoryIDOptions: any[] = [];
  accountingCodeOptions: any[] = [];
  subpoenaTypeOptions: any[] = [
    { value: 0, label: '作廢' },
    { value: 1, label: '建立' },
    { value: 2, label: '確認' },
    { value: 3, label: '轉帳' },
  ];
  statusOptions: any[] = [];
  objectNumberOptions: any[] = [
    { value: 0, label: '68919301/嘉南紡織股份有限公司' },
    { value: 1, label: '73251209/統一企業股份有限公司' },
    { value: 2, label: '96978370/統正開發股份有限公司' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private validationService: ValidationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '130003';
    this.cruPage = '/FIN3000/FIN32010CRU';
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
