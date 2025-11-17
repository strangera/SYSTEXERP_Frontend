import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//5.1.2.3 顧客意見子類別維護
@Component({
  selector: 'app-cpm12030',
  templateUrl: './cpm12030.component.html',
  styleUrl: './cpm12030.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class CPM12030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    subCategoryCode: [], // 子類別編號
    subCategoryName: ['', [Validators.maxLength(40)]], // 責任單位名稱類別名稱
    opinionCategory: [], // 客戶意見主類別
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
    { 'isdelete': false, 'opinionCategoryCode': 'T001', 'opinionCategoryName': '意見反映', 'subCategoryCode': 'D001', 'subCategoryName': '服務' },
    { 'isdelete': false, 'opinionCategoryCode': 'T001', 'opinionCategoryName': '意見反映', 'subCategoryCode': 'D002', 'subCategoryName': '設備' },
    { 'isdelete': true, 'opinionCategoryCode': 'T001', 'opinionCategoryName': '意見反映', 'subCategoryCode': 'D003', 'subCategoryName': '商品' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'opinionCategoryCode', header: '主類別編號', visible: true },
    { field: 'opinionCategoryName', header: '主類別名稱', visible: true },
    { field: 'subCategoryCode', header: '子類別編號', visible: true },
    { field: 'subCategoryName', header: '子類別名稱', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  subCategoryCodeOptions: any[] = [
    { value: 1, label: 'D001/服務' },
    { value: 2, label: 'D002/設備' },
    { value: 3, label: 'D003/商品' },
    { value: 4, label: 'D004/其他' },
    { value: 5, label: 'D005/廣告業務' },
  ];
  opinionCategoryOptions: any[] = [
    { value: 1, label: '意見反映' },
    { value: 2, label: '廣告業務' },
    { value: 3, label: '活動、場地洽談' },
    { value: 4, label: '承租店櫃' },
    { value: 5, label: '合作提案' },
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
    this.ProgNo = '510010';
    this.cruPage = '/CPM1000/CPM12030CRU';
    //

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
