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
import { AllInvoiceCategoryService } from './../../../service/basic/all-invoice-category.service';
import { TaxTypeService } from './../../../service/basic/tax-type.service';
import { VendorService } from './../../../service/basic/vendor.service';
import { UsageTypeService } from '../../../service/basic/usage-type.service';

//1.1.4.6 非二聯式收銀機發票調整作業 
@Component({
  selector: 'app-fin14060',
  templateUrl: './fin14060.component.html',
  styleUrl: './fin14060.component.scss'
})

export class FIN14060Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    invoiceCategory: [[] as number[]], // 發票類型
    usage: [[] as number[]], // 使用別

    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceNumber: [, [Validators.maxLength(8)]], // 發票號碼
    invoiceYm: [], // 發票年月
    startInvoiceDate: [], // 發票日期
    endInvoiceDate: [], // 發票日期
    startInvoiceYm: [], // 資料所屬年月
    endInvoiceYm: [], // 資料所屬年月
    declareYm: [], // 申報年月
    buyerUid: [], // 買受人統一編號
    taxType: [[] as number[]], // 課稅別
    salesFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 銷售金額
    salesTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 銷售金額
    taxFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 稅額
    taxTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 稅額
    subpoenaFrom: [, [this.validationService.numberValidator, Validators.max(99999999999)]], // 傳票號碼
    subpoenaTo: [, [this.validationService.numberValidator, Validators.max(99999999999)]], // 傳票號碼
    assetsRemrk: [[] as number[]], // 資產註記
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
  columns: any[]= [
    { field: 'name', header: '發票類型', visible: true },
    { field: 'age', header: '字軌', visible: true },
    { field: 'email', header: '發票號碼', visible: true },
    { field: 'city', header: '發票日期', visible: true },
    { field: 'col1', header: '發票日期', visible: true },
    { field: 'col2', header: '資料所屬年月', visible: true },
    { field: 'col3', header: '申報年月', visible: true },
    { field: 'col4', header: '買受人統一編號', visible: true },
    { field: 'col5', header: '課稅別', visible: true },
    { field: 'col6', header: '銷售金額', visible: true },
    { field: 'col7', header: '稅額', visible: true },
    { field: 'col8', header: '傳票編號', visible: true },
    { field: 'col9', header: '資產註記', visible: true },
    { field: 'col10', header: '使用別', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  invoiceCategoryOptions:any[]=[];
  usageOptions:any[]=[];
  buyerUidOptions:any[]=[];
  taxTypeOptions:any[]=[];
  assetsRemrkOptions:any[]=[
    { value: 1, label: '固定資產' },
    { value: 2, label: '土地' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private allInvoiceCategoryService: AllInvoiceCategoryService,
    private usageTypeService: UsageTypeService,
    private vendorService: VendorService,
    private taxTypeService: TaxTypeService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110021';
    this.cruPage = '/FIN1000/FIN14060CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.vendorService.getVendors().subscribe(data => {
      this.buyerUidOptions = data;
    });
    //
    this.allInvoiceCategoryService.getAllInvoiceCategorys().subscribe(data => {
      this.invoiceCategoryOptions = data;
      // 全選填入
      // let allSystemValues = this.invoiceCategoryOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   invoiceCategory: allSystemValues
      // });
    });
    //
    this.usageTypeService.getSystemTypes().subscribe(data => {
      this.usageOptions = data;
      // 全選填入
      // let allSystemValues = this.usageOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   usage: allSystemValues
      // });
    });
    //
    this.taxTypeService.getTaxTypes().subscribe(data => {
      this.taxTypeOptions = data;
      // 全選填入
      // let allSystemValues = this.taxTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   taxType: allSystemValues
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
