// !這邊我先做
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Sysbp00Request, Sysbp00Response, Sysbp00Service } from '@service/api/sys/sysbp00.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-sysbp00',
  templateUrl: './sysbp00.component.html',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, TranslateModule]
})
// 參數資料設定維護
export class SYSBP00Component extends BasicQueryPageComponent<Sysbp00Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SYS_Type: [null, [Validators.maxLength(40)]],
    SYS_Code: [null, [Validators.maxLength(50)]],
    SYS_Name: [null, [Validators.maxLength(50)]],
    ...createPaginationConfig([{ field: 'SYS_Sort', order: 1 }])
  });
  data: Sysbp00Response[] = [];
  selectedRows: Sysbp00Response[] = [];
  totalRecords = 0;
  lastQuery: Sysbp00Request | null = null;
  columns: ReportColumn[] = [
    { field: 'SYS_Type', header: '參數標題/參數說明' },
  ];
  subColumns: ReportColumn[] = [
    { field: 'SYS_Code', header: '參數代號' },
    { field: 'SYS_Name', header: '參數名稱' },
    { field: 'SYS_Sort', header: '排序' },
    { field: 'CRT_Date', header: '建立日期', format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人編號' },
    { field: 'CRT_USR_Name', header: '建立人姓名' },
    { field: 'UPD_Date', header: '更新日期', format: formatDateTime },
    { field: 'UPD_USR_No', header: '更新人編號' },
    { field: 'UPD_USR_Name', header: '更新人姓名' },
  ];

  constructor(
    public readonly sysbp00Service: Sysbp00Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBP00', '/sys/sysbp00cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sysbp00Service.querySYSBP00(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.lastQuery = frm.value;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    })
  }

  onDelete(data: Sysbp00Response[]) {
    // this.sysbp00Service.deleteSYSBP00(data).pipe(untilDestroyed(this)).subscribe(() => {
    //   this.onSubmit(this.queryForm);
    // });
  }
}
