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

//5.1.2.2 顧客意見責任單位維護
@Component({
  selector: 'app-cpm12020',
  templateUrl: './cpm12020.component.html',
  styleUrl: './cpm12020.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class CPM12020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    opinionCode: [[] as number[]], // 顧客意見責任單位編號
    unitName: ['', [Validators.maxLength(40)]], // 責任單位名稱類別名稱
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
    { 'isdelete': false, 'opinionCode': 'X001', 'unitName': '營運部' },
    { 'isdelete': false, 'opinionCode': 'X002', 'unitName': '行銷部' },
    { 'isdelete': false, 'opinionCode': 'X003', 'unitName': '管理部' },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'opinionCode', header: '顧客意見責任單位編號', visible: true },
    { field: 'unitName', header: '責任單位名稱類別名稱', visible: true },

    // { field: 'col3', header: '歸還日期', visible: true },
    // { field: 'col4', header: '姓名', visible: true },
    // { field: 'col5', header: '連絡電話', visible: true },
    // { field: 'col6', header: '出借處理人員', visible: true },
    // { field: 'col7', header: '證件類型', visible: true },
    // { field: 'col8', header: '證件編號', visible: true },
    // { field: 'col9', header: '出借狀態', visible: true },
    // { field: 'col10', header: '備註', visible: true },

    // { field: 'col11', header: '廠商帳戶名稱', visible: true },
    // { field: 'col12', header: '付款期限', visible: true },
    // { field: 'col13', header: '票據抬頭', visible: true },
    // { field: 'col14', header: '審核狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  opinionCodeOptions: any[] = [
    { value: 1, label: 'X001/營運部' },
    { value: 2, label: 'X002/行銷部' },
    { value: 3, label: 'X003/管理部' },
    { value: 4, label: 'X004/經企部' },
    { value: 5, label: 'X005/財政部' },
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
    this.ProgNo = '510009';
    this.cruPage = '/CPM1000/CPM12020CRU';
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
