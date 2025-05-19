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

@Component({
  selector: 'app-fin11080',
  templateUrl: './fin11080.component.html',
  styleUrl: './fin11080.component.scss'
})

//1.1.1.8 二電退貨發票號碼清空重新上送作業
export class FIN11080Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    salesDate: [, [Validators.required]], // 銷售日期
    regidterCode: [, [Validators.required]], // 收銀機代號
    transactionSerialnumber: [, [Validators.required, Validators.maxLength(6)]], // 交易序號
    wordTrack: ['', [Validators.required, Validators.maxLength(2)]], // 字軌
    invoiceSerialnumber: [, [Validators.required, Validators.maxLength(8)]], // 發票號碼
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
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '銷售日期', visible: true },
    { field: 'col2', header: '收銀機代號', visible: true },
    { field: 'col3', header: '交易序號', visible: true },
    { field: 'col4', header: '字軌', visible: true },
    { field: 'col5', header: '發票號碼', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  regidterCodeOptions: any[] = [
    { value: 1, label: '000011/000001' },
    { value: 2, label: '000012/000001' },
    { value: 3, label: '000022/000002' },
    { value: 4, label: '000031/000003' },
  ];

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
    this.ProgNo = '110008';
    this.cruPage = '/FIN1000/FIN11080CRU';
    //
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------

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
  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}
