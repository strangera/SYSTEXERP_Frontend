import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { Fin29110DetailRequest, Fin29110DetailRow, Fin29110Request, Fin29110Row, Fin29110Service } from '../../../service/api/fin/fin29110.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-fin29110',
  templateUrl: './fin29110.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    RadiobuttonComponent,
    DialogComponent,
    TableReportComponent,
    InputNumberComponent,
    DropdownRangeComponent,
    AsyncPipe,
  ],
})
export class FIN29110Component extends BasicQueryPageComponent<Fin29110Row> implements OnInit {
  queryForm = this.formBuilder.group({
    AnalysisDate: [new Date() as Date | null, [Validators.required]],// 分析日期（必填）
    BucketDays: [99, [Validators.required, Validators.min(1), Validators.max(99)]],// 分析區間/期數
    Periods: [10, [Validators.required, Validators.min(1), Validators.max(10)]],// 分析區間/期數
    DateType: ['E' as string, [Validators.required]],// 分析日期別（立帳日 / 預計付款日）
    VEN_No_From: [null as string | null],// 廠商編號 起迄
    VEN_No_To: [null as string | null],
    RefDateFrom: [null as Date | null],// 立帳/預計付款 日期區間
    RefDateTo: [null as Date | null],
    PayDate: [new Date() as Date | null, [Validators.required]],// 付款日期（必填）
    DueFlag: ['A' as string, [Validators.required]],// 已到期/未到期/全部
  });
  VendorNoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  dateTypeOptions = [
    { value: 'E', label: '立帳日' },
    { value: 'P', label: '預計付款日' },
  ];
  // A=全部, O=已到期, N=未到期
  dueFlagOptions = [
    { value: 'A', label: '全部' },
    { value: 'O', label: '已到期' },
    { value: 'N', label: '未到期' },
  ];
  /* ----------------- 主表狀態 ----------------- */
  data: Fin29110Row[] = [];
  lastQueryBody: Fin29110Request | null = null;
  totalRecords = 0;
  selectedItems: Fin29110Row[] = [];
  footerData: Fin29110Row | null = null;
  /* ----------------- 明細 Dialog 狀態 ----------------- */
  dialogVisible = false;
  dialogData: Fin29110DetailRow[] = [];
  dialogTotalRecords = 0;
  dialogFooterData: Fin29110DetailRow | null = null;
  dialogLoading = false;
  // 主表欄位預設值
  columns: ReportColumn[] = [
    { field: 'VendorNo', header: '廠商編號' },
    { field: 'VendorName', header: '廠商名稱' },

    // 以下為佔位用的通用字眼，查詢後會被正確的日期區間取代
    { field: 'Overdue_Placeholder', header: '已到期帳款', format: formatAmount, groupField: '已到期' },
    { field: 'NotDue_Placeholder', header: '未到期帳款', format: formatAmount, groupField: '未到期' },

    { field: 'SumAmount', header: '總計', format: formatAmount },
  ];

  columnGroup: ColumnGroup[] = [
    { field: '已到期', header: '已到期' },
    { field: '未到期', header: '未到期' },
  ]

  // 明細欄位（Dialog 內 table）
  detailColumns: ReportColumn[] = [
    { field: 'ACP_No', header: '應付ID' },
    { field: 'STO_No', header: '組織代號' },
    { field: 'ACP_YYYYMM', header: '帳款年月' },
    { field: 'ACP_TermNo', header: '帳款帳次' },
    { field: 'ACP_Amt', header: '應付金額', format: formatAmount },
    { field: 'PTA_Amt', header: '沖帳金額', format: formatAmount },
    { field: 'ACP_BalanceAmt', header: '應付帳款餘額', format: formatAmount },
    { field: 'ACP_Date', header: '立帳日期', format: formatDate },
    { field: 'ACP_ExpectPayDate', header: '預計付款日', format: formatDate },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'VEN_Uniform', header: '統一編號' },
    { field: 'AccNo', header: '會計科目代號' },
    { field: 'ACP_SourceNo', header: '帳款來源單號' },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'Status', header: '狀態' },
    { field: 'AgeDays', header: '帳齡天數' },
  ];
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;

  constructor(
    private readonly fin29110Service: Fin29110Service,
    private readonly datePipe: DatePipe,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN29110');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const analysisDate = raw.AnalysisDate as Date;

      // 建立 Request Body
      const body: Fin29110Request = {
        AnalysisDate: this.datePipe.transform(analysisDate, 'yyyy-MM-dd') || undefined,
        BucketDays: raw.BucketDays,
        Periods: raw.Periods,
        DateType: raw.DateType,
        PayDate: this.datePipe.transform(raw.PayDate, 'yyyy-MM-dd') || undefined,
        DueFlag: raw.DueFlag,
        RefDateFrom: this.datePipe.transform(raw.RefDateFrom, 'yyyy-MM-dd') || undefined,
        RefDateTo: this.datePipe.transform(raw.RefDateTo, 'yyyy-MM-dd') || undefined,
        VEN_No_From: raw.VEN_No_From,
        VEN_No_To: raw.VEN_No_To,
      };

      this.fin29110Service.queryFIN29110(body).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        this.lastQueryBody = body; // 儲存查詢條件供匯出使用

        // *** 關鍵調整：根據當前查詢參數動態產生欄位 ***
        this.columns = this.generateColumns(analysisDate, raw.BucketDays, raw.Periods);

        this.data = response.Data;
        this.totalRecords = response.TotalCount || 0;
      });
    });
  }
  openDetail(row: Fin29110Row, col?: ReportColumn): void {
    const field = col?.field || '';
    const side = field.startsWith('Overdue') ? 'O' : 'N';
    const match = field.match(/_(?<n>\d+)_/);
    const bucketN = match ? parseInt(match.groups?.['n'] || '1') - 1 : 0;

    const body: Fin29110DetailRequest = {
      AnalysisDate: this.datePipe.transform(this.queryForm.controls.AnalysisDate.value, 'yyyy-MM-dd') || '',
      BucketDays: this.queryForm.controls.BucketDays.value || 0,
      DateType: this.queryForm.controls.DateType.value || 'E',
      PayDate: this.datePipe.transform(this.queryForm.controls.PayDate.value, 'yyyy-MM-dd') || '',
      Side: side,
      BucketN: bucketN,
      VEN_No: row.VendorNo || '',
    };
    this.fin29110Service.queryFIN29110Detail(body).pipe(untilDestroyed(this), finalize(() => (this.dialogLoading = false))).subscribe(res => {
      this.dialogData = res.Data;
      const realTotal = res.TotalCount || 0;
      this.dialogTotalRecords = realTotal;
      this.dialogVisible = true;
    })
  }
  /* ----------------- 匯出：Excel ----------------- */
  downloadFIN29110Excel(): void {
    this.fin29110Service.exportReport(this.lastQueryBody, 'Excel', (loading) => this.btnExportExcelLoading = loading);
  }
  /* ----------------- 匯出：PDF ----------------- */
  downloadFIN29110PDF(): void {
    this.fin29110Service.exportReport(this.lastQueryBody, 'PDF', (loading) => this.btnExportPdfLoading = loading);
  }
  // 輔助方法：計算日期偏移並格式化 (用於 Header 顯示)
  private getRelativeDate(baseDate: Date, days: number): string {
    const target = new Date(baseDate);
    target.setDate(target.getDate() + days);
    return this.datePipe.transform(target, 'yyyy/MM/dd') || '';
  }

  // 動態產生欄位設定
  private generateColumns(analysisDate: Date, bucketDays: number, periods: number): ReportColumn[] {
    const cols: ReportColumn[] = [
      { field: 'VendorNo', header: '廠商編號' },
      { field: 'VendorName', header: '廠商名稱' },
    ];

    // --- 1. 已到期 (Overdue) ---
    for (let i = periods; i >= 1; i--) {
      let field = '';
      let header = '';
      if (i === periods) {
        const fromDays = (periods - 1) * bucketDays + 1;
        field = `Overdue_${periods}_Over_Days`;
        // 使用 \n 進行強制換行
        header = `${fromDays}天以上\n${this.getRelativeDate(analysisDate, -fromDays)}\n以前`;
      } else {
        const from = (i - 1) * bucketDays + 1;
        const to = i * bucketDays;
        field = `Overdue_${i}_${from}_${to}_Days`;
        header = `${from}~${to}天\n${this.getRelativeDate(analysisDate, -to)}\n${this.getRelativeDate(analysisDate, -from)}`;
      }
      cols.push({ field, header, format: formatAmount, groupField: '已到期' });
    }

    // --- 2. 未到期 (NotDue) ---
    for (let i = 1; i <= periods; i++) {
      let field = '';
      let header = '';
      if (i === periods) {
        const fromDays = (periods - 1) * bucketDays + 1;
        field = `NotDue_${periods}_Over_Days`;
        header = `${fromDays}天以上\n${this.getRelativeDate(analysisDate, fromDays)}\n以後`;
      } else {
        const from = (i - 1) * bucketDays + 1;
        const to = i * bucketDays;
        field = `NotDue_${i}_${from}_${to}_Days`;
        header = `${from}~${to}天\n${this.getRelativeDate(analysisDate, from)}\n${this.getRelativeDate(analysisDate, to)}`;
      }
      cols.push({ field, header, format: formatAmount, groupField: '未到期' });
    }

    cols.push({ field: 'SumAmount', header: '總計', format: formatAmount });
    return cols;
  }
}
