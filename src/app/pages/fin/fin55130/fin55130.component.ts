import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55130DetailItem, Fin55130Service, QueryFIN55130Request } from '@service/api/fin/fin55130.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { lastLastYearToday, lastYearToday } from '@shared/models/system/query-form.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { Fin55130TableReportComponent } from './fin55130-table-report/fin55130-table-report.component';
import { ColumnGroup, ReportColumn } from './fin55130-table-report/fin55130-table-report.model';
@Component({
  selector: 'app-fin55130',
  templateUrl: './fin55130.component.html',
  standalone: true,
  imports: [Fin55130TableReportComponent, ButtonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, RadiobuttonComponent, CheckboxModule, ButtonComponent, TranslateModule]
})
export class FIN55130Component extends BasicQueryPageComponent<FIN55130DetailItem> implements OnInit {
  queryForm = this.formBuilder.group({
    BaseYM: [lastYearToday, [Validators.required]],
    CompareYM: [lastLastYearToday, [Validators.required]],
    Category: ['2', [Validators.required]],
    PrintSign: [true],
    ShowZero: [false],
  });
  CategoryOptions = [
    { label: '統制', value: '1' },
    { label: '明細', value: '2' },
    { label: '彙總', value: '3' },
  ];
  A_data: FIN55130DetailItem[] = [];
  L_data: FIN55130DetailItem[] = [];
  subData: FIN55130DetailItem[] = [];
  A_TotalData: FIN55130DetailItem | null = null;
  L_TotalData: FIN55130DetailItem | null = null;
  totalRecords = 0;
  lastQueryBody: QueryFIN55130Request | null = null;
  columns: ReportColumn[] = [
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱', align: 'left' },
    { field: 'BaseAmt', header: '金額', isSubTotal: true, format: formatAmount, align: 'right', groupField: '基準年月' },
    { field: 'CompareAmt', header: '金額', isSubTotal: true, format: formatAmount, align: 'right', groupField: '比較年月' },
    { field: 'DiffAmt', header: '金額', isSubTotal: true, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'DiffPct', header: '百分比', isSubTotal: true, format: formatAmount, align: 'right', groupField: '差異' },
  ];
  columnGroup: ColumnGroup[] = [
    { field: '基準年月', header: 'YYYY年M月' },
    { field: '比較年月', header: 'YYYY年M月' },
    { field: '差異', header: '差異' },
  ]
  YM: Date | null = null;

  constructor(
    private readonly fileExportService: FileExportService,
    private readonly fin55130Service: Fin55130Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN55130');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 擷取當前表單選擇的日期物件（用於後續格式化標題）
      const baseDateObj = frm.get('BaseYM')?.value;
      const compareDateObj = frm.get('CompareYM')?.value;

      const body = {
        ...frm.value,
        BaseYM: this.datePipe.transform(baseDateObj, 'yyyyMM'),
        CompareYM: this.datePipe.transform(compareDateObj, 'yyyyMM'),
      };
      this.fin55130Service.queryFIN55130(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.columnGroup = [
          { field: '基準年月', header: this.datePipe.transform(baseDateObj, 'yyyy年M月') || '基準年月' },
          { field: '比較年月', header: this.datePipe.transform(compareDateObj, 'yyyy年M月') || '比較年月' },
          { field: '差異', header: '差異' },
        ];
        this.A_data = response.Data.QueryData.filter(x => x.groupNo === 'A');
        this.L_data = response.Data.QueryData.filter(x => x.groupNo !== 'A');
        this.subData = response.Data.SubTotalData;
        this.A_TotalData = response.Data.TotalData.find(x => x.groupNo === 'A') || null;
        this.L_TotalData = response.Data.TotalData.find(x => x.groupNo !== 'A') || null;
        this.totalRecords = response.TotalCount;
        this.YM = baseDateObj;
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
    const export$ = this.fin55130Service.exportFIN55130PDF(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin55130Service.exportFIN55130Excel(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
}

const formatAmount = (val: number | string | null | undefined): string => {
  // 1. 檢查是否為 null 或 undefined 或空字串
  if (val === null || val === undefined || val === '') {
    return '';
  }

  const num = Number(val);

  // 2. 檢查是否為 NaN
  if (isNaN(num)) {
    return String(val);
  }

  // 3. 判斷負數邏輯
  if (num < 0) {
    // Math.abs(num) 會把 -10234 變成 10234
    // 然後再進行千分位格式化，最後包上括號
    return `(${Math.abs(num).toLocaleString()})`;
  }

  // 4. 正數或 0 則直接進行本地化格式化
  return num.toLocaleString(); // eg. 1,000,000
};
