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

//1.1.4.10 刪除二聯收銀發票退回作業 
@Component({
  selector: 'app-fin14100',
  templateUrl: './fin14100.component.html',
  styleUrl: './fin14100.component.scss'
})
export class FIN14100Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    declareYm: [], // 	申報年月
    returnDate: [], // 	退出/折讓日期
    registerID: [, [Validators.maxLength(10)]], // 收銀機機號
    wordTrack: ['', [Validators.maxLength(2)]], // 發票字軌
    invoiceNumberFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼
    invoiceNumberTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼
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
    { field: 'col1', header: '收銀機機號', visible: true },
    { field: 'col2', header: '交易序號', visible: true },
    { field: 'col3', header: '字軌', visible: true },
    { field: 'col4', header: '發票號碼(起)', visible: true },
    { field: 'col5', header: '發票號碼(迄)', visible: true },
    { field: 'col6', header: '退出/折讓日期', visible: true },
    { field: 'col7', header: '課稅別', visible: true },
    { field: 'col8', header: '退出/折讓金額', visible: true },
    { field: 'col9', header: '退出/折讓稅額', visible: true },
    { field: 'col10', header: '合計', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110025';
    this.cruPage = '/FIN1000/FIN14100CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
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
