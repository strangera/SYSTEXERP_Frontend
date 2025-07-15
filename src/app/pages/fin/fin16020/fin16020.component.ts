import { SystemTypeDetailService } from './../../../service/basic/system-type-detail.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//1.1.6.2 進貨退出或折讓明細表
@Component({
    selector: 'app-fin16020',
    templateUrl: './fin16020.component.html',
    styleUrl: './fin16020.component.scss',
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberRangeComponent, MultiSelectComponent, InputTextComponent, CalendarRangeComponent, CalendarComponent, RadiobuttonComponent, InputNumberComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN16020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    returnNumberFrom: [, [this.validationService.numberValidator, Validators.maxLength(99999999999)]], // 退出/折讓單號
    returnNumberTo: [, [this.validationService.numberValidator, Validators.maxLength(99999999999)]], // 退出/折讓單號
    invoiceFormat: [], // 發票格式
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceNumberFrom: [, [this.validationService.numberValidator, Validators.maxLength(99999999)]], // 發票號碼
    invoiceNumberTo: [, [this.validationService.numberValidator, Validators.maxLength(99999999)]], // 發票號碼
    returnDateFrom: [], // 退出/折讓日期
    returnDateTo: [], // 退出/折讓日期
    usage: [[] as number[]], // 區別
    declareYm: [], // 	申報年月
    belongYmFrom: [], // 資料所屬年月
    belongYmTo: [], // 資料所屬年月
    certificateNumberFrom: [, [this.validationService.numberValidator, Validators.maxLength(9999999999)]], // 憑證單號
    certificateNumberTo: [, [this.validationService.numberValidator, Validators.maxLength(9999999999)]], // 憑證單號
    summonsNumberFrom: [, [this.validationService.numberValidator, Validators.maxLength(99999999999)]], // 傳票號碼
    summonsNumberTo: [, [this.validationService.numberValidator, Validators.maxLength(99999999999)]], // 傳票號碼
    dateType: [1, []], // 資料型態
    systemCategory: [[] as number[]], // 系統別
    printPage: [40, [Validators.maxLength(3)]], // 每頁列印筆數
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
    { field: 'col1', header: '發票格式', visible: true },
    { field: 'col2', header: '退出/折讓單號', visible: true },
    { field: 'col3', header: '字軌', visible: true },
    { field: 'col4', header: '發票號碼', visible: true },
    { field: 'col5', header: '退出/折讓日期', visible: true },
    { field: 'col6', header: '區別', visible: true },
    { field: 'col7', header: '申報年月', visible: true },
    { field: 'col8', header: '退出/折讓金額', visible: true },
    { field: 'col9', header: '退出/折讓稅額', visible: true },
    { field: 'col10', header: '憑證單號', visible: true },
    { field: 'col11', header: '傳票號碼', visible: true },
    { field: 'col12', header: '系統別', visible: true },
    { field: 'col13', header: '扣抵別', visible: true },
    { field: 'col14', header: '統一編號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  invoiceFormatOptions: any[] = [
    { value: 1, label: 21 },
    { value: 2, label: 22 },
    { value: 3, label: 23 },
  ];
  categoryOptions: any[] = [
    { value: 1, label: '退出' },
    { value: 2, label: '折讓' },
  ];
  usageOptions: any[] = [
    { value: 1, label: '營業用' },
    { value: 2, label: '共同使用' },
  ];
  dateTypeOptions: any[] = [
    { value: 1, label: '例行資料' },
    { value: 2, label: '申報資料' },
    { value: 3, label: '歷史資料' },
  ];
  systemCategoryOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private systemTypeDetailService: SystemTypeDetailService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110032';
    this.cruPage = '/FIN1000/FIN16020CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.systemTypeDetailService.getSystemTypes().subscribe(data => {
      this.systemCategoryOptions = data;

      // 全選填入
      // let allSystemValues = this.systemCategoryOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   systemCategory: allSystemValues
      // });
    });
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
