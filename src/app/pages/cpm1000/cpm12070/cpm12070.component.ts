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

//5.1.2.7  顧客意見類別統計表
@Component({
  selector: 'app-cpm12070',
  templateUrl: './cpm12070.component.html',
  styleUrl: './cpm12070.component.scss'
})
export class CPM12070Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    opinionCategory: [[] as number[]], // 客戶意見類別
    receiveDateFrom: [], // 接件日期
    receiveDateTo: [], // 接件日期
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
    { 'opinionCode': 'T001', 'opinionName': '意見反映', 'caseNumber': 1589,
      'doneCase': 341, 'processingCase': 1248},
      { 'opinionCode': 'T003', 'opinionName': '活動、場地洽談', 'caseNumber': 4,
        'doneCase': 0, 'processingCase': 4},
    // 其他資料
  ];
  columns: any[]= [
    { field: 'opinionCode', header: '客戶意見類別代號', visible: true },
    { field: 'opinionName', header: '客戶意見類別名稱', visible: true },
    { field: 'caseNumber', header: '總件數', visible: true },
    { field: 'doneCase', header: '完成件數', visible: true },
    { field: 'processingCase', header: '待處理件數', visible: true },
    // { field: 'col6', header: '處理者', visible: true },
    // { field: 'col7', header: '處理情況', visible: true },
    // { field: 'col8', header: '是否結案', visible: true },
    // { field: 'col9', header: '電子信箱', visible: true },
    // { field: 'col10', header: '顧客意見內容', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  opinionOptions: any[] = [
    { value: 1, label: '意見反映' },
    { value: 2, label: '廣告業務' },
    { value: 3, label: '活動、場地洽談' },
    { value: 4, label: '承租店櫃'},
    { value: 5, label: '合作提案'},
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
    this.ProgNo = '510014';
    this.cruPage = '/CPM1000/CPM12070CRU';
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
