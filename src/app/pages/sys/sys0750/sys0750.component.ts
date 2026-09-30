import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Sys0210Service } from '@service/api/sys/sys0210.service'; // 用於查詢角色下拉選單
import { QuerySYS0750Request, QuerySYS0750Response, Sys0750Service } from '@service/api/sys/sys0750.service';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatDate, formatDateTime } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

// 假設 Role 模型是這樣定義的 (來自 sys0210.service 或 shared/models/sys/role.model)
export interface Role {
  Role_No: string;
  Role_Name: string;
  label?: string; // 為下拉選單添加的顯示屬性
  // ... 其他角色屬性
}

@Component({
  selector: 'app-sys0750',
  templateUrl: './sys0750.component.html',
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
// 角色使用者權限列表
export class SYS0750Component extends BasicQueryPageComponent<QuerySYS0750Response> implements OnInit {
  // 查詢表單，包含角色代號和分頁/排序參數
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.required, Validators.maxLength(10)]], // 角色代號，必填且限制長度
    // 預設排序欄位為 User_No，排序順序為 ASC (1)
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'User_No', order: 1 }]],
  });

  totalRecords = 0;
  data: QuerySYS0750Response[] = [];
  lastQueryBody: QuerySYS0750Request | null = null;
  roleCodeOptions: Role[] = []; // 用於角色代號下拉選單


  columns: ReportColumn[] = [
    { field: 'User_Type', header: '使用者型態', visible: true, format: (value) => value === '1' ? '公司內部人員' : value === '2' ? '專櫃人員' : '其他', exportFormat: [{ '1': '公司內部人員' }, { '2': '專櫃人員' }, { '3': '其他' }] },
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
    { field: 'Str_Date', header: '有效起始日期', visible: false, format: formatDate },
    { field: 'End_Date', header: '有效截止日期', visible: false, format: formatDate },
    { field: 'Status', header: '使用者狀態', visible: true, format: (value) => value === '1' ? '有效' : '停用', exportFormat: [{ '1': '有效' }, { '2': '停用' }] },
    { field: 'Title', header: '職稱代碼', visible: true, format: (value) => SystemOptionsService.getOptions('T103').find((option) => option.SYS_Code === value)?.SYS_Name || value },
    { field: 'Org_ID', header: '組織代碼', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
    { field: 'User_Email', header: '使用者Email', visible: false },
    { field: 'TLT_No', header: '所屬專櫃編號', visible: false },
    { field: 'Remarks', header: '備註', visible: false },
    { field: 'User_Priority', header: '使用者等級', visible: false },
    { field: 'USER_PwdExpireDate', header: '密碼到期日', visible: false, format: formatDateTime },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];

  constructor(
    private readonly sys0210Service: Sys0210Service, // 用於取得角色列表
    public readonly sys0750Service: Sys0750Service // 用於查詢使用者角色權限
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面
    this.initializePage('SYS0750', '/SYS/SYS0750cru', this.queryForm);

    // 取得角色下拉選單資料
    this.sys0210Service.queryAllRole().pipe(untilDestroyed(this)).subscribe(response => {
      if (response.Data) {
        this.roleCodeOptions = response.Data.map((role: Role) => {
          return {
            ...role,
            label: `${role.Role_No} - ${role.Role_Name}` // 組合顯示文字
          };
        });
      }
    });
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 呼叫 sys0750Service 查詢方法
      this.sys0750Service.querySys0750(frm.value as QuerySYS0750Request)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe((response) => {
          if (response.Data) {
            this.data = response.Data;
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
