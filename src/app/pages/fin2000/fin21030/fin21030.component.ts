import { ApprovalStatusService } from './../../../service/basic/approval-status.service';
import { SystemTypeService } from './../../../service/basic/system-type.service';
import { PaymentMethodService } from './../../../service/basic/payment-method.service';
import { WhetherService } from './../../../service/basic/whether.service';
import { PostageChargeService } from './../../../service/basic/postage-charge.service';
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

//1.2.1.3 廠客資料維護 
@Component({
  selector: 'app-fin21030',
  templateUrl: './fin21030.component.html',
  styleUrl: './fin21030.component.scss'
})
export class FIN21030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    vendorCode: [, [Validators.maxLength(14)]], // 廠客代號
    vendorName: ['', [Validators.maxLength(64)]], // 廠客名稱
    vendorSName: ['', [Validators.maxLength(20)]], // 廠商簡稱
    postCode: [, [Validators.maxLength(5)]], // 郵遞區號
    postAddress: ['', [Validators.maxLength(100)]], // 郵寄地址
    contactPerson: ['', [Validators.maxLength(20)]], // 聯絡人
    phone: ['', [Validators.maxLength(20)]], // 電話
    fax: [, [Validators.maxLength(20)]], // 	傳真
    uId: [, [Validators.maxLength(10)]], // 統一編號
    postBelong: [[] as number[]], // 郵電費負擔
    payoutVendor: [[] as number[]], // 貼現廠商
    noTransfer: [[] as number[]], // 禁止背書轉讓
    paymentMethod: [[] as number[]], // 付款方式
    vendorTransferAccount: [, [Validators.maxLength(20)]], // 廠商匯款銀行代號
    vendorAccount: [, [Validators.maxLength(20)]], // 廠商銀行帳號
    vendorAccountName: ['', [Validators.maxLength(64)]], // 廠商帳戶名稱
    payoutLimit: [, [Validators.maxLength(3)]], // 付款期限
    ticketTitle: ['', [Validators.maxLength(20)]], // 票據抬頭
    systemType: [[] as number[]], // 系統別
    status: [[] as number[]], // 審核狀態
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
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private postageChargeService: PostageChargeService,
    private whetherService: WhetherService,
    private paymentMethodService: PaymentMethodService,
    private systemTypeService: SystemTypeService,
    private approvalStatusService: ApprovalStatusService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120003';
    this.cruPage = '/FIN2000/FIN21030CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.postageChargeService.getSystemTypes().subscribe(data => {
      this.postBelongOptions = data;

      // 全選填入
      // let allSystemValues = this.postBelongOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   postBelong: allSystemValues
      // });
    });
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;

      // 全選填入
      // let allSystemValues = this.whetherOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   payoutVendor: allSystemValues,
      //   noTransfer: allSystemValues
      // });
    });
    //
    this.paymentMethodService.getSystemTypes().subscribe(data => {
      this.paymentMethodOptions = data;

      // 全選填入
      // let allSystemValues = this.paymentMethodOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   paymentMethod: allSystemValues
      // });
    });
    //
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;

      // 全選填入
      // let allSystemValues = this.systemTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   systemType: allSystemValues
      // });
    });
    //
    this.approvalStatusService.getSystemTypes().subscribe(data => {
      this.statusOptions = data;
      // 全選填入
      // let allSystemValues = this.statusOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   status: allSystemValues
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
