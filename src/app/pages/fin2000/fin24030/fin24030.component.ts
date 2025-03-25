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

//1.2.4.3 帳款貼現沖帳維護
@Component({
  selector: 'app-fin24030',
  templateUrl: './fin24030.component.html',
  styleUrl: './fin24030.component.scss'
})
export class FIN24030Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    shouldPayID: [, [Validators.maxLength(14)]], // 應付ID
    startDiscountDate: [], // 貼現日期
    endDiscountDate: [], // 貼現日期
    startDiscountCash: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 貼現金額
    endDiscountCash: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 貼現金額
    startDiscountInterest: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 貼現利息
    endDiscountInterest: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 貼現利息
    factoryID: [, [Validators.maxLength(14)]], // 廠客代號
    transferNumber: [, [Validators.maxLength(12)]], // 電匯/開票來源單號
    invoiceNumber: [, [Validators.maxLength(12)]], // 發票號碼
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
    { field: 'col1', header: '應付ID', visible: true },
    { field: 'col2', header: '貼現日期', visible: true },
    { field: 'col3', header: '貼現金額', visible: true },
    { field: 'col4', header: '貼現利息', visible: true },
    { field: 'col5', header: '廠客代號', visible: true },
    { field: 'col6', header: '電匯/開票來源單號', visible: true },
    { field: 'col7', header: '發票號碼', visible: true },
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
    this.ProgNo = '120016';
    this.cruPage = '/FIN2000/FIN24030CRU';
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
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
