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

//5.1.2.4 顧客意見來源維護
@Component({
  selector: 'app-cpm12040',
  templateUrl: './cpm12040.component.html',
  styleUrl: './cpm12040.component.scss'
})
export class CPM12040Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    opinionCode: [], // 客戶意見來源編號
    opinionName: ['', [Validators.maxLength(40)]], // 客戶意見來源名稱
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
    { 'isdelete': false, 'opinionCode': 40682483, 'opinionName': '現場' },
    { 'isdelete': false, 'opinionCode': 40682484, 'opinionName': '來電' },
    { 'isdelete': true, 'opinionCode': 40682485, 'opinionName': '社群網站' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'opinionCode', header: '客戶意見來源編號', visible: true },
    { field: 'opinionName', header: '客戶意見來源名稱', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  opinionCodeOptions: any[] = [
    { value: 1, label: '40682483/現場' },
    { value: 2, label: '40682484/來電' },
    { value: 3, label: '40682485/Email' },
    { value: 4, label: '40682486/社群網站' },
    { value: 5, label: '40682487/郵寄信函' },
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
    this.ProgNo = '510011';
    this.cruPage = '/CPM1000/CPM12040CRU';
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
