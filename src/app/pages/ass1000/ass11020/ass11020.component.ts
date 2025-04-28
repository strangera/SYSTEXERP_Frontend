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

//3.1.1.2 中分類維護作業
@Component({
  selector: 'app-ass11020',
  templateUrl: './ass11020.component.html',
  styleUrl: './ass11020.component.scss'
})
export class ASS11020Component extends BasicQpageComponent implements OnInit {
  //
  bigCategoryCodeOptions: any[] = [
    { value: 1, label: 'A/裝潢工程' },
    { value: 2, label: 'B/其他工程' },
    { value: 3, label: 'C/電腦及電子零件產品' },
    { value: 4, label: 'D/電力及照明系統' },
    { value: 5, label: 'E/家電家具設備' },
    { value: 6, label: 'F/機消空電水零配件' },
    { value: 7, label: 'G/辦公及營運庶務' },
    { value: 8, label: 'K/印刷品(非廣告行銷)' },
  ];
  //
  queryForm = this.formBuilder.group({
    midCategoryCode: [, [Validators.maxLength(2)]], // 中分類代碼
    midCategoryName: ['', [Validators.maxLength(32)]], // 中分類名稱
    bigCategoryCode: [], // 大分類代碼
    bigCategoryName: ['', [Validators.maxLength(40)]], // 大分類名稱
    illustrate: [,], // 說明
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
    { 'midCategoryCode': '01', 'midCategoryName': '機電零件', 'bigCategoryCode': 'F', 'illustrate': '說明1' },
    { 'midCategoryCode': '21', 'midCategoryName': '弱電系統', 'bigCategoryCode': 'B', 'illustrate': '說明2' },
    { 'midCategoryCode': '21', 'midCategoryName': '燈具照明設備-資產', 'bigCategoryCode': 'D', 'illustrate': '說明3' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'midCategoryCode', header: '中分類代碼', visible: true },
    { field: 'midCategoryName', header: '中分類名稱', visible: true },
    { field: 'bigCategoryCode', header: '大分類代碼', visible: true },
    { field: 'illustrate', header: '說明', visible: false },
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
    this.ProgNo = '310002';
    this.cruPage = '/ASS1000/ASS11020CRU';
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
