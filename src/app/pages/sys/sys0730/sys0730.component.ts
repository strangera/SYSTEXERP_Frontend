import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Sys0210Service } from '@service/api/sys/sys0210.service'; // 用於查詢角色下拉選單
import { QuerySYS0730Request, QuerySYS0730Response, Sys0730Service } from '@service/api/sys/sys0730.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
// 假設 Role 模型是這樣定義的 (來自 sys0210.service 或 shared/models/sys/role.model)
export interface Role {
  Role_No: string;
  Role_Name: string;
  label?: string; // 為下拉選單添加的顯示屬性
  // ... 其他角色屬性
}

@Component({
  selector: 'app-sys0730',
  templateUrl: './sys0730.component.html',
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
// 角色系統權限列表
export class SYS0730Component extends BasicQueryPageComponent<QuerySYS0730Response> implements OnInit {
  // 查詢表單，將 user_No 替換為 Role_No
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.required, Validators.maxLength(10)]], // 角色代號，必填且限制長度
    // 預設排序欄位改為後端回傳的 Prog_No (作業代碼)，排序順序為 ASC (1)
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'Prog_No', order: 1 }]],
  });

  totalRecords = 0;
  data: QuerySYS0730Response[] = [];
  roleCodeOptions: Role[] = []; // 用於角色代號下拉選單
  lastQueryBody: any;
  // 定義表格的欄位
  columns: ReportColumn[] = [
    { field: 'Role_No', header: '角色代號', visible: true, showSort: true },
    { field: 'Role_Name', header: '角色名稱', visible: true, showSort: false },
    { field: 'MainSystemCode', header: '主系統代碼', visible: true, showSort: true },
    { field: 'MainSystemName', header: '主系統名稱', visible: true, showSort: true },
    { field: 'SubsystemCode', header: '子系統代碼', visible: true, showSort: true },
    { field: 'SubsystemName', header: '子系統名稱', visible: true, showSort: true },
    { field: 'Prog_No', header: '作業代碼', visible: true, showSort: true },
    { field: 'Prog_Name', header: '作業名稱', visible: true, showSort: true },
    { field: 'FunctionButtons', header: '具有權限之功能按鍵', visible: true, showSort: false }, // 功能按鍵通常不排序
  ];

  constructor(
    private readonly sys0210Service: Sys0210Service, // 用於取得角色列表
    public readonly sys0730Service: Sys0730Service // 用於查詢角色權限
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面，注意這裡的程式代號是 'SYS0730'
    this.initializePage('SYS0730', '/SYS/SYS0730cru', this.queryForm);

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
      // 呼叫新的 sys0730Service 查詢方法
      this.sys0730Service.querySys0730(frm.value as QuerySYS0730Request)
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
