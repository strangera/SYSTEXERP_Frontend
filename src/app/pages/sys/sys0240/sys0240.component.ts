import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { tblRole } from '../../../shared/models/sys/sysb000.model';
@Component({
  selector: 'app-sys0240',
  templateUrl: './sys0240.component.html',
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

export class SYS0240Component extends BasicQueryPageComponent<tblRole>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.maxLength(10)]], // 角色代號
    Role_Name: ['', [Validators.maxLength(30)]], // 角色名稱
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'Role_No', order: 1 }]],
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: tblRole[] = [];
  columns: ReportColumn[] = [
    { field: 'Role_No', header: '角色代號', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true },
    { field: 'Description', header: '角色註記', visible: true },
  ];
  lastQueryBody: any;
  // 多選項目
  selectedItems: tblRole[] = [];

  // 選項
  roleCodeOptions: any[] = [];

  constructor(
    public readonly sys0210Service: Sys0210Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0240', 'SYS/SYS0240cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0210Service.queryRole(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        if (response.Data) {
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = frm.value;
        } else {
          this.data = [];
          this.totalRecords = 0;
        }
      });
    });
  }

  // 刪除項目
  onDelete(data: tblRole | tblRole[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集所有有效的 ID
    const idList = items
      .filter((item) => item && item.id != null && item.id !== undefined)
      .map((item) => item.id);

    const deleteBody = {
      ids: idList, // 符合 API 的 idList 格式
    };

    console.log('Delete body:', JSON.stringify(deleteBody, null, 2));
    // this.sys0210Service.deleteRole(deleteBody).pipe(untilDestroyed(this)).subscribe({
    //   next: (response) => {
    //     if (response.Status === '0000') {
    //       this.messageService.successBubble('選中項目刪除成功');
    //     } else {
    //       console.error('API error:', response.Status, response.Message);
    //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
    //     }
    //   },
    //   error: (err: string) => {
    //     console.error('API error:', err);
    //     this.messageService.errorBubble('刪除失敗');
    //   },
    //   complete: () => {
    //     this.onSubmit(this.queryForm);
    //   },
    // });

    this.selectedItems = [];
  }
}
