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

//1.1.4.2 進貨退出或折讓資料維護
@Component({
  selector: 'app-fin14020',
  templateUrl: './fin14020.component.html',
  styleUrl: './fin14020.component.scss'
})
export class FIN14020Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    startReturnTicket: [, [this.validationService.numberValidator, Validators.maxLength(12)]], // 退出/折讓單號
    endReturnTicket: [, [this.validationService.numberValidator, Validators.maxLength(12)]], // 退出/折讓單號
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    startInvoiceTicket: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼
    endInvoiceTicket: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼
    startdate: [], // 退出/折讓日期
    enddate: [], // 退出/折讓日期
    invoiceFormat: [[] as number[]], // 發票格式
    onedatemm: [], // 申報年月
    startVoucherTicket: [, [this.validationService.numberValidator, Validators.maxLength(14)]], // 憑證單號
    endVoucherTicket: [, [this.validationService.numberValidator, Validators.maxLength(14)]], // 憑證單號
    startSummonsTicket: [, [this.validationService.numberValidator, Validators.maxLength(11)]], // 傳票編號
    endSummonsTicket: [, [this.validationService.numberValidator, Validators.maxLength(11)]], // 傳票編號
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
  columns: any[]= [
    { field: 'col1', header: '退出/折讓單號', visible: true },
    { field: 'col2', header: '字軌', visible: true },
    { field: 'col3', header: '發票號碼', visible: true },
    { field: 'col4', header: '退出/折讓日期', visible: true },
    { field: 'col5', header: '發票格式', visible: true },
    { field: 'col6', header: '區別', visible: true },
    { field: 'col7', header: '申報年月', visible: true },
    { field: 'col8', header: '退回/折讓金額', visible: true },
    { field: 'col9', header: '退回/折讓稅額', visible: true },
    { field: 'col10', header: '憑證單號', visible: true },
    { field: 'col11', header: '傳票編號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  invoiceFormatOptions:any[]=[
    { value: 1, label: 21 },
    { value: 2, label: 22 },
    { value: 3, label: 23 },
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
    this.ProgNo = '110017';
    this.cruPage = '/FIN1000/FIN14020CRU';
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
