import { SystemTypeDetailService } from './../../../service/basic/system-type-detail.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//1.1.6.3 銷貨退回或折讓明細表 
@Component({
  selector: 'app-fin16030',
  templateUrl: './fin16030.component.html',
  styleUrl: './fin16030.component.scss'
})
export class FIN16030Component extends BasicQpageComponent implements OnInit{
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
    // { 'name': 'Emily', 'age': 2e.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[]= [
    { field: 'col1', header: '收銀機編號', visible: true },
    { field: 'col2', header: '申報年月', visible: true },
    { field: 'col3', header: '發票年月', visible: true },
    { field: 'col4', header: '發票日期', visible: true },
    { field: 'col5', header: '字軌', visible: true },
    { field: 'col6', header: '發票號碼(起)', visible: true },
    { field: 'col7', header: '發票號碼(迄)', visible: true },
    { field: 'col8', header: '統一編號', visible: true },
    { field: 'col9', header: '發票張數', visible: true },
    { field: 'col10', header: '應稅總金額', visible: true },
    { field: 'col11', header: '稅額', visible: true },
    { field: 'col12', header: '免稅銷售額', visible: true },
    { field: 'col13', header: '零稅率銷售額', visible: true },
    { field: 'col14', header: '狀態碼', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  invoiceFormatOptions:any[]=[
    { value: 1, label: 31 },
    { value: 2, label: 32 },
    { value: 3, label: 33 },
  ];
  categoryOptions:any[]=[
    { value: 1, label: '退出' },
    { value: 2, label: '折讓' },
  ];
  usageOptions:any[]=[
    { value: 1, label: '營業用' },
    { value: 2, label: '共同使用' },
  ];
  dateTypeOptions:any[]=[
    { value: 1, label: '例行資料' },
    { value: 2, label: '申報資料' },
    { value: 3, label: '歷史資料' },
  ];
  systemCategoryOptions:any[]=[];

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
    this.ProgNo = '110033';
    this.cruPage = '/FIN1000/FIN16030CRU';
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
