import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { formatDateTime } from '../../../others/component/table/table.model';
import { tblRole } from '../../../shared/models/sys/sysb000.model';

@Component({
  selector: 'app-sys0210',
  templateUrl: './sys0210.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
// 4-2-2-1角色基本資料維護
export class SYS0210Component extends BasicQueryPageComponent<tblRole>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.maxLength(10), this.validationService.alphanumericValidator]], // 角色代號
    Role_Name: ['', [Validators.maxLength(30)]], // 角色名稱
    Description: ['', [Validators.maxLength(50)]], // 角色註記
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'Role_No', order: 1 }]],
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: tblRole[] = [];
  lastQueryBody: any;
  columns: ReportColumn[] = [
    { field: 'Role_No', header: '角色代號', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true },
    { field: 'Description', header: '角色註記', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更員編號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: true },
  ];
  // 多選項目
  selectedItems: tblRole[] = [];

  constructor(
    public readonly sys0210Service: Sys0210Service,
    private readonly validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0210', 'SYS/SYS0210cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0210Service.queryRole(frm.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe((response) => {
          this.data = response.Data || [];
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = frm.value;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        })
    });
  }

  // 刪除項目
  onDelete(data: tblRole[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的角色基本資料?`,
      header: `確認刪除`,
      accept: () => {
        const idList = data.map(row => row.id).filter(id => id !== undefined && id !== null && typeof id === 'number');
        this.sys0210Service.deleteRole({ ids: idList }).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble(response.Message);
              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(response.Message);
            }
          },
        });
        this.selectedItems = [];
      },
    });
  }
}
