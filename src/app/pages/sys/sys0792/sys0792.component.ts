import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryRequest, IQueryResponse, Sys0792Service } from '@service/api/sys/sys0792.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from "@shared/componentkit/input-text/input-text.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-sys0792',
  templateUrl: './sys0792.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    InputTextComponent
  ],
})
// 在線人員查詢作業
export class SYS0792Component extends BasicQueryPageComponent<IQueryResponse> implements OnInit {
  queryForm = this.formBuilder.group({
    user_No: ['', [Validators.maxLength(16)]], // 後端 varchar(16)
    user_Name: ['', [Validators.maxLength(20)]], // 後端 nvarchar(20)
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'Login_time', order: 2 }]],
  });

  totalRecords = 0;
  lastQueryBody: IQueryRequest | null = null;
  // 2. 修正資料型別
  data: IQueryResponse[] = [];

  // 3. 修正顯示欄位：改為在線人員相關資訊
  columns: ReportColumn[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
    { field: 'From_IP', header: '登入來源 IP', visible: true },
    { field: 'Login_time', header: '登入時間', visible: true, format: formatDateTime },
  ];

  addButtons: AddButton[] = [
    {
      label: '強制登出',
      icon: 'pi pi-sign-out',
      action: (rowData) => this.onKick(rowData),
    }
  ]

  constructor(
    public readonly sys0792Service: Sys0792Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0792');
  }

  // 4. 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true; // 啟動讀取狀態
      this.sys0792Service.querySYS0792(frm.value)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe((response) => {
          if (response.Data) {
            this.data = response.Data;
            // 優先使用後端回傳的總筆數
            this.totalRecords = response.TotalCount !== undefined ? response.TotalCount : response.Data.length;
            this.lastQueryBody = frm.value;
          } else {
            this.data = [];
            this.totalRecords = 0;
          }
        });
    });
  }

  // 執行強制登出
  onKick(rowData: IQueryResponse) {
    this.messageService.confirm({
      message: `確定要強制登出使用者 ${rowData.User_No} ${rowData.User_Name} 嗎？`,
      accept: () => {
        this.sys0792Service.kickUser(rowData.GUID).subscribe(res => {
          if (res.Data) {
            this.messageService.successBubble('強制登出成功');
            this.onSubmit(this.queryForm); // 重新整理清單
          }
        });
      }
    });
  }
}
