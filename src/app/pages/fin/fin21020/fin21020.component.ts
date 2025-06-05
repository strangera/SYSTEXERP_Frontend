import { BankAccountCodeService } from './../../../service/basic/bank-account-code.service';
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

//1.2.1.2 費率對照維護
@Component({
  selector: 'app-fin21020',
  templateUrl: './fin21020.component.html',
  styleUrl: './fin21020.component.scss'
})
export class FIN21020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    companyBankCode: [], // 公司銀行科目代號
    startMaxCash: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 金額上限
    endMaxCash: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 金額上限
    startMinCash: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 金額下限
    endMinCash: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 金額下限
    startVendorFee: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 廠商負擔電匯手續費
    endVendorFee: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 廠商負擔電匯手續費
    startCompanyFee: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 公司負擔電匯手續費
    endCompanyFee: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 公司負擔電匯手續費
    startVendorRevenue: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 廠商負擔電匯手續費回饋收入
    endVendorRevenue: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 廠商負擔電匯手續費回饋收入
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
    { field: 'col3', header: '金額下限', visible: true },
    { field: 'col4', header: '金額上限', visible: true },
    { field: 'col5', header: '廠商負擔電匯手續費', visible: true },
    { field: 'col6', header: '廠商負擔電匯手續費回饋收入', visible: true },
    { field: 'col7', header: '公司負擔電匯手續費', visible: true },
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
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120002';
    this.cruPage = '/FIN2000/FIN21020CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.bankAccountCodeService.getSystemTypes().subscribe(data => {
      this.bankCodeOptions = data;
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
