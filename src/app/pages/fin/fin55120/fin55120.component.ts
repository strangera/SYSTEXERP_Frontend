import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55120DetailItem, Fin55120Service, QueryFIN55120Request } from '@service/api/fin/fin55120.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { Fin55120TableReportComponent } from './fin55120-table-report/fin55120-table-report.component';
@Component({
  selector: 'app-fin55120',
  templateUrl: './fin55120.component.html',
  standalone: true,
  imports: [ButtonModule, Fin55120TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, RadiobuttonComponent, CheckboxModule, ButtonComponent, TranslateModule]
})
export class FIN55120Component extends BasicQueryPageComponent<FIN55120DetailItem> implements OnInit {
  queryForm = this.formBuilder.group({
    YM: [new Date(), [Validators.required]],
    Category: ['2', [Validators.required]],
    PrintSign: [true],
    ShowZero: [false],
  });
  CategoryOptions = [
    { label: '統制', value: '1' },
    { label: '明細', value: '2' },
    { label: '彙總', value: '3' },
  ];
  A_data: FIN55120DetailItem[] = [];
  L_data: FIN55120DetailItem[] = [];
  subData: FIN55120DetailItem[] = [];
  A_TotalData: FIN55120DetailItem | null = null;
  L_TotalData: FIN55120DetailItem | null = null;
  totalRecords = 0;
  lastQueryBody: QueryFIN55120Request | null = null;
  columns: ReportColumn[] = [
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱', align: 'left' },
    { field: 'Balance', header: '金額', isSubTotal: true, format: formatAmount, align: 'right' },
    { field: 'BalanceTotal', header: '合計', isSubTotal: true, format: formatAmount, align: 'right' },
    { field: 'Pct', header: '百分比', isSubTotal: true, format: formatPercent, align: 'right' },
  ];
  YM: Date | null = null;

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
        this.A_data = response.Data.QueryData.filter(x => x.groupName === 'A');
        this.L_data = response.Data.QueryData.filter(x => x.groupName !== 'A');
        this.subData = response.Data.SubTotalData;
        this.A_TotalData = response.Data.TotalData.filter(x => x.groupName === 'A')[0];
        this.L_TotalData = response.Data.TotalData.filter(x => x.groupName !== 'A')[0];
        this.totalRecords = response.TotalCount;
        this.YM = frm.value.YM;
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
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin55120Service.exportFIN55120Excel(this.lastQueryBody);
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
const formatPercent = (val: number | string | null | undefined): string => {
  // 1. 檢查空值
  if (val === null || val === undefined || val === '') {
    return '';
  }

  const num = Number(val);

  // 2. 檢查是否為有效數字
  if (isNaN(num)) {
    return String(val);
  }

  // 3. 格式化：保留小數兩位並加上 %
  // 使用 toFixed(2) 強制補齊兩位小數
  return `${num.toFixed(2)}%`;
};
