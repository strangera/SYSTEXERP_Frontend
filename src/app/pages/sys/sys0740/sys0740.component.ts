import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ProgNoDropdownResponse, QuerySYS0740Request, QuerySYS0740Response, Sys0740Service } from '@service/api/sys/sys0740.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-sys0740',
  templateUrl: './sys0740.component.html',
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
// 作業權限之角色列表
export class SYS0740Component extends BasicQueryPageComponent<QuerySYS0740Response> implements OnInit {
  // 查詢表單，包含作業代碼和分頁/排序參數
  queryForm = this.formBuilder.group({
    Prog_No: ['', [Validators.required, Validators.maxLength(10)]], // 作業代碼，必填且限制長度
    // 預設排序欄位為 Role_No，排序順序為 ASC (1)
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'Role_No', order: 1 }]],
  });

  totalRecords = 0;
  data: QuerySYS0740Response[] = [];
  lastQueryBody: QuerySYS0740Request | null = null;
  progNoOptions: ProgNoDropdownResponse[] = []; // 用於作業代碼下拉選單

  // 定義表格的欄位
  columns: ReportColumn[] = [
    { field: 'Role_No', header: '角色代號', visible: true, showSort: true },
    { field: 'Role_Name', header: '角色名稱', visible: true, showSort: true },
    { field: 'FunctionBehaviors', header: '角色權限之功能行為', visible: true, showSort: true },
  ];

  constructor(
    public readonly sys0740Service: Sys0740Service // 用於查詢角色權限和作業代碼下拉選單
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面
    this.initializePage('SYS0740', '/SYS/SYS0740cru', this.queryForm);

    // 取得作業代碼下拉選單資料
    this.sys0740Service.queryProgNoDropdown().pipe(untilDestroyed(this)).subscribe(response => {
      if (response.Data) {
        this.progNoOptions = response.Data.map((prog: ProgNoDropdownResponse) => {
          return {
            ...prog,
            label: `${prog.Prog_No} - ${prog.Prog_Name}` // 組合顯示文字
          };
        });
      }
    });
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 呼叫 sys0740Service 查詢方法
      this.sys0740Service.querySys0740(frm.value as QuerySYS0740Request)
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
