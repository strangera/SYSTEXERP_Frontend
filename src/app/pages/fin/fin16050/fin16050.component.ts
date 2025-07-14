import { WhetherService } from './../../../service/basic/whether.service';
import { SystemTypeDetailService } from './../../../service/basic/system-type-detail.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { TaxTypeService } from '../../../service/basic/tax-type.service';
//

//1.1.6.5 銷項發票明細表
@Component({
  selector: 'app-fin16050',
  templateUrl: './fin16050.component.html',
  styleUrl: './fin16050.component.scss'
})
export class FIN16050Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    invoiceDateFrom: [], // 	發票日期
    invoiceDateTo: [], // 	發票日期
    invoiceFormat: [], // 發票格式
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceNumberFrom: [, [this.validationService.numberValidator, Validators.maxLength(99999999)]], // 發票號碼
    invoiceNumberTo: [, [this.validationService.numberValidator, Validators.maxLength(99999999)]], // 發票號碼
    declareYm: [], // 	申報年月
    belongYmFrom: [], // 資料所屬年月
    belongYmTo: [], // 資料所屬年月
    vendorUid: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 廠商編號(統一編號)
    taxType: [[] as number[]], // 課稅別
    certificateNumberFrom: [, [this.validationService.numberValidator, Validators.maxLength(99999999999999)]], // 憑證單號
    certificateNumberTo: [, [this.validationService.numberValidator, Validators.maxLength(99999999999999)]], // 憑證單號
    summonsNumberFrom: [, [this.validationService.numberValidator, Validators.maxLength(99999999999)]], // 傳票號碼
    summonsNumberTo: [, [this.validationService.numberValidator, Validators.maxLength(99999999999)]], // 傳票號碼
    systemCategory: [[] as number[]], // 系統別
    assets: [[] as number[]], // 資產註記
    summonsBuilder: ['', [Validators.maxLength(10)]], // 傳票建立者
    uIdCheck: [[] as number[]], // 是否有統一編號
    dateType: [1, []], // 資料型態
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
    { field: 'col1', header: '格式代號', visible: true },
    { field: 'col2', header: '字軌', visible: true },
    { field: 'col3', header: '發票號碼', visible: true },
    { field: 'col4', header: '發票日期', visible: true },
    { field: 'col5', header: '資料所屬年月', visible: true },
    { field: 'col6', header: '申報年月', visible: true },
    { field: 'col7', header: '廠商編號(統一編號)', visible: true },
    { field: 'col8', header: '發票金額', visible: true },
    { field: 'col9', header: '發票稅額', visible: true },
    { field: 'col10', header: '應稅總金額', visible: true },
    { field: 'col11', header: '課稅別', visible: true },
    { field: 'col12', header: '扣扺代號', visible: true },
    { field: 'col13', header: '憑證單號', visible: true },
    { field: 'col14', header: '傳票號碼', visible: true },
    { field: 'col15', header: '系統別', visible: true },
    { field: 'col16', header: '資產註記', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  invoiceFormatOptions: any[] = [
    { value: 1, label: 31 },
    { value: 2, label: 32 },
    { value: 3, label: 33 },
  ];
  assetsOptions: any[] = [
    { value: 1, label: '固定資產' },
    { value: 2, label: '土地' },
  ];
  dateTypeOptions: any[] = [
    { value: 1, label: '例行資料' },
    { value: 2, label: '申報資料' },
    { value: 3, label: '歷史資料' },
  ];
  taxTypeOptions: any[] = [];
  systemCategoryOptions: any[] = [];
  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private taxTypeService: TaxTypeService,
    private systemTypeDetailService: SystemTypeDetailService,
    private whetherService: WhetherService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110035';
    this.cruPage = '/FIN1000/FIN16050CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.taxTypeService.getTaxTypes().subscribe(data => {
      this.taxTypeOptions = data;

      // 全選填入
      // let allSystemValues = this.taxTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   taxType: allSystemValues
      // });
    });
    //
    this.systemTypeDetailService.getSystemTypes().subscribe(data => {
      this.systemCategoryOptions = data;

      // 全選填入
      // let allSystemValues = this.systemCategoryOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   systemCategory: allSystemValues
      // });
    });
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;

      // 全選填入
      // let allSystemValues = this.whetherOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   uIdCheck: allSystemValues
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
