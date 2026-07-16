import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { KeyFilterPattern } from 'primeng/keyfilter';
import { finalize, map } from 'rxjs/operators';
import { FileExportService } from 'src/app/shared/service/file-export.service';
import {
  Fin34040Bucket,
  Fin34040DetailRequest,
  Fin34040DetailResponse,
  Fin34040DetailRow,
  Fin34040Request,
  Fin34040Response,
  Fin34040Service,
  Fin34040Summary,
  SortItem,
} from '../../../service/api/fin/fin34040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { DropdownRangeComponent } from '../../../shared/components/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { ColumnGroup } from '../../../others/component/table/table.model';

//1.3.5 帳齡分析表(FIN34040)
@Component({
  selector: 'app-fin34040',
  templateUrl: './fin34040.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    DropdownRangeComponent,
    InputTextComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    DialogComponent,
    ButtonModule,
  ],
})
export class FIN34040Component extends BasicQueryPageComponent<any> implements OnInit {
  private readonly fin34040Service = inject(Fin34040Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly fileExportService = inject(FileExportService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  /** Bucket Side 常數 */
  private readonly SIDE_EXPIRED = 'O';
  private readonly SIDE_UNEXPIRED = 'N';
  readonly defaultSort: SortItem[] = [{ field: 'VEN_No', order: 1 }];
  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  footerData: any;
  vendorOptions = this.dropDown.queryPos2013({ VEN_Flag: '1' });
  accNoOptions = this.dropDown.queryGls1005();
  columnGroup: ColumnGroup[] = [
    { field: 'Expired', header: '已到期' },
    { field: 'Unexpired', header: '未到期' },
  ];
  /** 欄位依查詢回傳的 Buckets 動態產生 */
  columns: ReportColumn[] = [];
  /** 儲存 Buckets 供明細查詢使用 */
  buckets: Fin34040Bucket[] = [];
  analysisDateTypeOptions = [
    { value: 'P', label: '預計收款日' },
    { value: 'A', label: '立帳日' },
  ];
  dueTypeOptions = [
    { value: '0', label: '已到期' },
    { value: 'N', label: '未到期' },
  ];
  showPercentOptions = [
    { value: true, label: '顯示' },
    { value: false, label: '不顯示' },
  ];
  /** 允許輸入類型: 正整數 */
  keyFilterInt: KeyFilterPattern = 'pint';
  queryForm = this.formBuilder.group({
    AnalysisDate: [null as Date | null, [Validators.required]],
    IntervalDays: [null as number | null, [Validators.required]],
    AnalysisPeriods: [null as number | null, [Validators.required]],
    AnalysisDateType: [null as string | null],
    VEN_No_From: [null as string | null],
    VEN_No_To: [null as string | null],
    ARS_Date_From: [null as Date | null],
    ARS_Date_To: [null as Date | null],
    PayDate: [null as Date | null, [Validators.required]],
    AccNo_From: [null as string | null],
    AccNo_To: [null as string | null],
    DueType: [null as string | null],
    ShowPercent: [true as boolean],
    pageSize: [10000],
    pageIndex: [1],
    SortBy: [[{ field: 'VEN_No', order: 1 }]],
  });
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;

  /* ----------------- 明細 Dialog 狀態 ----------------- */
  dialogVisible = false;
  dialogData: Fin34040DetailRow[] = [];
  dialogTotalRecords = 0;
  dialogLoading = false;
  /** Dialog Footer 資料（總計列） */
  dialogFooterData: Fin34040DetailRow | null = null;
  detailColumns: ReportColumn[] = [
    { field: 'ARS_No', header: '應收 ID', width: '120px' },
    { field: 'ORG_ID', header: '組織代號', width: '90px' },
    { field: 'Org_Name', header: '組織名稱', width: '140px' },
    { field: 'Sam_yyymm', header: '帳款年月', width: '90px' },
    { field: 'Sam_Termno', header: '帳款帳次', width: '70px' },
    { field: 'RCV_ARS_Amt', header: '應收金額', format: formatAmount, width: '80px' },
    { field: 'PTA_Amt', header: '沖帳金額', format: formatAmount, width: '80px' },
    { field: 'Pay_AMT', header: '應收帳款餘額', format: formatAmount, width: '80px' },
    { field: 'ARS_Date', header: '立帳日期', format: formatDate, width: '80px' },
    { field: 'PTA_Date', header: '預計收款日', format: formatDate, width: '80px' },
    { field: 'VEN_No', header: '廠客代號', width: '100px' },
    { field: 'VEN_Name', header: '廠客名稱', width: '170px' },
    { field: 'VEN_Uniform', header: '統一編號', width: '90px' },
    { field: 'AccNo', header: '會計科目代號', width: '60px' },
    { field: 'AccCName', header: '會計科目名稱', width: '140px' },
    { field: 'ARS_SourceNo', header: '帳款來源單號', width: '130px' },
    { field: 'VouNo', header: '傳票號碼', width: '130px' },
    { field: 'ARS_StatusName', header: '狀態', width: '80px' },
  ];

  public queryFIN34040ForReport = (body: any) =>
    this.fin34040Service.queryFIN34040(this.buildPayload(body ?? {})).pipe(
      map((res: ApiResponse<Fin34040Response>) => {
        const responseData = res?.Data;
        if (!responseData) {
          return { Data: [], TotalCount: 0 };
        }
        const rows = this.processResponseData(responseData);
        return {
          Data: rows,
          TotalCount: Number(res?.TotalCount ?? rows.length) || rows.length,
        };
      })
    );

  ngOnInit(): void {
    this.initializePage('FIN34040', '', this.queryForm, (form) => this.onSubmit(form));
  }

  private buildPayload(body: any): Fin34040Request {
    return {
      PageIndex: body.pageIndex ?? 1,
      PageSize: body.pageSize ?? 10000,
      SortBy: body.SortBy?.length ? body.SortBy : this.defaultSort,
      AnalysisDate: this.datePipe.transform(body.AnalysisDate, 'yyyy-MM-dd') ?? undefined,
      IntervalDays: body.IntervalDays ?? undefined,
      AnalysisPeriods: body.AnalysisPeriods ?? undefined,
      AnalysisDateType: body.AnalysisDateType || undefined,
      VEN_No_From: body.VEN_No_From || undefined,
      VEN_No_To: body.VEN_No_To || undefined,
      ARS_Date_From: this.datePipe.transform(body.ARS_Date_From, 'yyyy-MM-dd') ?? undefined,
      ARS_Date_To: this.datePipe.transform(body.ARS_Date_To, 'yyyy-MM-dd') ?? undefined,
      PayDate: this.datePipe.transform(body.PayDate, 'yyyy-MM-dd') ?? undefined,
      AccNo_From: body.AccNo_From || undefined,
      AccNo_To: body.AccNo_To || undefined,
      DueType: body.DueType || undefined,
      ShowPercent: body.ShowPercent ?? true,
    };
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.fin34040Service.queryFIN34040(this.buildPayload(raw)).pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe(response => {
        const responseData = response?.Data;
        if (!responseData) {
          this.data = [];
          this.footerData = null;
          this.totalRecords = 0;
          return;
        }
        this.data = this.processResponseData(responseData);
        this.totalRecords = Number(response?.TotalCount ?? this.data.length) || this.data.length;
        this.lastQueryBody = raw;
        this.queryStateService.setQueryState(this.ProgNo, raw);
      });
    })
  }

  downloadFIN34040Excel(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34040Service.exportFIN34040Excel(this.buildExportPayload());
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.xlsx', (isLoading) => this.btnExportExcelLoading = isLoading, `FIN34040_帳齡分析表`).subscribe();
  }

  downloadFIN34040PDF(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34040Service.exportFIN34040PDF(this.buildExportPayload());
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.pdf', (isLoading) => this.btnExportPdfLoading = isLoading, `FIN34040_帳齡分析表`).subscribe();
  }

  /** 匯出與查詢同條件，但不送分頁（此支後端沒幫忙移除分頁欄位） */
  private buildExportPayload(): Fin34040Request {
    const { PageIndex, PageSize, ...payload } = this.buildPayload(this.lastQueryBody);
    return payload;
  }

  /* ----------------- Bucket 資料轉換（依查詢回傳動態產生欄位） ----------------- */
  /** 處理 API 回應：儲存 Buckets、產生欄位、轉出表格列、設定 Footer */
  private processResponseData(responseData: Fin34040Response): any[] {
    this.buckets = responseData.Buckets || [];
    if (this.buckets.length > 0) {
      this.columns = this.generateColumnsFromBuckets(this.buckets);
    }
    const rows = this.transformSummariesToTableData(responseData.Summaries || [], this.buckets);
    this.footerData = this.transformToFooterData(responseData.Total, this.buckets);
    return rows;
  }

  /** 依 Side 分組 Buckets */
  private groupBucketsBySide(buckets: Fin34040Bucket[]): { expired: Fin34040Bucket[]; unexpired: Fin34040Bucket[] } {
    return {
      expired: buckets.filter(b => b.Side === this.SIDE_EXPIRED),
      unexpired: buckets.filter(b => b.Side === this.SIDE_UNEXPIRED),
    };
  }

  private getBucketFieldName(bucket: Fin34040Bucket): string {
    return bucket.Side === this.SIDE_EXPIRED ? `DueBucket_${bucket.BucketNo}` : `EndBucket_${bucket.BucketNo}`;
  }

  /** 根據 DaysFrom 和 DaysTo 產生天數區間標籤 */
  private getIntervalLabel(bucket: Fin34040Bucket): string {
    const from = bucket.DaysFrom ?? 0;
    const to = bucket.DaysTo;
    if (from === to) return `${from}天`;
    if (from === 0 && to != null) return `${to}天以內`;
    if (to == null) return `${from}天以上`;
    return `${from}~${to}天`;
  }

  /** 建立 Bucket 欄位（金額 > 0 時可點擊開啟明細） */
  private createBucketColumn(bucket: Fin34040Bucket, groupField: string, emptyDateLabel: string): ReportColumn {
    const dateFrom = bucket.DateFrom ? formatDate(bucket.DateFrom) : emptyDateLabel;
    const dateTo = bucket.DateTo ? formatDate(bucket.DateTo) : emptyDateLabel;
    const headerLines = [this.getIntervalLabel(bucket), dateFrom, dateTo].filter(line => line !== '');
    const fieldName = this.getBucketFieldName(bucket);
    return {
      field: fieldName,
      header: headerLines.join('\n'),
      format: formatAmount,
      groupField,
      type: 'link',
      width: '90px',
      linkDisabled: (rowData: any) => Number(rowData?.[fieldName] ?? 0) <= 0,
    };
  }

  private generateColumnsFromBuckets(buckets: Fin34040Bucket[]): ReportColumn[] {
    const columns: ReportColumn[] = [
      { field: 'VEN_No', header: '廠商代號', width: '100px' },
      { field: 'VEN_Name', header: '廠商名稱', width: '170px' },
    ];
    const { expired, unexpired } = this.groupBucketsBySide(buckets);
    // 已到期欄位依 BucketNo 由大到小排序
    expired
      .sort((a, b) => b.BucketNo - a.BucketNo)
      .forEach(bucket => columns.push(this.createBucketColumn(bucket, 'Expired', '以前')));
    unexpired.forEach(bucket => columns.push(this.createBucketColumn(bucket, 'Unexpired', '以後')));
    columns.push({ field: 'TotalAmt', header: '總計', format: formatAmount, isTotal: true, width: '90px' });
    return columns;
  }

  private populateBucketFields(row: any, buckets: Fin34040Bucket[], bucketData: Record<string, number>): void {
    buckets.forEach(bucket => {
      row[this.getBucketFieldName(bucket)] = bucketData?.[bucket.BucketName] ?? 0;
    });
  }

  private transformSummariesToTableData(summaries: Fin34040Summary[], buckets: Fin34040Bucket[]): any[] {
    const { expired, unexpired } = this.groupBucketsBySide(buckets);
    return summaries.map(summary => {
      const row: any = {
        VEN_No: summary.VEN_No,
        VEN_Name: summary.VEN_Name,
        TotalAmt: summary.TotalAmt,
      };
      this.populateBucketFields(row, expired, summary.DueBuckets || {});
      this.populateBucketFields(row, unexpired, summary.EndBuckets || {});
      return row;
    });
  }

  private transformToFooterData(total: any, buckets: Fin34040Bucket[]): any {
    if (!total || !total.TotalBuckets) return null;
    const footer: any = { VEN_No: '總計', VEN_Name: '', TotalAmt: total.TotalAmt || 0 };
    const bucketMap = new Map<string, Fin34040Bucket>();
    buckets.forEach(b => bucketMap.set(b.BucketName, b));
    buckets.forEach(bucket => {
      footer[this.getBucketFieldName(bucket)] = 0;
    });
    Object.keys(total.TotalBuckets).forEach(bucketName => {
      const bucket = bucketMap.get(bucketName);
      if (bucket) {
        footer[this.getBucketFieldName(bucket)] = total.TotalBuckets[bucketName] || 0;
      }
    });
    return footer;
  }

  /* ----------------- 明細 Dialog ----------------- */
  private findBucketByFieldName(fieldName: string): Fin34040Bucket | undefined {
    return this.buckets.find(bucket => this.getBucketFieldName(bucket) === fieldName);
  }

  private buildDetailPayload(venNo: string, bucket: Fin34040Bucket): Fin34040DetailRequest {
    const payload: Fin34040DetailRequest = {
      VenNo: venNo,
      BaseDate: this.datePipe.transform(this.queryForm.controls.PayDate.value, 'yyyy-MM-dd') || '',
    };
    if (bucket.DateFrom) payload.ARS_DateFrom = bucket.DateFrom;
    if (bucket.DateTo) payload.ARS_DateTo = bucket.DateTo;
    return payload;
  }

  onLinkClick(event: { rowData: any; field: string }): void {
    const { rowData, field } = event;
    const bucket = this.findBucketByFieldName(field);
    const venNo = rowData?.VEN_No;
    if (!bucket || !venNo) return;
    this.openDetail(venNo, bucket);
  }

  openDetail(venNo: string, bucket: Fin34040Bucket): void {
    this.dialogVisible = true;
    this.dialogLoading = true;
    this.dialogData = [];
    this.dialogFooterData = null;
    this.dialogTotalRecords = 0;
    this.fin34040Service
      .queryFIN34040Detail(this.buildDetailPayload(venNo, bucket))
      .pipe(finalize(() => this.dialogLoading = false), takeUntilDestroyed(this.destroyRef))
      .subscribe((res: ApiResponse<Fin34040DetailResponse>) => {
        const allDetails = res?.Data?.Details || [];
        // 最後一筆為總計列，分離出來放 footer
        const dataRows = allDetails.filter(row => !row.IsTotal);
        dataRows.forEach((row, idx) => {
          (row as any)._rowKey = idx + 1;
        });
        this.dialogData = dataRows;
        this.dialogFooterData = allDetails.find(row => row.IsTotal) ?? null;
        this.dialogTotalRecords = dataRows.length;
      });
  }

  onDialogClose(visible: boolean): void {
    this.dialogVisible = visible;
  }
}
