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

//5.1.2.1 顧客意見類別維護
@Component({
  selector: 'app-cpm12010',
  templateUrl: './cpm12010.component.html',
  styleUrl: './cpm12010.component.scss'
})
export class CPM12010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    opinionCode: [[] as number[]], // 客戶意見類別編號
    categoryName: ['', [Validators.maxLength(40)]], // 類別名稱
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
    { 'isdelete': false, 'opinionCode': 'T001', 'categoryName': '意見反映' },
    { 'isdelete': false, 'opinionCode': 'T002', 'categoryName': '廣告業務' },
    { 'isdelete': false, 'opinionCode': 'T003', 'categoryName': '活動、場地洽談' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'opinionCode', header: '客戶意見類別編號', visible: true },
    { field: 'categoryName', header: '類別名稱', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  opinionCodeOptions: any[] = [
    { value: 1, label: 'T001/意見反映' },
    { value: 2, label: 'T002/廣告業務' },
    { value: 3, label: 'T003/活動、場地洽談' },
    { value: 4, label: 'T004/承租店櫃' },
    { value: 5, label: 'T005/合作提案' },
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
    this.ProgNo = '510008';
    this.cruPage = '/CPM1000/CPM12010CRU';
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
