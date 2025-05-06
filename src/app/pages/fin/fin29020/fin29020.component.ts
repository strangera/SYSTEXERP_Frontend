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
import { VendorService } from '../../../service/basic/vendor.service';
//

//1.2.9.2 匯款明細表
@Component({
  selector: 'app-fin29020',
  templateUrl: './fin29020.component.html',
  styleUrl: './fin29020.component.scss'
})
export class FIN29020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    transferDateFrom: [], // 匯款日期
    transferDateTo: [], // 匯款日期
    bankCode: [], // 銀行代號
    startTransferNumber: [, [Validators.max(999999999999)]], // 匯款單號
    endTransferNumber: [, [Validators.max(999999999999)]], // 匯款單號
    factoryID: [], // 廠客代號
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
    { field: 'col1', header: '匯款單號', visible: true },
    { field: 'col2', header: '銀行代號', visible: true },
    { field: 'col3', header: '匯款日期', visible: true },
    { field: 'col4', header: '廠商名稱', visible: true },
    { field: 'col5', header: '匯款銀行代號', visible: true },
    { field: 'col6', header: '解款銀行名稱', visible: true },
    { field: 'col7', header: '銀行帳號', visible: true },
    { field: 'col8', header: '帳戶名稱', visible: true },
    { field: 'col9', header: '帳款金額', visible: true },
    { field: 'col10', header: '匯款金額', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  bankCodeOptions: any[] = [];
  factoryIDOptions: any[] = [];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private vendorService: VendorService,
    private bankAccountCodeService: BankAccountCodeService,

  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120025';
    this.cruPage = '/FIN2000/FIN29020CRU';
    //
    // ----------------------------------------------------------------
    //
    this.bankAccountCodeService.getSystemTypes().subscribe(data => {
      this.bankCodeOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.factoryIDOptions = data;
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
