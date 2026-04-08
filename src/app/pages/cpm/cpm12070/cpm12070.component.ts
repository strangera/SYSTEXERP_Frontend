import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12070Request, CPM12070Response, Cpm12070Service } from '@service/api/cpm/cpm12070.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
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
  imports: [ButtonModule, CalendarRangeQuickComponent, MultiSelectComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule]
})
export class CPM12070Component extends BasicQueryPageComponent<CPM12070Response> implements OnInit {
  queryForm = this.formBuilder.group({
    opinionCategory: [null], // 客戶意見類別
    receiveDateFrom: [null], // 接件日期
    receiveDateTo: [null], // 接件日期
  });
  data: CPM12070Response[] = [];
  totalRecords = 0;
  footerTotal?: { caseNumber: string, doneCase: string, processingCase: string } | null;
  lastQuery: CPM12070Request | null = null;
  columns: ReportColumn[] = [
    { field: 'opinionCode', header: '客戶意見類別代號', visible: true },
    { field: 'opinionName', header: '客戶意見類別名稱', visible: true },
    { field: 'caseNumber', header: '總件數', visible: true },
    { field: 'doneCase', header: '完成件數', visible: true },
    { field: 'processingCase', header: '待處理件數', visible: true },
  ];
  opinionOptions = [
    { value: 1, label: '意見反映' },
    { value: 2, label: '廣告業務' },
    { value: 3, label: '活動、場地洽談' },
    { value: 4, label: '承租店櫃' },
    { value: 5, label: '合作提案' },
  ];
  constructor(
    public readonly cpm12070Service: Cpm12070Service,
    private readonly fileExportService: FileExportService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM12070');
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.cpm12070Service.queryCPM12070(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.footerTotal = res.footerData;
        this.lastQuery = frm.getRawValue();
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    })
  }
  btnLoading = false;
  onExportPDF() {
    if (!this.lastQuery) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }

    const export$ = this.cpm12070Service.exportCPM12070PDF(this.lastQuery);

    // 呼叫 Service 執行匯出，並將直到銷毀的邏輯加入
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)), // 將 untilDestroyed 加入 Service 回傳的 Observable
      '.pdf',
      (isLoading) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }

  onExportXLSX() {
    if (!this.lastQuery) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }

    const export$ = this.cpm12070Service.exportCPM12070Excel(this.lastQuery);

    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)), // 將 untilDestroyed 加入 Service 回傳的 Observable
      '.xlsx',
      (isLoading) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }
}

