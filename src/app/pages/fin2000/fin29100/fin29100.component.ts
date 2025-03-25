import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { BankAccountCodeService } from '../../../service/basic/bank-account-code.service';
//

//1.2.9.10 支出憑單明細表
@Component({
  selector: 'app-fin29100',
  templateUrl: './fin29100.component.html',
  styleUrl: './fin29100.component.scss'
})
export class FIN29100Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    startdate: [, [Validators.required]], // 匯款/開票/調撥日期
    enddate: [, [Validators.required]], // 匯款/開票/調撥日期
    bankCode: [], // 銀行代號
    startserialticket: [, [this.validationService.numberValidator, Validators.max(9999999999999)]], // 匯款/開票/調撥單號
    endserialticket: [, [this.validationService.numberValidator, Validators.max(9999999999999)]], // 匯款/開票/調撥單號
    type: [[] as number[]], // 型態
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
    { field: 'col1', header: '型態', visible: true },
    { field: 'col2', header: '匯款/開票/調撥單號', visible: true },
    { field: 'col3', header: '匯款/開票/調撥日期', visible: true },
    { field: 'col4', header: '廠商代號', visible: true },
    { field: 'col5', header: '匯款/開票/調撥金額', visible: true },
    { field: 'col6', header: '匯款/調撥手續費', visible: true },
    { field: 'col7', header: '付款銀行', visible: true },
    { field: 'col8', header: '支票號碼', visible: true },
    { field: 'col9', header: '到期日', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  bankCodeOptions: any[] = [];
  typeOptions: any[] = [
    { value: 1, label: '開票' },
    { value: 2, label: '匯款' },
    { value: 3, label: '調撥' },
  ];

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
    this.ProgNo = '120033';
    this.cruPage = '/FIN2000/FIN29100CRU';
    //
    // ----------------------------------------------------------------
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
