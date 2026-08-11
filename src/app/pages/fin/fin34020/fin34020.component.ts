import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs/operators';
import { FileExportService } from 'src/app/shared/service/file-export.service';
import { ApiResponse, Fin34020Service, QueryFIN34020Request, QueryFIN34020Row, SortItem } from '../../../service/api/fin/fin34020.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-fin34020',
  templateUrl: './fin34020.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownRangeComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule,
  ],
})
export class FIN34020Component extends BasicQueryPageComponent<any> implements OnInit {
  private readonly fin34020Service = inject(Fin34020Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly fileExportService = inject(FileExportService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  data: QueryFIN34020Row[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  footerData: any;
  /** 原本固定 2 行(立帳 1 行 + 沖銷 1 行)時的單行高度，動態列高以此為基準換算 */
  private readonly baseLineHeight = 24.44 / 2;
  /** 虛擬滾動要求固定列高，依當頁資料實際的最大沖銷筆數動態撐大/縮小 */
  ItemSize = 24.44;
  venNoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' });
  accNoOptions = this.dropDown.queryGls1005();
  readonly defaultSort: SortItem[] = [
    { field: 'VEN_No', order: 1 },
    { field: 'ARS_Date', order: 1 },
    { field: 'ARS_No', order: 1 },
  ];
  columns: ReportColumn[] = [
    { field: 'VEN_No', header: '廠客代號', width: '90px' },
    { field: 'VEN_Name', header: '客戶名稱', width: '170px', align: 'left' },
    { field: 'PayType', header: '收/付', width: '50px' },
    { field: 'ARS_No', header: '應收帳款單號', width: '120px' },
    { field: 'AccNo', header: '科目代號', width: '120px' },
    { field: 'AccCName', header: '科目名稱', width: '120px', align: 'left' },
    { field: 'ARS_Date', header: '立帳日期', format: formatDate, width: '80px' },
    { field: 'PTA_Date', header: '預計收款日', format: formatDate, width: '80px' },
    { field: 'ARS_Amt', header: '立帳金額', format: formatAmount, width: '80px', align: 'right' },
    // NoteDesc 摘要為自由文字備註，長度不固定，維持自動換行不設寬
    { field: 'NoteDesc', header: '摘要', align: 'left', width: '200px' },
    { field: 'RefNo', header: '收/電/開/調整 單號', width: '150px' },
    { field: 'RCV_Date', header: '收款日期', format: formatDate, width: '80px' },
    { field: 'VouNo', header: '傳票號碼', width: '100px' }, // 多筆以 | 分隔，逐行顯示
    { field: 'RcvOrAdjAmt', header: '收款 / 調整金額', format: formatAmount, width: '120px', align: 'right' }, // 多筆以 | 分隔，逐行顯示
    { field: 'UnpaidBalanceAmt', header: '未沖餘額', format: formatAmount, width: '120px', align: 'right' }, //（立帳金額 - 調整/收款金額
  ];
  showFlagOptions = [{ value: '1', label: '顯示' }, { value: '0', label: '不顯示' },];
  moneyTypeOptions = [0, 11, 15, 30, 45].map(v => ({ value: v, label: String(v) }));
  queryForm = this.formBuilder.group({
    VEN_No_From: [null as string | null],
    VEN_No_To: [null as string | null],
    ARS_Date_From: [null as Date | null],
    ARS_Date_To: [null as Date | null],
    RCV_Date_From: [null as Date | null],
    RCV_Date_To: [null as Date | null],
    ADJ_Date_From: [null as Date | null],
    ADJ_Date_To: [null as Date | null],
    // AccNoList: [[] as string[]], // AccNo 改為區間查詢，多選保留不使用
    AccNo_Start: [null as string | null],
    AccNo_End: [null as string | null],
    MoneyTypeList: [[] as number[]],
    ShowARSAmount: ['1' as string],
    ShowZeroBalance: ['1' as string],
    pageSize: [10000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'VEN_No', order: 1 }, { field: 'ARS_Date', order: 1 }, { field: 'ARS_No', order: 1 },]],
  });
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;
  public queryFIN34020ForReport = (body: any) =>
    this.fin34020Service.queryFIN34020(this.buildPayload(body ?? {})).pipe(
      map((res: ApiResponse<any>) => {
        const dataAny = res?.Data;
        const rows = dataAny?.QueryData ?? [];
        this.setFooter(dataAny?.TotalSummary);
        this.updateItemSize(rows);
        return {
          Data: rows,
          TotalCount: res?.TotalCount ?? 0,
          GrandTotal: dataAny?.TotalSummary,
        };
      })
    );
  ngOnInit(): void {
    this.initializePage('FIN34020', 'fin/fin34020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  private buildPayload(body: any): QueryFIN34020Request {
    return {
      PageIndex: body.pageIndex ?? 1,
      PageSize: body.pageSize ?? 30,
      SortBy: body.SortBy?.length ? body.SortBy : this.defaultSort,
      VEN_No_From: body.VEN_No_From?.trim() || undefined,
      VEN_No_To: body.VEN_No_To?.trim() || undefined,
      ARS_Date_From: this.datePipe.transform(body.ARS_Date_From, 'yyyy-MM-dd') ?? undefined,
      ARS_Date_To: this.datePipe.transform(body.ARS_Date_To, 'yyyy-MM-dd') ?? undefined,
      RCV_Date_From: this.datePipe.transform(body.RCV_Date_From, 'yyyy-MM-dd') ?? undefined,
      RCV_Date_To: this.datePipe.transform(body.RCV_Date_To, 'yyyy-MM-dd') ?? undefined,
      ADJ_Date_From: this.datePipe.transform(body.ADJ_Date_From, 'yyyy-MM-dd') ?? undefined,
      ADJ_Date_To: this.datePipe.transform(body.ADJ_Date_To, 'yyyy-MM-dd') ?? undefined,
      // AccNoList: body.AccNoList?.length ? body.AccNoList.join(',') : undefined,
      AccNo_Start: body.AccNo_Start?.trim() || undefined,
      AccNo_End: body.AccNo_End?.trim() || undefined,
      MoneyTypeList: body.MoneyTypeList?.length ? body.MoneyTypeList.join(',') : undefined,
      ShowARSAmount: body.ShowARSAmount ?? undefined,
      ShowZeroBalance: body.ShowZeroBalance ?? undefined,
    };
  }
  /** 依 | 拆分多筆資料，index 0 為應收/付本身那一行的值（可能是空字串），不可過濾空字串，否則會跟其他欄位的 index 對不齊 */
  splitMultiValue(value?: string | null): string[] {
    return (value ?? '').split('|');
  }
  /** 該筆總行數（應收/付本身 1 行 + 沖銷明細），以 RefNo/RCV_Date/VouNo/RcvOrAdjAmt 中拆分出最多筆數者為準，防止個別欄位筆數不齊 */
  private getTotalLineCount(rowData: QueryFIN34020Row): number {
    return Math.max(
      this.splitMultiValue(rowData?.RefNo).length,
      this.splitMultiValue(rowData?.RCV_Date).length,
      this.splitMultiValue(rowData?.VouNo).length,
      this.splitMultiValue(rowData?.RcvOrAdjAmt).length,
    );
  }
  /** 該筆立帳實際被拆成的沖銷筆數，該筆總行數 = 此值 + 1（應收/付本身佔第 1 行） */
  getExtraLineCount(rowData: QueryFIN34020Row): number {
    return this.getTotalLineCount(rowData) - 1;
  }
  /** multiLineTemplate 用：取某欄位逐行的值，筆數不足時補空字串，確保跟其他欄位行數一致 */
  getColumnLines(rowData: QueryFIN34020Row, field: string): string[] {
    const values = this.splitMultiValue((rowData as Record<string, unknown>)?.[field] as string | null);
    const totalLines = this.getTotalLineCount(rowData);
    while (values.length < totalLines) values.push('');
    return values;
  }
  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
  private updateItemSize(rows: QueryFIN34020Row[]): void {
    const maxExtraLines = rows.reduce((max, row) => Math.max(max, this.getExtraLineCount(row)), 0);
    this.ItemSize = this.baseLineHeight * (maxExtraLines + 1);
  }
  private setFooter(summary: any): void {
    this.footerData = {
      ARS_Amt: summary?.Total_ARS_Amt ?? 0,
      RcvOrAdjAmt: summary?.Total_RcvOrAdjAmt ?? 0,
      UnpaidBalanceAmt: summary?.Total_UnpaidBalanceAmt ?? 0,
    };
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      frm.patchValue({ pageIndex: 1 });
      const raw = frm.getRawValue();
      this.fin34020Service.queryFIN34020(this.buildPayload(raw)).pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe(response => {
        const dataAny = response?.Data as any;
        this.data = dataAny?.QueryData ?? [];
        this.setFooter(dataAny?.TotalSummary);
        this.updateItemSize(this.data);
        this.totalRecords = response?.TotalCount ?? this.data.length;
        this.lastQueryBody = raw;
        this.queryStateService.setQueryState(this.ProgNo, raw);
      });
    })
  }
  downloadFIN34020Excel(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34020Service.exportFIN34020Excel(this.buildPayload(this.lastQueryBody));
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.xlsx', (isLoading) => this.btnExportExcelLoading = isLoading, `FIN34020_客戶收款明細表`).subscribe();
  }

  downloadFIN34020PDF(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34020Service.exportFIN34020PDF(this.buildPayload(this.lastQueryBody));
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.pdf', (isLoading) => this.btnExportPdfLoading = isLoading, `FIN34020_客戶收款明細表`).subscribe();
  }
}
