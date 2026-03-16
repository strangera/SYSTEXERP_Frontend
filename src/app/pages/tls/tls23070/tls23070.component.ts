/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { defer, of } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23070Service } from '../../../service/api/tls/tls23070.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

type SortItem = { field: string; order: 1 | -1 };

@UntilDestroy()
@Component({
  selector: 'app-tls23070',
  templateUrl: './tls23070.component.html',
  styleUrls: ['./tls23070.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    CalendarComponent,
    ButtonModule,
    TableReportComponent,
    DialogComponent,
  ],
})
export class TLS23070Component extends BasicQueryPageComponent<any> {
  // ===== 排序 =====
  sortMeta: SortItem[] = [];
  readonly defaultSort: SortItem[] = [{ field: 'tlt_no', order: 1 }];
  // ✅ 強制重建 table-report 用
mainTableVisible = true;
mainRenderKey = 0;

// ✅ lazy-load 防重打
private mainInFlight = false;
private mainLoadedPages = new Set<number>();

  detailTableVisible = true;
  detailRenderKey = 0;
  mainLoading = false;
  detailLoading = false;

  // ===== 主表資料 =====
  data: any[] = [];
  totalRecords = 0;
  footerData: Record<string, number> = {};
  columns = this.buildMainColumns();

  // ===== 匯出 =====
  btnLoading = false;
  historyRequestBody: any | null = null;

  // ===== 查詢表單 =====
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_Month: [null],
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_no: [],
    tlt_building: [null],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig(this.defaultSort),
  });

  // ===== 下拉 =====
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

  // ===== 後端 totalSummary / subsTotal ↔ 欄位對應 =====
  private detailTotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'totalTotPayAmt',
    TXN_PayAmt10: 'totalPayAmt10',
    TXN_PayAmt41: 'totalPayAmt41',
    TXN_PayAmt42: 'totalPayAmt42',
    TXN_PayAmt12: 'totalPayAmt12',
    TXN_PayAmt81: 'totalPayAmt81',
    TXN_PayAmt43: 'totalPayAmt43',
    TXN_PayAmt44: 'totalPayAmt44',
    TXN_PayAmt14: 'totalPayAmt14',
    TXN_PayAmt82: 'totalPayAmt82',
    TXN_PayAmt52: 'totalPayAmt52',
    TXN_PayAmt20: 'totalPayAmt20',
    TXN_PayAmt62: 'totalPayAmt62',
    TXN_PayAmt77: 'totalPayAmt77',
    TXN_PayAmt71: 'totalPayAmt71',
    TXN_PayAmt30: 'totalPayAmt30',
    TXN_PayAmt73: 'totalPayAmt73',
    TXN_PayAmt72: 'totalPayAmt72',
    TXN_PayAmt74: 'totalPayAmt74',
    TXN_PayAmt75: 'totalPayAmt75',
    TXN_PayAmt76: 'totalPayAmt76',
    TXN_PayAmt24: 'totalPayAmt24',
    TXN_PayAmt25: 'totalPayAmt25',
    TXN_PayAmt07: 'totalPayAmt07',
    TXN_PayAmt55: 'totalPayAmt55',
    TXN_PayAmt83: 'totalPayAmt83',
    TXN_PayAmt78: 'totalPayAmt78',
    TXN_PayAmt79: 'totalPayAmt79',
    TXN_PayAmt21: 'totalPayAmt21',
    TXN_PayAmt53: 'totalPayAmt53',
    TXN_PayAmt56: 'totalPayAmt56',
    TXN_PayAmt57: 'totalPayAmt57',
    TXN_PayAmt58: 'totalPayAmt58',
    TXN_PayAmt59: 'totalPayAmt59',
    TXN_PayAmt60: 'totalPayAmt60',
    TXN_PayAmt22: 'totalPayAmt22',
    TXN_PayAmt23: 'totalPayAmt23',
    TXN_PrePayAmt: 'totalPrePayAmt',
    TXN_OverAmt: 'totalOverAmt',
    TXN_ReturnAmt: 'totalReturnAmt',
    TXN_ExchgAmt: 'totalExchgAmt',
    TXN_CancelAmt: 'totalCancelAmt',
  };

  constructor(
    public tls23070Service: TLS23070Service,
    private counterNameService: CounterNameService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23070', 'tls/tls23070', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map((x) => ({ ...x }));

    // 月份變更 -> 同步日期區間
    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d: Date | null) => {
        if (!d || isNaN(new Date(d).getTime())) return;
        const { start, end } = this.getMonthRange(d);
        this.queryForm.patchValue({ TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 }, { emitEvent: false });
      });

    // 若日期非整月 -> 清空月份
    this.queryForm.controls.TXN_DateStart.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());

    // 下拉
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

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
    pageSize: 30,
    SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
    _nonce: Date.now(),
  };

  this.historyRequestBody = payload;

  // ✅ reset lazy-load 防重打狀態（放這裡）
  this.mainLoadedPages.clear();
  this.mainInFlight = false;

  // 清 UI 狀態
  this.data = [];
  this.totalRecords = 0;
  this.footerData = {};

  // 先重建 table（保留你原本做法）
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

  // ===== 主表 → 明細 Dialog 開啟 =====
// ===== 主表 → 明細 Dialog 開啟 =====
override onDetail(row: any): void {
  this.detailLoadedPages.clear();
this.detailInFlight = false;
  if (!row) return;

  // ✅ 防止連點 / 雙擊 / 同步觸發造成重複打
  if (this.detailLoading) return;

  this.selectedMainRow = row;
  this.dialogVisible = true;

  // ✅ 組 payload：沿用主表查詢條件 + 指定專櫃 + 固定明細排序
  const body: any = {
    ...(this.historyRequestBody ?? {}),

    // 只查該專櫃（後端若吃 array）
    tlt_no: row?.tlt_no ? [row.tlt_no] : undefined,

    pageIndex: 1,
    pageSize: 30,
    SortBy: [{ field: 'TXN_Date', order: 1 }],

    // ✅ 避免快取（看你環境是否需要）
    _nonce: Date.now(),
  };

  this.dialogHistoryRequestBody = body;

  // ✅ 清空舊資料（避免 Dialog 先顯示舊內容）
  this.dialogData = [];
  this.dialogTotalRecords = 0;
  this.dialogFooterData = null;

  this.detailLoading = true;

  this.tls23070Service
    .queryTLS23070Detail(body)
    .pipe(
      finalize(() => {
        this.detailLoading = false;
      }),
    )
    .subscribe({
      next: (res: any) => {
        // ✅ 兼容 Data 可能是 object 或 [object]
        const pack =
          Array.isArray(res?.Data) && res.Data.length > 0
            ? res.Data[0]
            : (res?.Data ?? {});

        const dateSubs = Array.isArray(pack?.dateSubsTotals) ? pack.dateSubsTotals : [];

        // ✅ 轉成表格 rows
        const rows = this.buildDetailRowsFromDateSubsTotals(dateSubs);

        // ✅ 總筆數：優先用後端 TotalCount，其次 pack 內可能也有
        const totalCount =
          typeof res?.TotalCount === 'number'
            ? res.TotalCount
            : (typeof pack?.TotalCount === 'number'
              ? pack.TotalCount
              : rows.length);

        // ✅ Footer：你這張明細是「每日一列」，總計可用 rows 累加
        const grand = this.buildTotalsFromRows(rows);

        this.dialogData = rows;
        this.dialogTotalRecords = totalCount;
        this.dialogFooterData = grand;

        // ✅ 讓 TableReport 的 lastQueryBody 記住狀態（避免內部重新推算錯）
        this.dialogHistoryRequestBody = {
          ...body,
          pageIndex: 1,
          pageSize: 30,
          SortBy: [{ field: 'TXN_Date', order: 1 }],
        };
      },
      error: (err) => {
        console.error('[TLS23070] DETAIL API error', err);
        this.messageService?.warnBubble?.('明細查詢失敗');

        // ✅ 出錯也要收斂狀態
        this.dialogData = [];
        this.dialogTotalRecords = 0;
        this.dialogFooterData = null;
      },
    });
}

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

  // ===== 提供給 app-table-report 的明細查詢（打後端） =====
  public queryTLS23070DetailForReport = (body: any) => {
    return this.loadDialogPage(body);
  };
private detailInFlight = false;
private detailLoadedPages = new Set<number>();
private loadDialogPage(body: any) {
  const normalized = this.normalizePaginationBody(body, [{ field: 'TXN_Date', order: 1 }]);
  const pageIndex = Number(normalized.pageIndex) || 1;
  const pageSize = Number(normalized.pageSize) || 30;

  // ✅ 防止同一頁被重複打
  if (this.detailInFlight || this.detailLoadedPages.has(pageIndex)) {
    return of({
      Data: [],
      TotalCount: this.dialogTotalRecords,
      GrandTotal: this.dialogFooterData ?? {},
      TotalPage: 0,
    });
  }

  this.detailInFlight = true;

  return defer(() => {
    this.detailLoading = true;

    return this.tls23070Service.queryTLS23070Detail(normalized).pipe(
      finalize(() => {
        this.detailLoading = false;
        this.detailInFlight = false;
      }),
      map((res: any) => {
        // ✅ 注意：你這裡原本把 Data 當 object，但 onDetail 又當 pack[0]
        // 這邊也統一成 pack
        const pack =
          Array.isArray(res?.Data) && res.Data.length > 0
            ? res.Data[0]
            : (res?.Data ?? {});

        const dateSubs = Array.isArray(pack?.dateSubsTotals) ? pack.dateSubsTotals : [];
        const pageRows = this.buildDetailRowsFromDateSubsTotals(dateSubs);

        // 後端 total
        let totalCount =
          typeof res?.TotalCount === 'number'
            ? res.TotalCount
            : (typeof pack?.TotalCount === 'number' ? pack.TotalCount : pageRows.length);

        // ✅ 關鍵：空頁 -> 壓成已載入，讓它停
        if (pageRows.length === 0) {
          totalCount = (pageIndex - 1) * pageSize;
        }

        // footer（你目前用 pageRows 累加，OK）
        const grand = this.buildTotalsFromRows(pageRows);

        // ✅ 同步更新 component 端 input（否則 TableReport 仍覺得還有）
        this.dialogTotalRecords = totalCount;
        this.dialogFooterData = grand;

        this.detailLoadedPages.add(pageIndex);

        return { Data: pageRows, TotalCount: totalCount, GrandTotal: grand, TotalPage: res?.TotalPage };
      })
    );
  });
}





  // ===== 匯出 PDF（主表）=====
  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23070Service
      .exporttls23070PDF(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
      });
  }

  // ====== 工具/共用 ======
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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      const encoded = filenameStarMatch[1].trim();
      try {
        return decodeURIComponent(encoded.replace(/^UTF-8''/, ''));
      } catch {
        return encoded;
      }
    }

    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }

  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth();
    const start = new Date(year, month, 1, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return { start, end };
  }

  private clearMonthIfNotExactRange() {
    const start: Date | null = this.queryForm.value.TXN_DateStart ?? null;
    const end: Date | null = this.queryForm.value.TXN_DateEnd ?? null;
    if (!start || !end) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
      return;
    }
    const { start: mStart, end: mEnd } = this.getMonthRange(start);
    const sameStart = new Date(start).getTime() === mStart.getTime();
    const sameEnd = new Date(end).getTime() === mEnd.getTime();
    if (!sameStart || !sameEnd) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
    }
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatYMD(val: unknown): string {
    if (val == null) return '';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = val.getDate().toString().padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    const s = String(val);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = dt.getDate().toString().padStart(2, '0');
      return `${y}/${mm}/${dd}`;
    }
    return s;
  }

  private moneyFormat(value: number): string {
    return value != null ? Number(value || 0).toLocaleString('en-US') : '0';
  }

  private numericFields(): string[] {
    return Object.keys(this.detailTotalFieldMap);
  }

  /** 從 totalSummary 取得 Grand Total（主表 footer 用） */
  private buildGrandTotalFromSummary(summary: any): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [field, apiKey] of Object.entries(this.detailTotalFieldMap)) {
      out[field] = Number(summary?.[apiKey] ?? 0);
    }
    return out;
  }

  /** 主表：tltNoSubTotals[] → 一列一個專櫃（完全吃後端順序） */
  private buildMainRowsFromSubTotals(tltNoSubTotals: any[]): any[] {
    const groups = Array.isArray(tltNoSubTotals) ? tltNoSubTotals : [];
    const fields = this.numericFields();
    const rows: any[] = [];

    for (const g of groups) {
      const tltNo = g?.tlt_no ?? '';

      const row: any = {
        _rowKey: tltNo,
        tlt_no: tltNo,
        tlt_name: g?.tlt_name ?? '',
      };

      for (const f of fields) {
        const apiKey = this.detailTotalFieldMap[f];
        let tltKey = apiKey;
        if (apiKey.startsWith('total')) {
          tltKey = 'tltNoTotal' + apiKey.substring('total'.length);
        }
        row[f] = Number(g?.[tltKey] ?? 0);
      }

      rows.push(row);
    }

    return rows;
  }

  /** 明細：dateSubsTotals[] → 每日金額一列 */
  private buildDetailRowsFromDateSubsTotals(dateSubsTotals: any[]): any[] {
    const subs = Array.isArray(dateSubsTotals) ? dateSubsTotals : [];
    const fields = this.numericFields();
    const rows: any[] = [];

    for (const s of subs) {
      const dateStr = this.toDateOnly(s?.TXN_Date);
      const row: any = {
        TXN_Date: dateStr,
      };

      for (const f of fields) {
        const apiKey = this.detailTotalFieldMap[f];
        let subsKey = apiKey;
        if (apiKey.startsWith('total')) {
          subsKey = 'subsTotal' + apiKey.substring('total'.length);
        }
        row[f] = Number(s?.[subsKey] ?? 0);
      }

      row._rowKey = `${s?.tlt_no ?? ''}|${dateStr ?? ''}`;
      rows.push(row);
    }

    return rows;
  }

public queryTLS23070MainForReport = (body: any) => {
  const normalized = this.normalizePaginationBody(body, this.defaultSort);
  const pageIndex = Number(normalized.pageIndex) || 1;
  const pageSize = Number(normalized.pageSize) || 30;

  // ✅ 防止同一頁被重複打（TableReport 有時會抖動）
  if (this.mainInFlight || this.mainLoadedPages.has(pageIndex)) {
    // 直接回空資料，避免重複 call
    return of({ Data: [], TotalCount: this.totalRecords, GrandTotal: this.footerData, TotalPage: 0 });
  }

  this.mainInFlight = true;

  return defer(() =>
    this.tls23070Service.queryTLS23070(normalized).pipe(
      finalize(() => (this.mainInFlight = false)),
      map((res: any) => {
        const pack =
          Array.isArray(res?.Data) && res.Data.length > 0
            ? res.Data[0]
            : (res?.Data ?? {});

        const tltNoSubTotals = Array.isArray(pack?.tltNoSubTotals) ? pack.tltNoSubTotals : [];
        const pageRows = this.buildMainRowsFromSubTotals(tltNoSubTotals);

        const totalSummary = pack?.totalSummary ?? {};
        const grand = this.buildGrandTotalFromSummary(totalSummary);

        // 後端 total
        let totalCount =
          typeof res?.TotalCount === 'number'
            ? res.TotalCount
            : (typeof pack?.TotalCount === 'number' ? pack.TotalCount : pageRows.length);

        // ✅ 關鍵：如果這一頁回空，代表其實沒更多資料了
        // 把 TotalCount 壓成已載入筆數，讓 TableReport 停止再要下一頁
        if (pageRows.length === 0) {
          totalCount = (pageIndex - 1) * pageSize;
        }

        // ✅ 同步更新 component 端 input（否則會無限打）
        this.totalRecords = totalCount;
        this.footerData = grand;

        this.mainLoadedPages.add(pageIndex);

        return { Data: pageRows, TotalCount: totalCount, GrandTotal: grand, TotalPage: res?.TotalPage };
      })
    )
  );
};
onExportExcel(): void {
  if (!this.historyRequestBody) {
    this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
    return;
  }

  this.btnLoading = true;
  const body = this.buildExportBody();

  this.tls23070Service
    .exportTLS23070Excel(body)
    .pipe(finalize(() => (this.btnLoading = false)))
    .subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx'),
      error: () => this.messageService?.warnBubble?.('EXCEL 匯出失敗。'),
    });
}
  private buildTotalsFromRows(rows: any[]): Record<string, number> {
    const fields = this.numericFields();
    const out: Record<string, number> = {};
    for (const f of fields) out[f] = 0;
    for (const r of rows) {
      for (const f of fields) out[f] += Number(r?.[f] ?? 0);
    }
    return out;
  }

  private normalizePaginationBody(raw: any, fallbackSort: SortItem[]) {
    const pageSize = Number(raw?.pageSize ?? raw?.rows ?? 30) || 30;

    let pageIndex = Number(raw?.pageIndex);
    if (!pageIndex || pageIndex < 1) {
      const first = Number(raw?.first ?? 0) || 0;
      pageIndex = Math.floor(first / pageSize) + 1;
    }

    let sortBy: SortItem[] | undefined = raw?.SortBy;
    if (!Array.isArray(sortBy) || !sortBy.length) {
      const msm = raw?.multiSortMeta;
      if (Array.isArray(msm) && msm.length) {
        sortBy = msm.map((x: any) => ({ field: x.field, order: x.order }));
      }
    }
    if (!Array.isArray(sortBy) || !sortBy.length) sortBy = fallbackSort;

    return {
      ...raw,
      pageSize,
      pageIndex,
      SortBy: sortBy,
    };
  }

  // ===== 欄位 =====
  private buildMainColumns() {
    return [
      { field: 'tlt_no', header: '專櫃編號', visible: true },
      { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

      { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    ];
  }

  detailColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: any) => this.formatYMD(v) },

    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
  ];
}