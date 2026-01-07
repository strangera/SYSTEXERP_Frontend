/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../shared/componentkit/table/table.model';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

// Service & 型別
import {
  ApiResponse,
  Fin29110DetailRequest,
  Fin29110DetailRow,
  Fin29110Request,
  Fin29110Row,
  Fin29110Service,
} from '../../../service/api/fin/fin29110.service';

// 排序欄位型別
type SortItem = { field: string; order: number };

interface DetailContext {
  AnalysisDate: string;
  BucketDays: number;
  DateType: string;
  PayDate: string;
  Side: 'O' | 'N';
  BucketN: number;
  VEN_No?: string | null;
}

@UntilDestroy()
@Component({
  selector: 'app-fin29110',
  templateUrl: './fin29110.component.html',
  styleUrls: ['./fin29110.component.scss'],
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
    // InputNumberComponent,
    InputTextRangeComponent,
    DropdownComponent,
    RadiobuttonComponent,
    DialogComponent,
    TableReportComponent,
  ],
})
export class FIN29110Component extends BasicQueryPageComponent<any> {
  /* ----------------- 主表狀態 ----------------- */
  data: Fin29110Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Fin29110Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  /* ----------------- 明細 Dialog 狀態 ----------------- */
  dialogVisible = false;
  dialogData: Fin29110DetailRow[] = [];
  dialogTotalRecords = 0;
  dialogFooterData: any = undefined;
  dialogLoading = false;
  dialogHistoryRequestBody: any = null;
  dialogTableVer = 0;
  private dialogContext: DetailContext | null = null;

  /* ----------------- 欄位定義 ----------------- */
  // 主表欄位
  columns: ReportColumn[] = [
    { field: 'VendorNo', header: '廠商編號' },
    // { field: 'VendorName', header: '廠商名稱' },

    { field: 'Overdue_Over301Days', header: '已到期(≧301天)', format: this.moneyFormat.bind(this) },
    { field: 'Overdue_241_300_Days', header: '已到期(241-300天)', format: this.moneyFormat.bind(this) },
    { field: 'Overdue_181_240_Days', header: '已到期(181-240天)', format: this.moneyFormat.bind(this) },
    { field: 'Overdue_121_180_Days', header: '已到期(121-180天)', format: this.moneyFormat.bind(this) },
    { field: 'Overdue_61_120_Days', header: '已到期(61-120天)', format: this.moneyFormat.bind(this) },
    { field: 'Overdue_0_60_Days', header: '已到期(0-60天)', format: this.moneyFormat.bind(this) },

    { field: 'NotDue_Over301Days', header: '未到期(≧301天)', format: this.moneyFormat.bind(this) },
    { field: 'NotDue_241_300_Days', header: '未到期(241-300天)', format: this.moneyFormat.bind(this) },
    { field: 'NotDue_181_240_Days', header: '未到期(181-240天)', format: this.moneyFormat.bind(this) },
    { field: 'NotDue_121_180_Days', header: '未到期(121-180天)', format: this.moneyFormat.bind(this) },
    { field: 'NotDue_61_120_Days', header: '未到期(61-120天)', format: this.moneyFormat.bind(this) },
    { field: 'NotDue_0_60_Days', header: '未到期(0-60天)', format: this.moneyFormat.bind(this) },

    { field: 'SumAmount', header: '總計', format: this.moneyFormat.bind(this) },
  ];

  // 明細欄位（Dialog 內 table）
  detailColumns: ReportColumn[] = [
    { field: 'RowNo', header: '序號' },
    { field: 'ACP_No', header: '應付ID' },
    { field: 'STO_No', header: '組織代號' },
    { field: 'ACP_YYYYMM', header: '帳款年月' },
    { field: 'ACP_TermNo', header: '帳款帳次' },
    { field: 'ACP_Amt', header: '應付金額', format: this.moneyFormat.bind(this) },
    { field: 'PTA_Amt', header: '沖帳金額', format: this.moneyFormat.bind(this) },
    { field: 'ACP_BalanceAmt', header: '應付帳款餘額', format: this.moneyFormat.bind(this) },
    { field: 'ACP_Date', header: '立帳日期', format: (v: string) => this.formatDate(v) },
    { field: 'ACP_ExpectPayDate', header: '預計付款日', format: (v: string) => this.formatDate(v) },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'VEN_Uniform', header: '統一編號' },
    { field: 'AccNo', header: '會計科目代號' },
    { field: 'ACP_SourceNo', header: '帳款來源單號' },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'Status', header: '狀態' },
    { field: 'AgeDays', header: '帳齡天數' },
  ];

  // 預設排序：以廠商編號
  readonly defaultSort: SortItem[] = [{ field: 'VendorNo', order: 1 }];

  /* ----------------- 下拉選項 ----------------- */
  dateTypeOptions: any[] = [
    { value: 'E', label: '立帳日' },
    { value: 'P', label: '預計付款日' },
  ];

  // A=全部, O=已到期, N=未到期
  dueFlagOptions: any[] = [
    { value: 'A', label: '全部' },
    { value: 'O', label: '已到期' },
    { value: 'N', label: '未到期' },
  ];

  // 分析區間/期數 下拉：value 用字串，方便 reuse parsePeriodInput
  periodOptions: any[] = [
    { value: '60/6', label: '60日 × 6期' },
    { value: '30/6', label: '30日 × 6期' },
    { value: '90/4', label: '90日 × 4期' },
  ];

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    // 分析日期（必填）
    AnalysisDate: [null as Date | null, [Validators.required]],

    // 分析區間/期數：預設 60/6，改為下拉選單
    PeriodsInput: ['60/6', [Validators.required]],

    // 分析日期別（立帳日 / 預計付款日）
    DateType: ['E' as string, [Validators.required]],

    // 廠商編號 起迄
    VEN_No_From: [null as string | null],
    VEN_No_To: [null as string | null],

    // 立帳/預計付款 日期區間
    RefDateFrom: [null as Date | null],
    RefDateTo: [null as Date | null],

    // 付款日期（必填）
    PayDate: [null as Date | null, [Validators.required]],

    // 已到期/未到期/全部
    DueFlag: ['A' as string, [Validators.required]],

    ...createPaginationConfig([{ field: 'VendorNo', order: 1 }]),
  });

  /* ----------------- 匯出按鈕 loading ----------------- */
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;

  constructor(
    private fin29110Service: Fin29110Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  /* ----------------- 工具函式 ----------------- */

  private moneyFormat(value: number): string {
    if (value == null) return '0';
    return Number(value || 0).toLocaleString('en-US');
  }

  private formatDate(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  }

  private toYMDOrUndef(
    d: Date | string | null | undefined
  ): string | undefined {
    if (d == null) return undefined;
    const s = formatDateToYYYY_MM_DD(d as Date | string) as
      | string
      | null
      | undefined;
    return !s ? undefined : s;
  }

  // 解析 「分析區間/期數」欄位，例如 "60/6" → { bucketDays:60, periods:6 }
  private parsePeriodInput(
    input: string | null | undefined
  ): { bucketDays: number; periods: number } {
    const defaultVal = { bucketDays: 60, periods: 6 };
    if (!input) return defaultVal;

    const parts = input.split('/');
    if (parts.length !== 2) return defaultVal;

    const d = Number(parts[0]);
    const p = Number(parts[1]);
    if (!Number.isFinite(d) || !Number.isFinite(p) || d <= 0 || p <= 0) {
      return defaultVal;
    }
    return { bucketDays: d, periods: p };
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter(
        (x) =>
          x && typeof x.field === 'string' && typeof x.order === 'number'
      )
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  /** 將畫面上的值整理成後端需要的 Fin29110Request */
  private buildPayload(base: any): Fin29110Request {
    const { bucketDays, periods } = this.parsePeriodInput(
      base?.PeriodsInput ?? this.queryForm.get('PeriodsInput')?.value
    );

    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
        ? base.pageIndex
        : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0
        ? base.pageSize
        : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    // 產 OrderBy 字串，例如：VendorNo ASC, SumAmount DESC
    const orderBy =
      sort && sort.length
        ? sort
          .map((s) => {
            const dir = s.order === -1 ? 'DESC' : 'ASC';
            return `${s.field} ${dir}`;
          })
          .join(', ')
        : null;

    const payload: Fin29110Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      OrderBy: orderBy,
      Offset: (pageIndex - 1) * pageSize,

      AnalysisDate: this.toYMDOrUndef(base?.AnalysisDate),
      BucketDays: bucketDays,
      Periods: periods,
      DateType: base?.DateType || 'E',
      PayDate: this.toYMDOrUndef(base?.PayDate),
      DueFlag: base?.DueFlag || 'A',
      RefDateFrom: this.toYMDOrUndef(base?.RefDateFrom),
      RefDateTo: this.toYMDOrUndef(base?.RefDateTo),
      VEN_No_From: base?.VEN_No_From || undefined,
      VEN_No_To: base?.VEN_No_To || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /** 匯出用：沿用查詢條件，但移除 PageIndex/PageSize */
  private buildExportPayload(): Fin29110Request {
    const base = this.queryForm.getRawValue();
    const payload = this.buildPayload(base);
    delete payload.PageIndex;
    delete payload.PageSize;
    return payload;
  }

  /** 明細查詢 payload：從 dialogContext + body (pageIndex/pageSize/SortBy) 組出 */
  private buildDetailPayload(body: any): Fin29110DetailRequest {
    if (!this.dialogContext) {
      throw new Error('DetailContext is not set.');
    }

    const ctx = this.dialogContext;

    const pageIndex =
      Number.isFinite(body?.pageIndex) && body.pageIndex >= 1
        ? body.pageIndex
        : 1;
    const pageSize =
      Number.isFinite(body?.pageSize) && body.pageSize > 0
        ? body.pageSize
        : 30;

    const sort = this.normalizeSort(body?.SortBy, [
      { field: 'ACP_Date', order: -1 },
    ]);

    const orderBy =
      sort && sort.length
        ? sort
          .map((s) => `${s.field} ${s.order === -1 ? 'DESC' : 'ASC'}`)
          .join(', ')
        : null;

    const payload: Fin29110DetailRequest = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,
      OrderBy: orderBy,
      Offset: (pageIndex - 1) * pageSize,

      AnalysisDate: ctx.AnalysisDate,
      BucketDays: ctx.BucketDays,
      DateType: ctx.DateType,
      PayDate: ctx.PayDate,
      Side: ctx.Side,
      BucketN: ctx.BucketN,
      VEN_No: ctx.VEN_No,
    };

    return payload;
  }

  private getFilenameFromResponse(
    res: HttpResponse<Blob>,
    fallback: string
  ): string {
    const cd =
      res.headers.get('Content-Disposition') ||
      res.headers.get('content-disposition');
    if (!cd) return fallback;
    const match =
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
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

  /* ----------------- 給 <app-table-report> 用的查詢函式（主表） ----------------- */
  public queryFIN29110ForReport = (body: any) =>
    this.fin29110Service.queryFIN29110(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<Fin29110Row[] | Fin29110Row>) => {
        const src = res?.Data as any;
        const rows: Fin29110Row[] = Array.isArray(src)
          ? src
          : src
            ? [src]
            : [];

        const totalCount =
          Number((res as any)?.TotalCount ?? rows.length) || rows.length;

        rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));

        return {
          Data: rows,
          TotalCount: totalCount,
          GrandTotal: null,
        };
      })
    );


  /* ----------------- 給 Dialog <app-table-report> 用的查詢函式（明細） ----------------- */
  public queryFIN29110DetailForReport = (body: any) =>
    this.fin29110Service
      .queryFIN29110Detail(this.buildDetailPayload(body || {}))
      .pipe(
        map((res: ApiResponse<Fin29110DetailRow[] | Fin29110DetailRow>) => {
          const src = res?.Data as any;
          const rows: Fin29110DetailRow[] = Array.isArray(src)
            ? src
            : src
              ? [src]
              : [];
          const totalCount =
            Number((res as any)?.TotalCount ?? rows.length) || rows.length;
          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));
          return {
            Data: rows,
            TotalCount: totalCount,
            GrandTotal: null,
          };
        })
      );


  /* ----------------- Init ----------------- */
  ngOnInit(): void {
    const today = new Date();
    this.queryForm.patchValue({
      AnalysisDate: today,
      PayDate: today,
      DateType: 'E',
      DueFlag: 'A',
      PeriodsInput: '60/6',
    });

    this.initializePage(
      'FIN29110',
      '/FIN2000/FIN29110CRU',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
  }

  /* ----------------- Submit（主表查詢） ----------------- */
  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload(raw);
    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.fin29110Service
      .queryFIN29110(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Fin29110Row[]>) => {
          const rows: Fin29110Row[] = Array.isArray(response?.Data)
            ? response.Data
            : [];

          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));

          this.data = rows;
          this.viewTotalRecords = this.data.length;
          this.cdr.detectChanges();

          const realTotal =
            Number(response?.TotalCount ?? rows.length) || rows.length;
          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = { ...payload };
          });

          this.queryStateService.setQueryState(
            this.ProgNo,
            this.queryForm.value
          );
          this.loading = false;
        },
        error: (err: any) => {
          console.error('FIN29110 API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
        },
      });
  }

  /* ----------------- 清除 ----------------- */
  onClear(frm: FormGroup) {
    const today = new Date();
    frm.reset({
      AnalysisDate: today,
      PeriodsInput: '60/6',
      DateType: 'E',
      VEN_No_From: null,
      VEN_No_To: null,
      RefDateFrom: null,
      RefDateTo: null,
      PayDate: today,
      DueFlag: 'A',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }

  /* ----------------- 匯出：Excel ----------------- */
  downloadFIN29110Excel(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN29110_應付帳款帳齡分析表.xlsx';

    this.btnExportExcelLoading = true;
    this.fin29110Service
      .exportFIN29110Excel(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN29110 Excel export error:', err);
        },
      })
      .add(() => {
        this.btnExportExcelLoading = false;
      });
  }

  /* ----------------- 匯出：PDF ----------------- */
  downloadFIN29110PDF(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN29110_應付帳款帳齡分析表.pdf';

    this.btnExportPdfLoading = true;
    this.fin29110Service
      .exportFIN29110PDF(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN29110 PDF export error:', err);
        },
      })
      .add(() => {
        this.btnExportPdfLoading = false;
      });
  }

  /* ----------------- Dialog：開啟明細 ----------------- */
  openDetail(row: Fin29110Row, side: 'O' | 'N', bucketN: number) {
    const raw = this.queryForm.getRawValue();
    const { bucketDays } = this.parsePeriodInput(raw.PeriodsInput || '60/6');

    const analysisDate = this.toYMDOrUndef(raw.AnalysisDate)!;
    const payDate =
      this.toYMDOrUndef(raw.PayDate) || analysisDate;

    this.dialogContext = {
      AnalysisDate: analysisDate,
      BucketDays: bucketDays,
      DateType: raw.DateType || 'E',
      PayDate: payDate,
      Side: side,
      BucketN: bucketN,
      VEN_No: row.VendorNo,
    };

    this.dialogVisible = true;
    this.dialogLoading = true;
    this.dialogData = [];
    this.dialogFooterData = undefined;
    this.dialogTotalRecords = 0;
    this.dialogHistoryRequestBody = {
      pageIndex: 1,
      pageSize: raw.pageSize || 30,
      SortBy: [{ field: 'ACP_Date', order: -1 }],
    };
    this.dialogTableVer++;

    const payload = this.buildDetailPayload(this.dialogHistoryRequestBody);

    this.fin29110Service
      .queryFIN29110Detail(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Fin29110DetailRow[]>) => {
          const rows: Fin29110DetailRow[] = Array.isArray(res?.Data)
            ? res.Data
            : [];
          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));
          this.dialogData = rows;
          const realTotal =
            Number(res?.TotalCount ?? rows.length) || rows.length;
          this.dialogTotalRecords = realTotal;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('FIN29110 detail API error:', err);
          this.dialogData = [];
          this.dialogTotalRecords = 0;
        },
      })
      .add(() => {
        this.dialogLoading = false;
      });
  }

  onDialogClose(visible: boolean) {
    this.dialogVisible = visible;
  }

  // 主表「明細」按鈕事件（跟 TLS23070 的 override onDetail 一樣概念）
  override onDetail(row: Fin29110Row): void {
    if (!row || !row.VendorNo) {
      console.warn('detail 事件沒有帶到 VendorNo：', row);
      return;
    }

    // 這裡先用「已到期」第 0 期 bucket 開明細
    this.openDetail(row, 'O', 0);
  }







}
