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

//3.1.4.3  傳票審核傳送作業
@Component({
  selector: 'app-ass14030',
  templateUrl: './ass14030.component.html',
  styleUrl: './ass14030.component.scss'
})
export class ASS14030Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    subpoenaType: [[] as number[]], // 傳票總類
    subpoenaDateFrom: [], // 傳票日期
    subpoenaDateTo: [], // 傳票日期
    subpoenaStatus: [[] as number[]], // 傳票狀態
    checkoutNumber: [, [Validators.maxLength(12),this.validationService.numberValidator]], // 結帳單號
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
    { 'temp': '應付', 'subpoenaNumber': '', 'subpoenaType': '資材進貨', 'maintenanceNumber': 'I0000377',
      'subpoenaDateFrom': '2022/08/04', 'subpoenaStatus': '未拋轉', 'subpoenaSummary': '202208月進貨傳票', 'checkoutNumber': '20220831',
     },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[]= [
    { field: 'temp', header: '應收(付)明細暫存資料', visible: true },
    { field: 'subpoenaNumber', header: '傳票編號', visible: true },
    { field: 'subpoenaType', header: '傳票種類', visible: true },
    { field: 'maintenanceNumber', header: '發票維護單號', visible: true },
    { field: 'subpoenaDateFrom', header: '傳票日期', visible: true },
    { field: 'subpoenaStatus', header: '傳票狀態', visible: true },
    { field: 'subpoenaSummary', header: '傳票摘要', visible: true },
    { field: 'checkoutNumber', header: '結帳單號', visible: true },

    // 其他欄位
  ];
  // ----------------------------------------------------------------
  subpoenaTypeOptions: any[] = [
    { value: 1, label: '資材報廢' },
    { value: 2, label: '折舊' },
    { value: 3, label: '月結庫存' },
    { value: 4, label: '資材變賣' },
    { value: 5, label: '資材進貨' },
  ];

  subpoenaStatusOptions: any[] = [
    { value: 0, label: '未拋轉' },
    { value: 1, label: '已拋轉' },
    { value: 2, label: '已退回' },
  ];
  
  //
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
    this.ProgNo = '310030';
    this.cruPage = '/ASS1000/ASS14030CRU';
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
