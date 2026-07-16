import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { formatDateTime } from '../../../others/component/table/table.model';
import { UserData } from '../../../shared/models/sys/user.model';

@Component({
  selector: 'app-sys0320',
  templateUrl: './sys0320.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
// 4.2.3.2 使用者系統權限設定
export class SYS0320Component extends BasicQueryPageComponent<UserData> implements OnInit {
  queryForm = this.formBuilder.group({
    user_No: ['', [Validators.maxLength(10)]], // 使用者編號
    user_Name: ['', [Validators.maxLength(30)]], // 使用者名稱
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'user_No', order: 1 }]],
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  lastQueryBody: any
  data: UserData[] = [];
  columns: ReportColumn[] = [
    { field: 'user_No', header: '使用者編號', visible: true },
    { field: 'user_Name', header: '使用者名稱', visible: true },
    { field: 'status', header: '使用者狀態', visible: true, format: (value: string) => value === '1' ? '有效' : value === '2' ? '停用' : value },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];
  constructor(
    public readonly sys0110Service: Sys0110Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0320', '/SYS/SYS0320cru', this.queryForm, (form) => this.onSubmit(form));
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0110Service.queryUser(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        if (response.Data) {
          this.data = response.Data
          this.totalRecords = response.TotalCount || response.Data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.lastQueryBody = frm.value;
        } else {
          this.data = [];
          this.totalRecords = 0;
        }
      });
    });
  }

  // 查詢邏輯
  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }
}
