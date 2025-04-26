import { ExportMethodService } from './../../../service/basic/export-method.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//
import { ExportDeclarationCategoryService } from './../../../service/basic/export-declaration-category.service';

//1.1.4.5 零稅率清單維護 
@Component({
  selector: 'app-fin14050',
  templateUrl: './fin14050.component.html',
  styleUrl: './fin14050.component.scss'
})
export class FIN14050Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    startserialinvoice: [, [this.validationService.numberValidator]], // 發票號碼
    endserialinvoice: [, [this.validationService.numberValidator]], // 發票號碼
    startInvoiceDate: [], // 發票日期
    endInvoiceDate: [], // 發票日期
    dataYmStart: [], // 資料所屬年月
    dataYmEnd: [], // 資料所屬年月
    declareYm: [], // 申報年月
    buyerUid: [, [Validators.maxLength(10)]], // 買受人統一編號
    goodsName: ['', [Validators.maxLength(20)]], // 貨物或勞務名稱
    startGoodsNumber: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 貨物或勞務數量
    endGoodsNumber: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 貨物或勞務數量
    exportMethod: [[] as number[]], // 外銷方式
    certificate: ['', [Validators.maxLength(20)]], // 證明文件名稱
    certificateID: [, [Validators.maxLength(10)]], // 證明文件號碼
    startNonCustomsExportAmount: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 非經海關出口金額
    endNonCustomsExportAmount: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 非經海關出口金額
    exportDeclarationCategory: [[] as number[]], // 出口報單類別
    exportDeclarationNumber: [, [Validators.maxLength(10)]], // 出口報單號碼
    startExportAmount: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 經海關出口金額
    endExportAmount: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 經海關出口金額
    startSettlementDate: [], // 輸出或結匯日期
    endSettlementDate: [], // 輸出或結匯日期
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
    { field: 'name', header: '發票號碼', visible: true },
    { field: 'age', header: '發票日期', visible: true },
    { field: 'email', header: '資料所屬年月', visible: true },
    { field: 'city', header: '申報年月', visible: true },
    { field: 'col1', header: '客戶編號(統一編號)', visible: true },
    { field: 'col2', header: '買受人統一編號', visible: true },
    { field: 'col3', header: '貨物或勞務名稱', visible: true },
    { field: 'col4', header: '貨物或勞務數量', visible: true },
    { field: 'col5', header: '外銷方式', visible: true },
    { field: 'col6', header: '證明文件名稱', visible: true },
    { field: 'col7', header: '證明文件號碼', visible: true },
    { field: 'col8', header: '非經海關出口金額', visible: true },
    { field: 'col9', header: '出口報單類別', visible: true },
    { field: 'col10', header: '出口報單號碼', visible: true },
    { field: 'col11', header: '經海關出口金額', visible: true },
    { field: 'col12', header: '輸出或結匯日期', visible: true },
    { field: 'col13', header: '備註', visible: true },

    // 其他欄位
  ];
  // ----------------------------------------------------------------
  exportMethodOptions: any[] = [];
  exportCategoryOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private exportMethodService: ExportMethodService,
    private exportDeclarationCategoryService: ExportDeclarationCategoryService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110020';
    this.cruPage = '/FIN1000/FIN14050CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.exportMethodService.getExportMethods().subscribe(data => {
      this.exportMethodOptions = data;

      // 全選填入
      // let allSystemValues = this.exportMethodOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   exportMethod: allSystemValues
      // });
    });
    //
    this.exportDeclarationCategoryService.getExportDeclarationCategory().subscribe(data => {
      this.exportCategoryOptions = data;

      // 全選填入
      // let allSystemValues = this.exportCategoryOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   exportDeclarationCategory: allSystemValues
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
