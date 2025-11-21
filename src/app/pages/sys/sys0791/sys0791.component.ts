import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

const nowDate = new Date();

@Component({
  selector: 'app-sys0791',
  templateUrl: './sys0791.component.html',
  styleUrl: './sys0791.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
// 作業使用率查詢
export class SYS0791Component {
  ProgNo: string = '420016';
  // 權限
  funInfo?: FunsrightInfo;



  // 查詢
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    organizationNumber: [], // DropDown
    startdate: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd)
    enddate: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd)
    queryAngleOptions: [, [Validators.required]], // DropDown
    UserCodeOptions: [], // DropDown
    roleCodeOptions: [], // DropDown
    systemTypeDetail: [], // DropDown
    subsystemOptions: [], // DropDown
    jobNumberOptions: [], // DropDown
  });
  // 表格
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'userCode', header: '使用者編號', visible: true },
    { field: 'userName', header: '使用者名稱', visible: true },
    { field: 'orgCode', header: '組織編號', visible: true },
    { field: 'orgName', header: '組織名稱', visible: true },
    { field: 'mainSystemCode', header: '主系統編號', visible: true },
    { field: 'mainSystemName', header: '主系統名稱', visible: true },
    { field: 'subSystemCode', header: '子系統編號', visible: true },
    { field: 'subSystemName', header: '子系統名稱', visible: true },
    { field: 'operationCode', header: '作業編號', visible: true },
    { field: 'operationName', header: '作業名稱', visible: true },
    { field: 'failureCount', header: '使用次數', visible: true },
    { field: 'usageRate', header: '使用率', visible: true },
  ];

  // Options

  organizationNumberOptions: any[] = [];
  queryAngleOptions: any[] = [];
  UserCodeOptions: any[] = [];
  roleCodeOptions: any[] = [];
  subsystemOptions: any[] = [];
  systemTypeDetailOptions: any[] = [];
  jobNumberOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
  ) { }

  ngOnInit(): void {
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
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
    this.queryForm.reset();  // 重置表單
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
