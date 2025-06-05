import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//
import { WhetherService } from './../../../service/basic/whether.service';
import { InvoiceCategoryService } from './../../../service/basic/invoice-category.service';

//1.1.4.7 二聯收銀機發票維護
@Component({
  selector: 'app-fin14070',
  templateUrl: './fin14070.component.html',
  styleUrl: './fin14070.component.scss'
})
export class FIN14070Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    registerID: [, [Validators.maxLength(6)]], // 收銀機編號
    declareYm: [], // 	申報年月
    salesStartdate: [], // 	銷售日期
    salesEnddate: [], // 	銷售日期
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceIDStart: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼(起)
    invoiceIDEnd: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼(迄)
    invoiceNumberStart: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票張數
    invoiceNumberEnd: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票張數
    taxPriceStart: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應稅總金額
    taxPriceEnd: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 應稅總金額
    notaxPriceStart: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 免稅銷售額
    notaxPriceEnd: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 免稅銷售額
    notaxRatePriceStart: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 零稅率銷售額
    notaxRatePriceEnd: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 零稅率銷售額
    uId: [[] as number[]], // 是否有統一編號
    status: [[] as number[]], // 狀態碼
    invoiceCategory: [], // 	發票類別
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
  whetherOptions: any[] = [];
  statusOptions: any[] = [
    { value: 1, label: '正常' },
    { value: 2, label: '作廢' },
    { value: 3, label: '空白' },
  ];
  invoiceCategoryOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private whetherService: WhetherService,
    private invoiceCategoryService: InvoiceCategoryService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110022';
    this.cruPage = '/FIN1000/FIN14070CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;

      // 全選填入
      // let allSystemValues = this.whetherOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   uId: allSystemValues
      // });
    });
    //
    this.invoiceCategoryService.getSystemTypes().subscribe(data => {
      this.invoiceCategoryOptions = data;
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
