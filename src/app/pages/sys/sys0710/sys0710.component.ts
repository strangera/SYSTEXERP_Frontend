import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IUserResponse, Sys0110Service } from '@service/api/sys/sys0110.service';
import { Sys0710Response, Sys0710Service } from '@service/api/sys/sys0710.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-sys0710',
  templateUrl: './sys0710.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    DropdownComponent
  ],
})
// 使用者系統權限列表
export class SYS0710Component extends BasicQueryPageComponent<Sys0710Response> implements OnInit {
  queryForm = this.formBuilder.group({
    user_No: [null, [Validators.required]], // 使用者編號
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'MainSystemCode', order: 1 }]],
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Sys0710Response[] = [];
  lastQueryBody: { user_No: string } | null = null;
  userNoOptions: IUserResponse[] = [];
  columns: ReportColumn[] = [
    { field: 'User_No', header: '使用者編號', visible: true, showSort: false },
    { field: 'User_Name', header: '使用者名稱', visible: true, showSort: false },
    { field: 'MainSystemCode', header: '主系統代碼', visible: true },
    { field: 'MainSystemName', header: '主系統名稱', visible: true },
    { field: 'SubsystemCode', header: '子系統代碼', visible: true },
    { field: 'SubsystemName', header: '子系統名稱', visible: true },
    { field: 'Prog_No', header: '作業代碼', visible: true },
    { field: 'Prog_Name', header: '作業名稱', visible: true },
    { field: 'FunctionButtons', header: '具有權限之功能按鍵', visible: true },
  ];
  constructor(
    private readonly sys0110Service: Sys0110Service,
    public readonly sys0710Service: Sys0710Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0710', '/SYS/sys0710cru', this.queryForm);
    this.sys0110Service.queryAllUsers().pipe(untilDestroyed(this)).subscribe(response => {
      if (response.Data) {
        this.userNoOptions = response.Data.map((user: IUserResponse) => {
          return {
            ...user,
            label: user.user_No + ' - ' + user.user_Name
          }
        });
      }
    })
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0710Service.querySys0710(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        if (response.Data) {
          this.data = response.Data
          this.lastQueryBody = frm.value;
          this.totalRecords = response.TotalCount || response.Data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        } else {
          this.data = [];
          this.totalRecords = 0;
        }
      });
    });
  }
}
