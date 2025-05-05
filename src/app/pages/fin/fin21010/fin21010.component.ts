import { NeedPayTicketService } from './../../../service/basic/need-pay-ticket.service';
import { DepositCodeService } from './../../../service/basic/deposit-code.service';
import { BankAccountCodeService } from './../../../service/basic/bank-account-code.service';
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

//1.2.1.1 公司銀行資料維護 
@Component({
  selector: 'app-fin21010',
  templateUrl: './fin21010.component.html',
  styleUrl: './fin21010.component.scss'
})
export class FIN21010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    companyBankCode: [], // 公司銀行科目代號
    companyBankName: ['', [Validators.maxLength(40)]], // 公司銀行科目名稱
    bankCode: [], // 全省銀行代號
    account: [, [Validators.maxLength(15)]], // 帳號
    accountName: ['', [Validators.maxLength(80)]], // 帳戶名稱
    edi: [, [Validators.maxLength(12)]], // EDI用戶代號(統一編號)
    depositCode: [[] as number[]], // 存款代號
    needPayTicket: [], // 應付票據
    needReceiveTicket: [], // 應收票據
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
    { field: 'col1', header: '公司銀行科目代號', visible: true },
    { field: 'col2', header: '公司銀行科目名稱', visible: true },
    { field: 'col3', header: '全省銀行代號', visible: true },
    { field: 'col4', header: '帳號', visible: true },
    { field: 'col5', header: '帳戶名稱', visible: true },
    { field: 'col6', header: 'EDI用戶代號(統一編號)', visible: true },
    { field: 'col7', header: '存款代號', visible: true },
    { field: 'col8', header: '應付票據', visible: true },
    { field: 'col9', header: '應付票據', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  bankCodeOptions: any[] = [];
  depositCodeOptions: any[] = [];
  needPayTicketOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private bankAccountCodeService: BankAccountCodeService,
    private depositCodeService: DepositCodeService,
    private needPayTicketService: NeedPayTicketService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120001';
    this.cruPage = '/FIN2000/FIN21010CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.bankAccountCodeService.getSystemTypes().subscribe(data => {
      this.bankCodeOptions = data;
    });
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.needPayTicketOptions = data;
    });
    //
    this.depositCodeService.getDepositCodes().subscribe(data => {
      this.depositCodeOptions = data;
      // 全選填入
      // let allSystemValues = this.depositCodeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   depositCode: allSystemValues
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
