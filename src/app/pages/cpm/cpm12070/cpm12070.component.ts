import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12070Request, CPM12070Response, Cpm12070Service } from '@service/api/cpm/cpm12070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-cpm12070',
  templateUrl: './cpm12070.component.html',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, CalendarRangeQuickComponent, MultiSelectComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule],
  providers: [DatePipe]
})
export class CPM12070Component extends BasicQueryPageComponent<CPM12070Response> implements OnInit {
  queryForm = this.formBuilder.group({
    KIND_IDs: [null],    // 改為對應後端 SP 參數名
    DATE_FROM: [null],   // 改為對應後端 SP 參數名
    DATE_TO: [null],     // 改為對應後端 SP 參數名
  });

  data: CPM12070Response[] = [];
  totalRecords = 0;
  historyRequestBody: CPM12070Request | null = null;
  btnLoading = false;

  columns: ReportColumn[] = [
    { field: 'KIND_ID', header: '客戶意見類別代號' },
    { field: 'KIND_Name', header: '客戶意見類別名稱' },
    { field: 'TotalCount', header: '總件數', align: 'right', format: formatAmount },
    { field: 'DoneCount', header: '完成件數', align: 'right', format: formatAmount },
    { field: 'PendingCount', header: '待處理件數', align: 'right', format: formatAmount },
  ];

  // 這裡建議之後可以從下拉選單 API 取得，目前先放靜態或空陣列
  opinionOptions = this.dropDown.queryCss1002()

  constructor(
    public readonly cpm12070Service: Cpm12070Service,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe,
    private readonly dropDown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12070');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const requestBody: CPM12070Request = {
        KIND_IDs: Array.isArray(formValue.KIND_IDs) ? formValue.KIND_IDs.join(',') : formValue.KIND_IDs,
        DATE_FROM: this.datePipe.transform(formValue.DATE_FROM, 'yyyy-MM-dd') ?? undefined,
        DATE_TO: this.datePipe.transform(formValue.DATE_TO, 'yyyy-MM-dd') ?? undefined,
        PageIndex: 1,
        PageSize: 30,
        SortBy: [{ field: 'KIND_ID', order: 1 }]
      };

      this.cpm12070Service.queryCPM12070(requestBody).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = requestBody;
        this.queryStateService.setQueryState(this.ProgNo, formValue);
      });
    });
  }

  onExportPDF() {
    if (!this.historyRequestBody) return;
    const export$ = this.cpm12070Service.exportCPM12070PDF(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (loading) => this.btnLoading = loading).subscribe();
  }
}
