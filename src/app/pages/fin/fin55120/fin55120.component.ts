import { DatePipe } from '@angular/common';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin55120Service, QueryFIN55120Request, QueryFIN55120Response } from '@service/api/fin/fin55120.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
@Component({
  selector: 'app-fin55120',
  templateUrl: './fin55120.component.html',
  standalone: true,
  imports: [ButtonModule, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, RadiobuttonComponent, CheckboxModule, ButtonComponent, TranslateModule]
})
export class FIN55120Component extends BasicQueryPageComponent<QueryFIN55120Response> implements OnInit {
  queryForm = this.formBuilder.group({
    YM: [null],
    Category: [null],
    PrintSign: [1],
    ShowZero: [0],
  });
  CategoryOptions = [
    { label: '統制', value: '1' },
    { label: '明細', value: '2' },
    { label: '彙總', value: '3' },
  ];
  data: QueryFIN55120Response[] = [];
  // footerData?: QueryFIN55120Response;
  totalRecords = 0;
  lastQueryBody: QueryFIN55120Request | null = null;
  columns: ReportColumn[] = [
    // { field: 'ItemTitle', header: '項目名稱' },
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'Balance', header: '金額' },
    { field: 'Pct', header: '百分比' },
  ];

  constructor(
    public readonly fin55120Service: Fin55120Service,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN55120');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        YM: this.datePipe.transform(frm.value.YM, 'yyyyMM'),
      }
      this.fin55120Service.queryFIN55120(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        // this.footerData = response.footerData;
        this.totalRecords = response.TotalCount;
        this.lastQueryBody = body;
      });
    });
  }

  btnLoading = false;
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }

    const export$ = this.fin55120Service.exportFIN55120PDF(this.lastQueryBody);

    // 呼叫 Service 執行匯出，並將直到銷毀的邏輯加入
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)), // 將 untilDestroyed 加入 Service 回傳的 Observable
      '.pdf',
      (isLoading) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    );
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }

    const export$ = this.fin55120Service.exportFIN55120Excel(this.lastQueryBody);
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading
    );
  }
}
