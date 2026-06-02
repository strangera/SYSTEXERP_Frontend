import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Sys0791Service } from '@service/api/sys/sys0791.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-sys0791',
  templateUrl: './sys0791.component.html',
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
    TableReportComponent
  ],
})
// 作業使用率查詢
export class SYS0791Component extends BasicQueryPageComponent<any> implements OnInit {
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
  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any = {};
  columns: any[] = [
    { field: 'userCode', header: '使用者編號' },
    { field: 'userName', header: '使用者名稱' },
    { field: 'orgCode', header: '組織編號' },
    { field: 'orgName', header: '組織名稱' },
    { field: 'mainSystemCode', header: '主系統編號' },
    { field: 'mainSystemName', header: '主系統名稱' },
    { field: 'subSystemCode', header: '子系統編號' },
    { field: 'subSystemName', header: '子系統名稱' },
    { field: 'operationCode', header: '作業編號' },
    { field: 'operationName', header: '作業名稱' },
    { field: 'failureCount', header: '使用次數' },
    { field: 'usageRate', header: '使用率' },
  ];
  organizationNumberOptions: any[] = [];
  queryAngleOptions: any[] = [];
  UserCodeOptions: any[] = [];
  roleCodeOptions: any[] = [];
  subsystemOptions: any[] = [];
  systemTypeDetailOptions: any[] = [];
  jobNumberOptions: any[] = [];

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly sys0791Service: Sys0791Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0791');
  }

  onSubmit(frm: FormGroup) {
  }
}
