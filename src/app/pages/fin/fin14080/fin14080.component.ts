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
import { TaxTypeService } from './../../../service/basic/tax-type.service';

//1.1.4.8 進項發票調整
@Component({
  selector: 'app-fin14080',
  templateUrl: './fin14080.component.html',
  styleUrl: './fin14080.component.scss'
})
export class FIN14080Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    invoiceFormat: ['', [Validators.maxLength(2)]], // 發票格式
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceNumber: [, [Validators.maxLength(8)]], // 發票號碼
    invoiceDateFrom: [], // 	發票日期
    invoiceDateTo: [], // 	發票日期
    belongYm: [], // 	資料所屬年月
    declareYm: [], // 	申報年月
    vendorUid: [, [Validators.maxLength(10)]], // 廠商編號(統一編號)
    totalPriceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票總金額
    totalPriceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票總金額
    nonTaxPriceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票未稅金額
    nonTaxPriceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票未稅金額
    taxPriceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票稅額
    taxPriceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票稅額
    usage: [[] as number[]], // 發票用途
    taxType: [[] as number[]], // 課稅別
    deductionCode: [[] as number[]], // 扣扺代號
    category: [[] as number[]], // 類別區分
    certificateNumber: [, [Validators.maxLength(14)]], // 憑證單號
    summonsNumber: [, [Validators.maxLength(11)]], // 傳票號碼
    totalNumberStart: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 彙總張數
    totalNumberEnd: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 彙總張數
    plusRemark: ['', [Validators.maxLength(1)]], // 彙加註記
    systemCategory: ['', [Validators.maxLength(1)]], // 系統別
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
    { field: 'col7', header: '廠商編號(統一編號)', visible: true },
    { field: 'col8', header: '發票總金額', visible: true },
    { field: 'col9', header: '發票未稅金額', visible: true },
    { field: 'col10', header: '發票稅額', visible: true },
    { field: 'col11', header: '發票用途', visible: true },
    { field: 'col12', header: '課稅別', visible: true },
    { field: 'col13', header: '扣扺代號', visible: true },
    { field: 'col14', header: '類別區分', visible: true },
    { field: 'col15', header: '憑證單號', visible: true },
    { field: 'col16', header: '傳票號碼', visible: true },
    { field: 'col17', header: '彙總張數', visible: true },
    { field: 'col18', header: '彙加註記', visible: true },
    { field: 'col19', header: '系統別', visible: true },
    { field: 'col20', header: '備註', visible: true },

    // 其他欄位
  ];
  // ----------------------------------------------------------------
  usageOptions: any[] = [
    { value: 1, label: '營業用' },
    { value: 2, label: '共同使用' },
  ];
  taxTypeOptions: any[] = [];
  deductionCodeOptions: any[] = [
    { value: 1, label: '代表近項可扣抵之進貨及費用' },
    { value: 2, label: '代表近項可扣抵之固定資產' },
    { value: 3, label: '代表近項不可扣抵之進貨及費用' },
    { value: 4, label: '代表近項不可扣抵之固定資產' },
  ];
  categoryOptions: any[] = [
    { value: 1, label: '進貨及費用' },
    { value: 2, label: '固定資產' },
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
    this.ProgNo = '110023';
    this.cruPage = '/FIN1000/FIN14080CRU';
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
