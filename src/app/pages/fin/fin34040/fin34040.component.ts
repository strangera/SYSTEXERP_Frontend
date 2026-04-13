/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { KeyFilterPattern } from 'primeng/keyfilter';
import { filter, map } from 'rxjs/operators';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownRangeComponent } from '../../../shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount, formatDate } from '../../../shared/componentkit/table-report/table-report.model';
import { ColumnGroup, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// Service & 型別
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
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
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-fin34040',
  templateUrl: './fin34040.component.html',
  styleUrl: './fin34040.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    CalendarComponent,
    DropdownComponent,
    DropdownRangeComponent,
    InputTextComponent,
    RadiobuttonComponent,
    TableReportComponent,
    DialogComponent,
  ],
})
export class FIN34040Component extends BasicQueryPageComponent<any> implements OnInit {
  /* ----------------- 常數定義 ----------------- */
  /** 預設排序 */
  readonly defaultSort: SortItem[] = [{ field: 'VEN_No', order: 1 }];

  /** Bucket Side 常數 */
  private readonly SIDE_EXPIRED = 'O';
  private readonly SIDE_UNEXPIRED = 'N';

  /* ----------------- 狀態 ----------------- */
  data: any[] = [];
  footerData: any = null;
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: any[] = [];
  lastQueryBody: any = null;
  tableVer = 0;

  /** 欄位定義（依後端回傳調整） */
  columnGroup: ColumnGroup[] = [
    { field: 'Expired', header: '已到期' },
    { field: 'Unexpired', header: '未到期' },
  ]
  columns: ReportColumn[] = [];

  /** 儲存 Buckets 供明細查詢使用 */
  buckets: Fin34040Bucket[] = [];

  /* ----------------- 明細 Dialog 狀態 ----------------- */
  /** Dialog 顯示狀態 */
  dialogVisible = false;
  /** Dialog 明細資料 */
  dialogData: Fin34040DetailRow[] = [];
  /** Dialog 總筆數 */
  dialogTotalRecords = 0;
  /** Dialog 載入狀態 */
  dialogLoading = false;
  /** Dialog 表格版本（用於重新渲染） */
  dialogTableVer = 0;

  /** Dialog Footer 資料（總計列） */
  dialogFooterData: Fin34040DetailRow | null = null;

  /** 明細欄位定義 */
  detailColumns: ReportColumn[] = [
    { field: 'ARS_No', header: '應收 ID' },
    { field: 'ORG_ID', header: '組織代號' },
    { field: 'Org_Name', header: '組織名稱' },
    { field: 'Sam_yyymm', header: '帳款年月' },
    { field: 'Sam_Termno', header: '帳款帳次' },
    { field: 'RCV_ARS_Amt', header: '應收金額', format: formatAmount },
    { field: 'PTA_Amt', header: '沖帳金額', format: formatAmount },
    { field: 'Pay_AMT', header: '應收帳款餘額', format: formatAmount },
    { field: 'ARS_Date', header: '立帳日期', format: formatDate },
    { field: 'PTA_Date', header: '預計收款日', format: formatDate },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'VEN_Uniform', header: '統一編號' },
    { field: 'AccNo', header: '會計科目代號' },
    { field: 'AccCName', header: '會計科目名稱' },
    { field: 'ARS_SourceNo', header: '帳款來源單號' },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'ARS_StatusName', header: '狀態' },
  ];

  /* ----------------- 下拉選項 ----------------- */
  /** 分析日期別 */
  analysisDateTypeOptions = [
    { value: 'P', label: '預計收款日' },
    { value: 'A', label: '立帳日' },
  ];

  /** 廠客代號（從 API 載入） */
  vendorOptions: any[] = [];

  /** 科目代號（從 API 載入） */
  accNoOptions: any[] = [];

  /** 已到期/未到期 */
  dueTypeOptions = [
    { value: '0', label: '已到期' },
    { value: 'N', label: '未到期' },
  ];

  /** 顯示百分比 */
  showPercentOptions = [
    { value: true, label: '顯示' },
    { value: false, label: '不顯示' },
  ];

  /** 允許輸入類型: 正整數 */
  keyFilterInt: KeyFilterPattern = 'pint';

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    /** 分析日期（必填） */
    AnalysisDate: [null as Date | null, [Validators.required]],
    /** 分析區間（必填） */
    IntervalDays: [null as number | null, [Validators.required]],
    /** 分析期數（必填） */
    AnalysisPeriods: [null as number | null, [Validators.required]],
    /** 分析日期別 */
    AnalysisDateType: [null as string | null],
    /** 廠客代號(起) */
    VEN_No_From: [null as string | null],
    /** 廠客代號(迄) */
    VEN_No_To: [null as string | null],
    /** 立帳日期區間 */
    ARS_Date_From: [null as Date | null],
    ARS_Date_To: [null as Date | null],
    /** 收款日期（必填） */
    PayDate: [null as Date | null, [Validators.required]],
    /** 科目代號(起) */
    AccNo_From: [null as string | null],
    /** 科目代號(迄) */
    AccNo_To: [null as string | null],
    /** 已到期/未到期 */
    DueType: [null as string | null],
    /** 是否顯示百分比 */
    ShowPercent: [true as boolean],

    // 分頁排序
    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin34040Service: Fin34040Service,
    private dropdownApi: DropdownApiService,
    private datePipe: DatePipe
  ) {
    super();
  }

  /* ----------------- 工具方法 ----------------- */
  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter(
        (x) =>
          x && typeof x.field === 'string' && (x.order === 1 || x.order === -1)
      )
      .map((x) => ({ field: String(x.field), order: x.order as 1 | -1 }));
    return cleaned.length ? cleaned : fallback;
  }

  /* ----------------- Bucket 相關方法 ----------------- */
  /** 依 Side 分組 Buckets */
  private groupBucketsBySide(buckets: Fin34040Bucket[]): {
    expired: Fin34040Bucket[];
    unexpired: Fin34040Bucket[];
  } {
    return {
      expired: buckets.filter(b => b.Side === this.SIDE_EXPIRED),
      unexpired: buckets.filter(b => b.Side === this.SIDE_UNEXPIRED),
    };
  }

  /** 取得 Bucket 欄位名稱 */
  private getBucketFieldName(bucket: Fin34040Bucket): string {
    const bucketNo = String(bucket.BucketNo);
    return bucket.Side === this.SIDE_EXPIRED
      ? `DueBucket_${bucketNo}`
      : `EndBucket_${bucketNo}`;
  }

  /** 根據 DaysFrom 和 DaysTo 產生天數區間標籤 */
  private getIntervalLabel(bucket: Fin34040Bucket): string {
    const from = bucket.DaysFrom ?? 0;
    const to = bucket.DaysTo;

    // 單一天數：60天
    if (from === to) {
      return `${from}天`;
    }

    // 未到期：0 開始，顯示「X天以內」
    if (from === 0 && to != null) {
      return `${to}天以內`;
    }

    // 已到期或未到期：很大的數字或 null，顯示「X天以上」
    if (to == null) {
      return `${from}天以上`;
    }

    // 範圍：61~120天
    return `${from}~${to}天`;
  }

  /* ----------------- Payload 建立 ----------------- */
  /** 建立查詢條件 payload */
  private buildPayload(base: any): Fin34040Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
        ? base.pageIndex
        : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0
        ? base.pageSize
        : 30;

    const payload: Fin34040Request = {
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),
      AnalysisDate: this.datePipe.transform(base?.AnalysisDate, 'yyyy-MM-dd'),
      IntervalDays: base?.IntervalDays ?? null,
      AnalysisPeriods: base?.AnalysisPeriods ?? null,
      AnalysisDateType: base?.AnalysisDateType || null,
      VEN_No_From: base?.VEN_No_From || null,
      VEN_No_To: base?.VEN_No_To || null,
      ARS_Date_From: this.datePipe.transform(base?.ARS_Date_From, 'yyyy-MM-dd'),
      ARS_Date_To: this.datePipe.transform(base?.ARS_Date_To, 'yyyy-MM-dd'),
      PayDate: this.datePipe.transform(base?.PayDate, 'yyyy-MM-dd'),
      AccNo_From: base?.AccNo_From || null,
      AccNo_To: base?.AccNo_To || null,
      DueType: base?.DueType || null,
      ShowPercent: base?.ShowPercent ?? true,
    };

    // 移除空值
    return Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== '' && v != null)
    ) as Fin34040Request;
  }

  /** 匯出用：移除分頁參數 */
  private buildExportPayload(): Fin34040Request {
    const base = this.queryForm.getRawValue();
    const payload = this.buildPayload(base);
    delete payload.PageIndex;
    delete payload.PageSize;
    return payload;
  }

  /* ----------------- 資料轉換方法 ----------------- */
  /** 建立 Bucket 欄位（金額 > 0 時可點擊開啟明細） */
  private createBucketColumn(
    bucket: Fin34040Bucket,
    groupField: string,
    emptyDateLabel: string
  ): ReportColumn {
    const dateFrom: string = bucket.DateFrom ? formatDate(bucket.DateFrom) : emptyDateLabel;
    const dateTo: string = bucket.DateTo ? formatDate(bucket.DateTo) : emptyDateLabel;
    const headerLines = [
      this.getIntervalLabel(bucket),
      dateFrom,
      dateTo,
    ].filter(line => line !== '');

    const fieldName = this.getBucketFieldName(bucket);

    return {
      field: fieldName,
      header: headerLines.join('\n'),
      format: formatAmount,
      groupField,
      // 設定為可點擊連結
      type: 'link',
      // 金額 <= 0 時禁用連結
      linkDisabled: (rowData: any) => {
        const value = Number(rowData?.[fieldName] ?? 0);
        return value <= 0;
      },
    };
  }

  /** 根據 Buckets 動態產生表格欄位 */
  private generateColumnsFromBuckets(buckets: Fin34040Bucket[]): ReportColumn[] {
    const columns: ReportColumn[] = [
      { field: 'VEN_No', header: '廠商代號' },
      { field: 'VEN_Name', header: '廠商名稱' },
    ];

    const { expired, unexpired } = this.groupBucketsBySide(buckets);

    // 已到期欄位（依 BucketNo 由大到小排序）
    expired
      .sort((a, b) => b.BucketNo - a.BucketNo) // 降序排序
      .forEach(bucket => {
        columns.push(
          this.createBucketColumn(bucket, 'Expired', '以前')
        );
      });

    // 未到期欄位
    unexpired.forEach(bucket => {
      columns.push(
        this.createBucketColumn(bucket, 'Unexpired', '以後')
      );
    });

    // 總計欄位
    columns.push({
      field: 'TotalAmt',
      header: '總計',
      format: formatAmount,
      isTotal: true,
    });

    return columns;
  }

  /** 填入 Bucket 欄位資料 */
  private populateBucketFields(
    row: any,
    buckets: Fin34040Bucket[],
    bucketData: Record<string, number>
  ): void {
    buckets.forEach(bucket => {
      const bucketName = bucket.BucketName;
      row[this.getBucketFieldName(bucket)] = bucketData?.[bucketName] ?? 0;
    });
  }

  /** 將 Summaries 轉換為表格資料格式 */
  private transformSummariesToTableData(
    summaries: Fin34040Summary[],
    buckets: Fin34040Bucket[]
  ): any[] {
    const { expired, unexpired } = this.groupBucketsBySide(buckets);

    return summaries.map(summary => {
      const row: any = {
        VEN_No: summary.VEN_No,
        VEN_Name: summary.VEN_Name,
        TotalAmt: summary.TotalAmt,
      };

      // 處理 DueBuckets (已到期)
      this.populateBucketFields(row, expired, summary.DueBuckets || {});

      // 處理 EndBuckets (未到期)
      this.populateBucketFields(row, unexpired, summary.EndBuckets || {});

      return row;
    });
  }

  /** 將 Total 轉換為 Footer 資料格式 */
  private transformToFooterData(
    total: any,
    buckets: Fin34040Bucket[]
  ): any {
    const footer: any = {
      VEN_No: '總計',
      VEN_Name: '',
      TotalAmt: 0,
    };

    // 建立 BucketName -> Bucket 的映射表，避免重複查找
    const bucketMap = new Map<string, Fin34040Bucket>();
    buckets.forEach(b => bucketMap.set(b.BucketName, b));

    const { expired, unexpired } = this.groupBucketsBySide(buckets);

    // 初始化所有 Bucket 欄位為 0
    [...expired, ...unexpired].forEach(bucket => {
      footer[this.getBucketFieldName(bucket)] = 0;
    });

    // 優先使用 Total 物件
    if (total && total.TotalBuckets) {
      footer.TotalAmt = total.TotalAmt || 0;
      Object.keys(total.TotalBuckets || {}).forEach(bucketName => {
        const bucket = bucketMap.get(bucketName);
        if (bucket) {
          footer[this.getBucketFieldName(bucket)] = total.TotalBuckets[bucketName] || 0;
        }
      });
    } else {
      return null;
    }

    return footer;
  }

  /* ----------------- 資料處理方法 ----------------- */
  /** 處理 API 回應資料 */
  private processResponseData(responseData: Fin34040Response): {
    rows: any[];
    totalCount: number;
  } {
    // 儲存 Buckets 供明細查詢使用
    this.buckets = responseData.Buckets || [];

    // 動態產生欄位
    if (responseData.Buckets && responseData.Buckets.length > 0) {
      this.columns = this.generateColumnsFromBuckets(responseData.Buckets);
    }

    // 轉換 Summaries 為表格資料
    const rows = this.transformSummariesToTableData(
      responseData.Summaries || [],
      responseData.Buckets || []
    );

    // 設定 Footer 資料
    this.footerData = this.transformToFooterData(
      responseData.Total,
      responseData.Buckets || []
    );

    const totalCount = rows.length;

    return { rows, totalCount };
  }

  /** 重置表格資料 */
  private resetTableData(): void {
    this.data = [];
    this.footerData = null;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.selectedItems = [];
  }

  /* ----------------- TableReport 查詢函式 ----------------- */
  public queryFIN34040ForReport = (body: any) =>
    this.fin34040Service.queryFIN34040(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<Fin34040Response>) => {
        const responseData = res?.Data;
        if (!responseData) {
          return {
            Data: [],
            TotalCount: 0,
          };
        }

        const { rows, totalCount } = this.processResponseData(responseData);
        const finalTotalCount = Number(res?.TotalCount ?? totalCount) || totalCount;

        return {
          Data: rows,
          TotalCount: finalTotalCount,
        };
      })
    );

  /* ----------------- Init ----------------- */
  ngOnInit(): void {
    this.initializePage('FIN34040', '', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    // 載入廠客代號下拉
    this.dropdownApi
      .queryPos2013({ VEN_Flag: '1' })
      .pipe(untilDestroyed(this))
      .subscribe((items) => {
        this.vendorOptions = (items || []).map((item) => ({
          label: `${item['VEN_No']} - ${item['Name']}`,
          value: item['VEN_No'],
        }));
      });

    // 載入科目代號下拉（若有此 API）
    this.dropdownApi
      .queryGls1005()
      .pipe(filter(data => !!data))
      .pipe(untilDestroyed(this))
      .subscribe((items: any[]) => {
        this.accNoOptions = (items || []).map((item) => ({
          label: `${item['AccNo'] ?? item['No'] ?? ''} - ${item['AccCName'] ?? item['Name'] ?? ''}`,
          value: item['AccNo'] ?? item['No'] ?? '',
        }));
      });
  }

  /* ----------------- 查詢與提交方法 ----------------- */
  /** 處理查詢錯誤 */
  private handleQueryError(err: any): void {
    console.error('FIN34040 API Error:', err);
    this.resetTableData();
    this.loading = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmit(_frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload(raw);

    this.loading = true;
    this.resetTableData();
    this.tableVer++;

    this.fin34040Service
      .queryFIN34040(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Fin34040Response>) => {
          const responseData = response?.Data;
          if (!responseData) {
            this.resetTableData();
            this.loading = false;
            return;
          }

          const { rows, totalCount } = this.processResponseData(responseData);
          this.data = rows;

          const realTotal = Number(response?.TotalCount ?? totalCount) || totalCount;
          this.totalRecords = realTotal;
          this.viewTotalRecords = realTotal;

          this.lastQueryBody = { ...raw };
          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          this.loading = false;
        },
        error: (err: any) => this.handleQueryError(err),
      });
  }

  onClear(frm: FormGroup) {
    frm.reset({
      AnalysisDate: null,
      IntervalDays: null,
      AnalysisPeriods: null,
      AnalysisDateType: null,
      VEN_No_From: null,
      VEN_No_To: null,
      ARS_Date_From: null,
      ARS_Date_To: null,
      PayDate: null,
      AccNo_From: null,
      AccNo_To: null,
      DueType: null,
      ShowPercent: true,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.resetTableData();
  }

  /* ----------------- 匯出檔案工具 ----------------- */
  private getFilenameFromResponse(
    res: HttpResponse<Blob>,
    fallback: string
  ): string {
    const cd =
      res.headers.get('Content-Disposition') ||
      res.headers.get('content-disposition');
    if (!cd) return fallback;
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
    if (!match || !match[1]) return fallback;
    return decodeURIComponent(match[1].replace(/['"]/g, ''));
  }

  private saveBlob(res: HttpResponse<Blob>, defaultName: string) {
    const blob = new Blob([res.body as Blob], {
      type: res.body?.type || 'application/octet-stream',
    });
    const fileName = this.getFilenameFromResponse(res, defaultName);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // 匯出按鈕 loading 狀態
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;

  /* ----------------- 匯出：Excel ----------------- */
  downloadFIN34040Excel(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34040_帳齡分析表.xlsx';

    this.btnExportExcelLoading = true;

    this.fin34040Service
      .exportFIN34040Excel(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN34040 Excel export error:', err);
        },
      })
      .add(() => {
        this.btnExportExcelLoading = false;
      });
  }

  /* ----------------- 匯出：PDF ----------------- */
  downloadFIN34040PDF(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34040_帳齡分析表.pdf';

    this.btnExportPdfLoading = true;

    this.fin34040Service
      .exportFIN34040PDF(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN34040 PDF export error:', err);
        },
      })
      .add(() => {
        this.btnExportPdfLoading = false;
      });
  }

  /* ----------------- 明細 Dialog 相關方法 ----------------- */

  /**
   * 根據欄位名稱找到對應的 Bucket
   * @param fieldName 欄位名稱，例如 'DueBucket_1' 或 'EndBucket_2'
   */
  private findBucketByFieldName(fieldName: string): Fin34040Bucket | undefined {
    return this.buckets.find(bucket => this.getBucketFieldName(bucket) === fieldName);
  }

  /**
   * 建立明細查詢 payload
   * @param venNo 廠客代號
   * @param bucket 對應的 Bucket（包含日期區間）
   */
  private buildDetailPayload(venNo: string, bucket: Fin34040Bucket): Fin34040DetailRequest {
    const analysisDate = this.datePipe.transform(
      this.queryForm.controls.AnalysisDate.value,
      'yyyy-MM-dd'
    ) || '';

    const payload: Fin34040DetailRequest = {
      VenNo: venNo,
      BaseDate: analysisDate,
    };

    // 若 DateFrom/DateTo 有值才加入 payload
    if (bucket.DateFrom) {
      payload.ARS_DateFrom = bucket.DateFrom;
    }
    if (bucket.DateTo) {
      payload.ARS_DateTo = bucket.DateTo;
    }

    return payload;
  }

  /**
   * 處理表格連結點擊事件
   * @param event 包含 rowData 和 field 的事件物件
   */
  onLinkClick(event: { rowData: any; field: string }): void {
    const { rowData, field } = event;

    // 找到對應的 Bucket
    const bucket = this.findBucketByFieldName(field);
    if (!bucket) {
      console.warn(`找不到對應的 Bucket: ${field}`);
      return;
    }

    // 取得廠客代號
    const venNo = rowData?.VEN_No;
    if (!venNo) {
      console.warn('找不到廠客代號 (VEN_No)');
      return;
    }

    // 開啟明細 Dialog
    this.openDetail(venNo, bucket);
  }

  /**
   * 開啟明細 Dialog 並查詢資料
   * @param venNo 廠客代號
   * @param bucket 對應的 Bucket
   */
  openDetail(venNo: string, bucket: Fin34040Bucket): void {
    // 重置 Dialog 狀態
    this.dialogVisible = true;
    this.dialogLoading = true;
    this.dialogData = [];
    this.dialogFooterData = null;
    this.dialogTotalRecords = 0;
    this.dialogTableVer++;

    // 建立查詢 payload
    const payload = this.buildDetailPayload(venNo, bucket);

    // 呼叫明細 API
    this.fin34040Service
      .queryFIN34040Detail(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Fin34040DetailResponse>) => {
          const allDetails = res?.Data?.Details || [];

          // 分離總計列和明細資料
          const dataRows = allDetails.filter(row => !row.IsTotal);
          const totalRow = allDetails.find(row => row.IsTotal) || null;

          // 為明細資料加上 _rowKey 供表格使用
          dataRows.forEach((row, idx) => {
            (row as any)._rowKey = idx + 1;
          });

          this.dialogData = dataRows;
          this.dialogFooterData = totalRow;
          this.dialogTotalRecords = dataRows.length;
        },
        error: (err: any) => {
          console.error('FIN34040 明細查詢錯誤:', err);
          this.dialogData = [];
          this.dialogFooterData = null;
          this.dialogTotalRecords = 0;
        },
      })
      .add(() => {
        this.dialogLoading = false;
      });
  }

  /**
   * 關閉明細 Dialog
   * @param visible Dialog 顯示狀態
   */
  onDialogClose(visible: boolean): void {
    this.dialogVisible = visible;
  }
}
