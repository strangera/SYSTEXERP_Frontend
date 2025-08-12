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
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//1.3.3.1 拋轉收款沖帳傳票
@Component({
  selector: 'app-fin33010',
  templateUrl: './fin33010.component.html',
  styleUrl: './fin33010.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN33010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    receive_ID: [, [Validators.required]], // 收款單號
    summons_Date: [, [Validators.required]], // 傳票日期
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
    // { 'name': 'Emily', 'age': 28, '電子信箱': 'emily@example.com', 'city': 'Kaohsiung' },
    // { 'name': 'Michael', 'age': 31, '電子信箱': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, '電子信箱': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '序號', visible: true },
    { field: 'col2', header: '科目代號', visible: true },
    { field: 'col3', header: '科目名稱', visible: true },
    { field: 'col4', header: '廠商代號', visible: true },
    { field: 'col5', header: '摘要', visible: true },
    { field: 'col6', header: '借方金額', visible: true },
    { field: 'col7', header: '貸方金額', visible: true },
    { field: 'col8', header: '組織代號', visible: true },
    { field: 'col9', header: '立沖代號', visible: true },
    { field: 'col10', header: '活動代號', visible: true },
    { field: 'col11', header: '對象別編號', visible: true },
    { field: 'col12', header: '對帳KEY值', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  receiveOptions: any[] = [
    { value: 1, label: 'R20150105002/20150105/ /N' },
    { value: 2, label: 'R20150301001/20150301/應收帳款-聯合調整 /N' },
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
    this.ProgNo = '130006';
    this.cruPage = '/FIN3000/FIN33010CRU';
    //
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
