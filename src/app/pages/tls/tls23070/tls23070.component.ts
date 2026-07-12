/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23070Service } from '../../../service/api/tls/tls23070.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatAmount,
  formatDate,
  ReportColumn
} from '../../../shared/componentkit/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

interface SortItem { field: string; order: 1 | -1 }

@UntilDestroy()
@Component({
  selector: 'app-tls23070',
  templateUrl: './tls23070.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, MultiSelectComponent, InputTextModule, ButtonComponent,
    TranslateModule, CalendarComponent, ButtonModule, TableReportComponent, DialogComponent,
  ],
})
export class TLS23070Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 排序狀態 =====
  sortMeta: SortItem[] = [];
  readonly defaultSort: SortItem[] = [{ field: 'tlt_no', order: 1 }];

  // ===== 表格控制機制 =====
  mainTableVisible = true;
  mainRenderKey = 0;
  detailTableVisible = true;
  detailRenderKey = 0;
  mainLoading = false;
  detailLoading = false;

  private mainInFlight = false;
  private mainLoadedPages = new Set<number>();
  private detailInFlight = false;
  private detailLoadedPages = new Set<number>();

  // ===== 資料集與欄位定義 =====
  data: any[] = [];
  totalRecords = 0;
  footerData: Record<string, number> = {};
  columns = this.buildMainColumns();

  // ===== 匯出狀態管理 =====
  btnLoading = false;
  historyRequestBody: any | null = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 (符合 1000 規格與頁碼 1 起始) =====
  queryForm = this.formBuilder.group({
    TXN_Month: [null],
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_no: [],
    tlt_building: [null],
    tlt_floor: [],
    org_id: [],
    pageSize: [1000], // ⬅️ 依要求調整為 1000 規格
    pageIndex: [1],   // ⬅️ 初始頁碼改為 1
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });

  // ===== 下拉選單資料源 =====
  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  // ===== 明細 Dialog 狀態 =====
  dialogVisible = false;
  selectedMainRow: any | null = null;
  dialogData: any[] = [];
  dialogTotalRecords = 0;
  dialogFooterData: Record<string, number> | null = null;
  dialogHistoryRequestBody: any | null = null;

  private dropdownInit$?: Observable<any>;

  // 後端欄位名稱對應轉換結構
  private readonly detailTotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'totalTotPayAmt', TXN_PayAmt10: 'totalPayAmt10', TXN_PayAmt41: 'totalPayAmt41',
    TXN_PayAmt42: 'totalPayAmt42', TXN_PayAmt12: 'totalPayAmt12', TXN_PayAmt81: 'totalPayAmt81',
    TXN_PayAmt43: 'totalPayAmt43', TXN_PayAmt44: 'totalPayAmt44', TXN_PayAmt14: 'totalPayAmt14',
    TXN_PayAmt82: 'totalPayAmt82', TXN_PayAmt52: 'totalPayAmt52', TXN_PayAmt20: 'totalPayAmt20',
    TXN_PayAmt62: 'totalPayAmt62', TXN_PayAmt77: 'totalPayAmt77', TXN_PayAmt71: 'totalPayAmt71',
    TXN_PayAmt30: 'totalPayAmt30', TXN_PayAmt73: 'totalPayAmt73', TXN_PayAmt72: 'totalPayAmt72',
    TXN_PayAmt74: 'totalPayAmt74', TXN_PayAmt75: 'totalPayAmt75', TXN_PayAmt76: 'totalPayAmt76',
    TXN_PayAmt24: 'totalPayAmt24', TXN_PayAmt25: 'totalPayAmt25', TXN_PayAmt07: 'totalPayAmt07',
    TXN_PayAmt55: 'totalPayAmt55', TXN_PayAmt83: 'totalPayAmt83', TXN_PayAmt78: 'totalPayAmt78',
    TXN_PayAmt79: 'totalPayAmt79', TXN_PayAmt21: 'totalPayAmt21', TXN_PayAmt53: 'totalPayAmt53',
    TXN_PayAmt56: 'totalPayAmt56', TXN_PayAmt57: 'totalPayAmt57', TXN_PayAmt58: 'totalPayAmt58',
    TXN_PayAmt59: 'totalPayAmt59', TXN_PayAmt60: 'totalPayAmt60', TXN_PayAmt22: 'totalPayAmt22',
    TXN_PayAmt23: 'totalPayAmt23', TXN_PayAmt26: 'totalPayAmt26', TXN_PayAmt27: 'totalPayAmt27',
    TXN_PayAmt28: 'totalPayAmt28', TXN_PayAmt29: 'totalPayAmt29', TXN_PayAmt61: 'totalPayAmt61',
    TXN_PrePayAmt: 'totalPrePayAmt', TXN_OverAmt: 'totalOverAmt', TXN_ReturnAmt: 'totalReturnAmt',
    TXN_ExchgAmt: 'totalExchgAmt', TXN_CancelAmt: 'totalCancelAmt',
  };

  constructor(
    public readonly tls23070Service: TLS23070Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23070', 'tls/tls23070', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map((x) => ({ ...x }));

    // 月份與日期區間同步機制
    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d: Date | null) => {
        if (!d || isNaN(new Date(d).getTime())) return;
        const { start, end } = this.getMonthRange(d);
        this.queryForm.patchValue({ TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 }, { emitEvent: false });
      });

    this.queryForm.controls.TXN_DateStart.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());

    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 聲明式打包優化)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      counters: this.dropdownApiService.queryTltTalent().pipe(catchError(() => of([]))),
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), catchError(() => of([]))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      orgs: this.dropdownApiService.querySys3100().pipe(catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res: { floors: never[]; buildings: never[]; counters: any; orgs: any; }) => {
      this.floorOptions = res.floors || [];
      this.BUILDING_NO_Options = res.buildings || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.label}`,
        value: x.value,
      });

      this.CounterOptions = (res.counters || []).map(mapStandardOption);
      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
    });
  }

  // ========= 主表查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService?.warnBubble?.('請確認必填欄位');
      return;
    }

    const val = this.queryForm.getRawValue() as any;
    const payload: any = {
      TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
      tlt_no: Array.isArray(val?.tlt_no) && val.tlt_no.length ? val.tlt_no : undefined,
      tlt_building: val?.tlt_building ?? undefined,
      tlt_floor: Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
      org_id: Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
      pageIndex: 1,
      pageSize: 1000, // ⬅️ 調整為全域指定之 1000 規格
      SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      _nonce: Date.now(),
    };

    this.historyRequestBody = payload;
    this.mainLoadedPages.clear();
    this.mainInFlight = false;

    this.data = [];
    this.totalRecords = 0;
    this.footerData = {};

    this.mainTableVisible = false;
    this.mainRenderKey++;

    Promise.resolve().then(() => {
      this.mainTableVisible = true;
      this.mainLoading = true;

      this.queryTLS23070MainForReport(payload)
        .pipe(finalize(() => (this.mainLoading = false)))
        .subscribe({
          next: (res: any) => {
            this.data = res?.Data ?? [];
            this.totalRecords = Number(res?.TotalCount ?? this.data.length);
            this.footerData = res?.GrandTotal ?? {};
          },
          error: (err) => {
            console.error('[TLS23070] MAIN API error', err);
            this.messageService?.warnBubble?.('查詢失敗');
          },
        });
    });
  }

  // ========= 主表：提供給 app-table-report 的查詢函式（支援 1000 規格分頁） =========
  public queryTLS23070MainForReport = (body: any) => {
    const normalized = this.normalizePaginationBody(body, this.defaultSort);
    const pageIndex = Number(normalized.pageIndex) || 1;
    const pageSize = Number(normalized.pageSize) || 1000; // ⬅️ 升級為 1000 規格

    if (this.mainInFlight || this.mainLoadedPages.has(pageIndex)) {
      return of({ Data: [], TotalCount: this.totalRecords, GrandTotal: this.footerData, TotalPage: 0 });
    }

    this.mainInFlight = true;
    return defer(() => this.tls23070Service.queryTLS23070(normalized).pipe(
      finalize(() => (this.mainInFlight = false)),
      map((res: any) => {
        const pack = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : (res?.Data ?? {});
        const tltNoSubTotals = Array.isArray(pack?.tltNoSubTotals) ? pack.tltNoSubTotals : [];
        const pageRows = this.buildMainRowsFromSubTotals(tltNoSubTotals);
        const totalSummary = pack?.totalSummary ?? {};
        const grand = this.buildGrandTotalFromSummary(totalSummary);

        let totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : (typeof pack?.TotalCount === 'number' ? pack.TotalCount : pageRows.length);

        if (pageRows.length === 0) {
          totalCount = (pageIndex - 1) * pageSize;
        }

        this.totalRecords = totalCount;
        this.footerData = grand;
        this.mainLoadedPages.add(pageIndex);

        return { Data: pageRows, TotalCount: totalCount, GrandTotal: grand, TotalPage: res?.TotalPage };
      })
    ));
  };

  // ========= 明細彈窗啟動器（支援 1000 分頁） =========
  override onDetail(row: any): void {
    this.detailLoadedPages.clear();
    this.detailInFlight = false;

    if (!row || this.detailLoading) return;

    this.selectedMainRow = row;
    this.dialogVisible = true;

    const body: any = {
      ...(this.historyRequestBody ?? {}),
      tlt_no: row?.tlt_no ? [row.tlt_no] : undefined,
      pageIndex: 1,
      pageSize: 1000, // ⬅️ 升級為 1000 規格
      SortBy: [{ field: 'TXN_Date', order: 1 }],
      _nonce: Date.now(),
    };

    this.dialogHistoryRequestBody = body;
    this.dialogData = [];
    this.dialogTotalRecords = 0;
    this.dialogFooterData = null;
    this.detailLoading = true;

    this.tls23070Service.queryTLS23070Detail(body)
      .pipe(finalize(() => { this.detailLoading = false; }))
      .subscribe({
        next: (res: any) => {
          const pack = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : (res?.Data ?? {});
          const dateSubs = Array.isArray(pack?.dateSubsTotals) ? pack.dateSubsTotals : [];
          const rows = this.buildDetailRowsFromDateSubsTotals(dateSubs);

          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : (typeof pack?.TotalCount === 'number' ? pack.TotalCount : rows.length);
          const grand = this.buildTotalsFromRows(rows);

          this.dialogData = rows;
          this.dialogTotalRecords = totalCount;
          this.dialogFooterData = grand;

          this.dialogHistoryRequestBody = {
            ...body,
            pageIndex: 1,
            pageSize: 1000,
            SortBy: [{ field: 'TXN_Date', order: 1 }],
          };
        },
        error: (err) => {
          console.error('[TLS23070] DETAIL API error', err);
          this.messageService?.warnBubble?.('明細查詢失敗');
          this.dialogData = [];
          this.dialogTotalRecords = 0;
          this.dialogFooterData = null;
        },
      });
  }

  // ========= 提供給 Dialog 內 app-table-report 的明細查詢 =========
  public queryTLS23070DetailForReport = (body: any) => {
    const normalized = this.normalizePaginationBody(body, [{ field: 'TXN_Date', order: 1 }]);
    const pageIndex = Number(normalized.pageIndex) || 1;
    const pageSize = Number(normalized.pageSize) || 1000; // ⬅️ 升級為 1000 規格

    if (this.detailInFlight || this.detailLoadedPages.has(pageIndex)) {
      return of({ Data: [], TotalCount: this.dialogTotalRecords, GrandTotal: this.dialogFooterData ?? {}, TotalPage: 0 });
    }

    this.detailInFlight = true;
    this.detailLoading = true;

    return this.tls23070Service.queryTLS23070Detail(normalized).pipe(
      finalize(() => {
        this.detailLoading = false;
        this.detailInFlight = false;
      }),
      map((res: any) => {
        const pack = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : (res?.Data ?? {});
        const dateSubs = Array.isArray(pack?.dateSubsTotals) ? pack.dateSubsTotals : [];
        const pageRows = this.buildDetailRowsFromDateSubsTotals(dateSubs);

        let totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : (typeof pack?.TotalCount === 'number' ? pack.TotalCount : pageRows.length);

        if (pageRows.length === 0) {
          totalCount = (pageIndex - 1) * pageSize;
        }

        const grand = this.buildTotalsFromRows(pageRows);
        this.dialogTotalRecords = totalCount;
        this.dialogFooterData = grand;
        this.detailLoadedPages.add(pageIndex);

        return { Data: pageRows, TotalCount: totalCount, GrandTotal: grand, TotalPage: res?.TotalPage };
      })
    );
  };

  onDialogClose(v: boolean): void {
    this.dialogVisible = v;
    if (!v) {
      this.selectedMainRow = null;
      this.dialogData = [];
      this.dialogFooterData = null;
      this.dialogTotalRecords = 0;
      this.dialogHistoryRequestBody = null;
    }
  }

  // ========= 檔案匯出維護機制 =========
  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23070Service.exporttls23070PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
      });
  }

  onExportExcel(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23070Service.exportTLS23070Excel(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService?.warnBubble?.('EXCEL 匯出失敗。'),
      });
  }

  private showExportWarn(): void { this.messageService?.warnBubble?.('請先執行查詢以產生報表。'); }

  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;
    if (blob && blob.size > 0) {
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;
    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      try { return decodeURIComponent(filenameStarMatch[1].trim().replace(/^UTF-8''/, '')); } catch { }
    }
    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replaceAll(/\+/g, ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  // ========= 資料清洗與對應映射轉型群 =========
  private readonly getNumericFields = (): string[] => Object.keys(this.detailTotalFieldMap);

  private buildGrandTotalFromSummary(summary: any): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [field, apiKey] of Object.entries(this.detailTotalFieldMap)) {
      out[field] = Number(summary?.[apiKey] ?? 0);
    }
    return out;
  }

  private buildMainRowsFromSubTotals(tltNoSubTotals: any[]): any[] {
    const groups = Array.isArray(tltNoSubTotals) ? tltNoSubTotals : [];
    const fields = this.getNumericFields();
    const rows: any[] = [];
    for (const g of groups) {
      const tltNo = g?.tlt_no ?? '';
      const row: any = { _rowKey: tltNo, tlt_no: tltNo, tlt_name: g?.tlt_name ?? '' };
      for (const f of fields) {
        const apiKey = this.detailTotalFieldMap[f];
        const tltKey = apiKey.startsWith('total') ? 'tltNoTotal' + apiKey.substring(5) : apiKey;
        row[f] = Number(g?.[tltKey] ?? 0);
      }
      rows.push(row);
    }
    return rows;
  }

  private buildDetailRowsFromDateSubsTotals(dateSubsTotals: any[]): any[] {
    const subs = Array.isArray(dateSubsTotals) ? dateSubsTotals : [];
    const fields = this.getNumericFields();
    const rows: any[] = [];
    for (const s of subs) {
      const dateStr = this.toDateOnly(s?.TXN_Date);
      const row: any = { TXN_Date: dateStr };
      for (const f of fields) {
        const apiKey = this.detailTotalFieldMap[f];
        const subsKey = apiKey.startsWith('total') ? 'subsTotal' + apiKey.substring(5) : apiKey;
        row[f] = Number(s?.[subsKey] ?? 0);
      }
      row._rowKey = `${s?.tlt_no ?? ''}|${dateStr ?? ''}`;
      rows.push(row);
    }
    return rows;
  }

  private buildTotalsFromRows(rows: any[]): Record<string, number> {
    const fields = this.getNumericFields();
    const out: Record<string, number> = {};
    for (const f of fields) out[f] = 0;
    for (const r of rows) {
      for (const f of fields) out[f] += Number(r?.[f] ?? 0);
    }
    return out;
  }

  private normalizePaginationBody(raw: any, fallbackSort: SortItem[]) {
    const pageSize = Number(raw?.pageSize ?? raw?.rows ?? 1000) || 1000; // ⬅️ 固定 1000 基準判斷
    let pageIndex = Number(raw?.pageIndex);
    if (!pageIndex || pageIndex < 1) {
      pageIndex = Math.floor((Number(raw?.first) || 0) / pageSize) + 1;
    }
    let sortBy = Array.isArray(raw?.SortBy) && raw.SortBy.length ? raw.SortBy : undefined;
    if (!sortBy && Array.isArray(raw?.multiSortMeta) && raw.multiSortMeta.length) {
      sortBy = raw.multiSortMeta.map((x: any) => ({ field: x.field, order: x.order }));
    }
    return { ...raw, pageSize, pageIndex, SortBy: sortBy || fallbackSort };
  }

  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth();
    return { start: new Date(year, month, 1, 0, 0, 0), end: new Date(year, month + 1, 0, 23, 59, 59) };
  }

  private clearMonthIfNotExactRange() {
    const start = this.queryForm.value.TXN_DateStart;
    const end = this.queryForm.value.TXN_DateEnd;
    if (!start || !end) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
      return;
    }
    const { start: mStart, end: mEnd } = this.getMonthRange(new Date(start));
    if (new Date(start).getTime() !== mStart.getTime() || new Date(end).getTime() !== mEnd.getTime()) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
    }
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且校正對齊) =====
  private buildMainColumns(): ReportColumn[] {
    return [
      { field: 'tlt_no', header: '專櫃編號', visible: true },
      { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
      { field: 'TXN_TotPayAmt', header: '總金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt10', header: '現金', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt43', header: '中信連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt44', header: '中信離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt52', header: '一卡通', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt20', header: '禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt75', header: '折價券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt76', header: '現抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt59', header: '即享券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt60', header: '喜客券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt26', header: '品牌已開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt27', header: '品牌未開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt28', header: '外送平台', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt29', header: 'EC', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PayAmt61', header: 'PayEasy', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_OverAmt', header: '溢收金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    ];
  }

  detailColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt10', header: '現金', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt20', header: '禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt26', header: '品牌已開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt27', header: '品牌未開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt28', header: '外送平台', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt29', header: 'EC', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt61', header: 'PayEasy', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
  ];
}
