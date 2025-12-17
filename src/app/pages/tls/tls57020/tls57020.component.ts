import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS57020Request, Tls57020Service, Tls57020TableReportData } from '@service/api/tls/tls57020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from './tls57020-table-report/tls57020-table-report.component';
import { formatAmount, formatDate, ReportColumn } from './tls57020-table-report/tls57020-table-report.model';

@Component({
  selector: 'app-tls57020',
  templateUrl: './tls57020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule,
    AsyncPipe,
    CalendarComponent,
    DatePipe
  ],
})
export class TLS57020Component extends BasicQueryPageComponent<Tls57020TableReportData> implements OnInit {
  queryForm = this.formBuilder.group({
    VEN_No: [null],
    ACP_YYYYMM: [new Date('2025-01-01'), [Validators.required]],
  });
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' })
  data: Tls57020TableReportData | null = null;
  historyRequestBody: TLS57020Request | null = null;
  columns: ReportColumn[] = [
    { field: 'TABTYPE', header: '單據種類' },
    { field: 'PUR_GUINo', header: '發票/收據號碼' },
    { field: 'PUR_GUIDate', header: '單據日期', format: formatDate },
    { field: 'PUR_TotAmt', header: '發票總額', format: formatAmount, align: 'right' },
    { field: 'PUR_TotNet', header: '未稅金額', format: formatAmount, align: 'right' },
    { field: 'PUR_TotTax', header: '稅額', format: formatAmount, align: 'right' },
  ];
  subColumns: ReportColumn[] = [
    { field: 'EVENT_TYPE', header: '單據別' },
    { field: 'EVENT_No', header: '單號' },
    { field: 'EVENT_DATE', header: '單據日期', format: formatDate },
    { field: 'EVENT_Net', header: '未稅金額', format: formatAmount, align: 'right' },
    { field: 'EVENT_Tax', header: '稅額', format: formatAmount, align: 'right' },
    { field: 'EVENT_Amt', header: '應稅金額', format: formatAmount, align: 'right' },
    { field: 'ADJ_Amt', header: '調整金額', format: formatAmount, align: 'right' },
  ];

  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly tls57020Service: Tls57020Service,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57020');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ACP_YYYYMM: this.datePipe.transform(frm.value.ACP_YYYYMM, 'yyyyMM')!,
        VEN_No: frm.value.VEN_No,
      };
      this.tls57020Service.queryTLS57020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.historyRequestBody = body;
      });
    });
  }
  btnLoading = false;
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57020Service.exportTLS57020PDF(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading);
  }
  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57020Service.exportTLS57020Excel(this.historyRequestBody);
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading
    );
  }
}
