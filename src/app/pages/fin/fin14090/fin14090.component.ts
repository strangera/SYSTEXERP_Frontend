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
import { TaxTypeService } from '../../../service/basic/tax-type.service';

//1.1.4.9 銷項發票調整
@Component({
  selector: 'app-fin14090',
  templateUrl: './fin14090.component.html',
  styleUrl: './fin14090.component.scss'
})
export class FIN14090Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceNumber: [, [Validators.maxLength(8)]], // 發票號碼
    invoiceDateFrom: [], // 	發票日期
    invoiceDateTo: [], // 	發票日期
    belongYm: [], // 	資料所屬年月
    declareYm: [], // 	申報年月
    counterID: [, [Validators.maxLength(6)]], // 專櫃編號
    factoryID: [, [Validators.maxLength(10)]], // 廠客代號
    salesPersonUid: [, [Validators.maxLength(8)]], // 銷售人統一編號
    buyerPersonUid: [, [Validators.maxLength(8)]], // 買受人統一編號
    invoiveFormat: ['', [Validators.maxLength(2)]], // 發票格式
    totalPriceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票總金額
    totalPriceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票總金額
    taxType: [[] as number[]], // 課稅別
    nonTaxPriceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票未稅金額
    nonTaxPriceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票未稅金額
    taxPriceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 稅額
    taxPriceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 稅額
    certificateNumber: [, [Validators.maxLength(10)]], // 憑證單號
    summonsNumber: [, [Validators.maxLength(11)]], // 傳票號碼
    assetsRemrk: [[] as number[]], // 資產註記
    systemCategory: [[] as number[]], // 系統別
    remark: ['', [Validators.maxLength(100)]], // 備註
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
    { field: 'col2', header: '字軌', visible: true },
    { field: 'col3', header: '發票號碼', visible: true },
    { field: 'col4', header: '發票日期', visible: true },
    { field: 'col5', header: '資料所屬年月', visible: true },
    { field: 'col6', header: '申報年月', visible: true },
    { field: 'col7', header: '專櫃編號', visible: true },
    { field: 'col8', header: '廠客代號', visible: true },
    { field: 'col9', header: '買受人統一編號', visible: true },
    { field: 'col10', header: '發票總金額', visible: true },
    { field: 'col11', header: '課稅別', visible: true },
    { field: 'col12', header: '發票未稅金額', visible: true },
    { field: 'col13', header: '稅額', visible: true },
    { field: 'col14', header: '憑證單號', visible: true },
    { field: 'col15', header: '傳票編號', visible: true },
    { field: 'col16', header: '資產註記', visible: true },
    { field: 'col17', header: '系統別', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  taxTypeOptions: any[] = [];
  assetsRemrkOptions: any[] = [
    { value: 1, label: '固定資產' },
    { value: 2, label: '土地' },
  ];
  systemCategoryOptions: any[] = [
    { value: 1, label: 'APP服務' },
    { value: 2, label: '出庫系統設定' },
    { value: 3, label: 'EIP模組' },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private taxTypeService: TaxTypeService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110024';
    this.cruPage = '/FIN1000/FIN14090CRU';
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
