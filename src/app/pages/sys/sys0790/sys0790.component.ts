import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

const now = new Date();

@Component({
  selector: 'app-sys0790',
  templateUrl: './sys0790.component.html',
  styleUrl: './sys0790.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
// 使用者作業按鈕歷程報表
export class SYS0790Component extends BasicQpageComponent implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    lastLoginStartTime: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd HH:mm)
    lastLoginEndTime: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd HH:mm)
    UserCodeOptions: [], // DropDown
    systemTypeDetail: [], // DropDown
  });
  // 表格
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'logTime', header: 'LOG時間', visible: true },
    { field: 'user', header: '使用者', visible: true },
    { field: 'userName', header: '使用者名稱', visible: true },
    { field: 'operationCode', header: '作業代碼', visible: true },
    { field: 'operationName', header: '作業名稱', visible: true },
    { field: 'buttonName', header: '按鈕名稱', visible: true },
    { field: 'linkLocation', header: '連結位置', visible: true },
  ];

  // Options
  organizationNumberOptions: any[] = [];
  userStatusOptions: any[] = [];
  userTypeOptions: any[] = [];
  UserCodeOptions: any[] = [];
  systemTypeDetailOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420018';
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demoCRU'], extras);
  }
}
