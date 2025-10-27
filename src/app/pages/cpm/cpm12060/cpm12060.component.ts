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
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//5.1.2.6  顧客意見處理狀況表
@Component({
  selector: 'app-cpm12060',
  templateUrl: './cpm12060.component.html',
  styleUrl: './cpm12060.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, MultiSelectComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class CPM12060Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    receiveDateFrom: [], // 接件日期
    receiveDateTo: [], // 接件日期
    notificationDateFrom: [], // 通知日期
    notificationDateTo: [], // 通知日期
    handlingSituation: [[] as number[]], // 處理情況
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
    {
      'customerCode': 2014123001, 'customerName': '陳小姐', 'gender': '女'
      , 'receiveDate': '2014/12/28', 'notificationDate': '', 'handler': '', 'handlingSituation': '已建單', 'closeCase': '未結案'
    },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'customerCode', header: '客戶意見編號', visible: true },
    { field: 'customerName', header: '客戶名稱', visible: true },
    { field: 'gender', header: '性別', visible: true },

    { field: 'receiveDate', header: '接件日期', visible: true },
    { field: 'notificationDate', header: '通知日期', visible: true },
    { field: 'handler', header: '處理者', visible: true },
    { field: 'handlingSituation', header: '處理情況', visible: true },
    { field: 'closeCase', header: '是否結案', visible: true },
    // { field: 'col9', header: '電子信箱', visible: true },
    // { field: 'col10', header: '顧客意見內容', visible: true },

    // { field: 'col11', header: '建檔人員', visible: true },
    // { field: 'col12', header: '處理紀錄', visible: true },
    // { field: 'col13', header: '處理日期時間', visible: true },
    // { field: 'col14', header: '處理者', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  handlingOptions: any[] = [
    { value: 1, label: '已建單' },
    { value: 2, label: '已派單' },
    { value: 3, label: '處理中' },
    { value: 4, label: '結案' },
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
    this.ProgNo = '510013';
    this.cruPage = '/CPM1000/CPM12060CRU';
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
