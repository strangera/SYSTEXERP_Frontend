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

//5.2.1.2  廠商基本資料維護
@Component({
  selector: 'app-cpm21020',
  templateUrl: './cpm21020.component.html',
  styleUrl: './cpm21020.component.scss'
})
export class CPM21020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    vendorId: [, [Validators.maxLength(12)]], // 廠商編號
    vendorUid: [, [Validators.maxLength(10)]], // 廠商統一編號
    vendorCName: ['', [Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    vendorSName: ['', [Validators.maxLength(10)]], // 廠商簡稱
    invoiceAddress: ['', [Validators.maxLength(60)]], // 發票地址
    //
    principal: ['', [Validators.maxLength(12)]], // 負責人
    principalTitle: ['', [Validators.maxLength(16)]], // 負責人職稱
    principalUid: ['', [Validators.maxLength(10)]], // 負責人身份証字號
    principalPhone: [, [Validators.maxLength(15)]], // 負責人電話
    principalAddress: ['', [Validators.maxLength(100)]], // 負責人聯絡地址
    principalEmail: ['', [Validators.maxLength(60)]], // 負責人電子郵件
    //
    companyAddress: ['', [Validators.maxLength(100)]], // 公司登記地址
    companyPhone: [, [Validators.maxLength(15)]], // 公司登記電話
    companyFax: [, [Validators.maxLength(15)]], // 公司傳真
    //
    remark: [,], // 附註
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
    { field: 'col1', header: '廠商編號', visible: true },
    { field: 'col2', header: '廠商統一編號', visible: true },
    { field: 'col3', header: '廠商名稱(中文)', visible: true },
    { field: 'col4', header: '廠商名稱(英文)', visible: true },
    { field: 'col5', header: '廠商簡稱', visible: true },
    { field: 'col6', header: '發票地址', visible: true },

    { field: 'col7', header: '負責人', visible: true },
    { field: 'col8', header: '負責人職稱', visible: true },
    { field: 'col9', header: '負責人身份証字號', visible: true },
    { field: 'col10', header: '負責人電話', visible: true },
    { field: 'col11', header: '負責人聯絡地址', visible: true },
    { field: 'col12', header: '負責人電子郵件', visible: true },

    { field: 'col13', header: '公司登記地址', visible: true },
    { field: 'col14', header: '公司登記電話', visible: true },
    { field: 'col15', header: '公司傳真', visible: true },

    { field: 'col16', header: '附註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
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
    this.ProgNo = '520002';
    this.cruPage = '/CPM2000/CPM21020CRU';
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
