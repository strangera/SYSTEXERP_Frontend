/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23070Service } from '../../../service/api/tls/tls23070.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ButtonModule } from 'primeng/button';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  createPaginationConfig,
} from '../../../shared/componentkit/table/table.model';

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
  // ===== 排序（先宣告，避免 TS2729）=====
  sortMeta: SortItem[] = [];
  readonly defaultSort: SortItem[] = [
    { field: 'tlt_no', order: 1 },
    { field: 'ECR_No', order: 1 },
  ];

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
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    tlt_no:        [],
    tlt_building:  [null],
    tlt_floor:     [],
    org_id:        [],
    ...createPaginationConfig(this.defaultSort),
  });

  // ===== 下拉 =====
  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  // ===== 明細 Dialog 狀態 =====
  dialogVisible = false;
  dialogLoading = false;
  selectedMainRow: any | null = null;
  dialogData: any[] = [];
  dialogTotalRecords = 0;
  dialogFooterData: Record<string, number> | null = null;
  dialogHistoryRequestBody: any | null = null;

  // ===== 解析暫存（主查詢結果）=====
  private lastWrapper: any | null = null;

  // 後端 totalSummary ↔ 欄位對應
  private detailTotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'totalTotPayAmt',
    TXN_PayAmt10:  'totalPayAmt10',
    TXN_PayAmt41:  'totalPayAmt41',
    TXN_PayAmt42:  'totalPayAmt42',
    TXN_PayAmt12:  'totalPayAmt12',
    TXN_PayAmt81:  'totalPayAmt81',
    TXN_PayAmt43:  'totalPayAmt43',
    TXN_PayAmt44:  'totalPayAmt44',
    TXN_PayAmt14:  'totalPayAmt14',
    TXN_PayAmt82:  'totalPayAmt82',
    TXN_PayAmt52:  'totalPayAmt52',
    TXN_PayAmt20:  'totalPayAmt20',
    TXN_PayAmt62:  'totalPayAmt62',
    TXN_PayAmt77:  'totalPayAmt77',
    TXN_PayAmt71:  'totalPayAmt71',
    TXN_PayAmt30:  'totalPayAmt30',
    TXN_PayAmt73:  'totalPayAmt73',
    TXN_PayAmt72:  'totalPayAmt72',
    TXN_PayAmt74:  'totalPayAmt74',
    TXN_PayAmt75:  'totalPayAmt75',
    TXN_PayAmt76:  'totalPayAmt76',
    TXN_PayAmt24:  'totalPayAmt24',
    TXN_PayAmt25:  'totalPayAmt25',
    TXN_PayAmt07:  'totalPayAmt07',
    TXN_PayAmt55:  'totalPayAmt55',
    TXN_PayAmt83:  'totalPayAmt83',
    TXN_PayAmt78:  'totalPayAmt78',
    TXN_PayAmt79:  'totalPayAmt79',
    TXN_PayAmt21:  'totalPayAmt21',
    TXN_PayAmt53:  'totalPayAmt53',
    TXN_PayAmt56:  'totalPayAmt56',
    TXN_PayAmt57:  'totalPayAmt57',
    TXN_PayAmt58:  'totalPayAmt58',
    TXN_PayAmt59:  'totalPayAmt59',
    TXN_PayAmt60:  'totalPayAmt60',
    TXN_PayAmt22:  'totalPayAmt22',
    TXN_PayAmt23:  'totalPayAmt23',
    TXN_PrePayAmt: 'totalPrePayAmt',
    TXN_OverAmt:   'totalOverAmt',
    TXN_ReturnAmt: 'totalReturnAmt',
    TXN_ExchgAmt:  'totalExchgAmt',
    TXN_CancelAmt: 'totalCancelAmt',
  };

  constructor(
    // ⬇⬇⬇ 這裡改成 public，讓 template 能夠取用
    public tls23070Service: TLS23070Service,
    private counterNameService: CounterNameService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service,
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
        this.queryForm.patchValue(
          { TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 },
          { emitEvent: false }
        );
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
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
  }

  // ===== 主查詢（按鈕）— 固定 pageSize=30 =====
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const payload: any = {
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
        TXN_DateEnd:   this.toDateOnly(val?.TXN_DateEnd),
        tlt_no:        Array.isArray(val?.tlt_no) && val.tlt_no.length ? val.tlt_no : undefined,
        tlt_building:  val?.tlt_building ?? undefined,
        tlt_floor:     Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
        org_id:        Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
        pageIndex:     Number(val?.pageIndex) || 1,
        pageSize:      30,
        SortBy:        Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23070Service
        .queryTLS23070(payload)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          })
        )
        .subscribe({
          next: (res: any) => {
            const wrapper = this.pickWrapper(res?.Data);
            this.lastWrapper = wrapper; // 暫存給明細使用

            // 主表：彙總到 (tlt_no + tlt_name + ECR_No)
            const mainRows = this.buildMainRowsFromWrapper(wrapper);
            this.data = mainRows;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;

            // Grand Total
            const totalSummary = wrapper?.totalSummary ?? {};
            this.footerData = this.buildGrandTotalFromSummary(totalSummary);
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.footerData = {};
            this.lastWrapper = null;
          },
        });
    });
  }

  // ===== 主表 → 明細 Dialog 開啟 =====
  override onDetail(row: any): void {
    if (!this.lastWrapper) return;

    this.selectedMainRow = row;
    this.dialogVisible = true;
    this.dialogLoading = true;

    // 給 dialog 的 lastQueryBody（僅記錄/翻頁參數）
    this.dialogHistoryRequestBody = {
      ...(this.historyRequestBody ?? {}),
      tlt_no: row?.tlt_no ? [row.tlt_no] : undefined,
      ECR_NoList: row?.ECR_No ? [row.ECR_No] : undefined,
      pageIndex: 1,
      pageSize: 30,
      SortBy: [{ field: 'TXN_Date', order: 1 }],
    };

    const all = this.buildDetailRowsForSelection();
    this.dialogFooterData = this.buildTotalsFromRows(all);
    this.dialogTotalRecords = all.length;
    this.dialogData = all.slice(0, 30);

    this.dialogLoading = false;
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

  // ===== 提供給 app-table-report 的明細查詢（客端分頁）=====
  public queryTLS23070DetailForReport = (body: any) => {
    const rows = this.buildDetailRowsForSelection();
    const total = rows.length;
    const pageSize = Number(body?.pageSize) || 30;
    const pageIndex = Number(body?.pageIndex) || 1;
    const start = (pageIndex - 1) * pageSize;
    const page = rows.slice(start, start + pageSize);
    const grand = this.buildTotalsFromRows(rows);
    this.dialogFooterData = grand; // 給 footerData 維持同步
    return of({ Data: page, TotalCount: total, GrandTotal: grand });
  };

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
      try { return decodeURIComponent(encoded.replace(/^UTF-8''/, '')); } catch { return encoded; }
    }

    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' ')); } catch { return filenameMatch[1]; }
    }

    return `download${defaultExtension}`;
  }

  private pickWrapper(data: any): any {
    return Array.isArray(data) ? (data[0] ?? {}) : (data ?? {});
  }

  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth();
    const start = new Date(year, month, 1, 0, 0, 0);
    const end   = new Date(year, month + 1, 0, 23, 59, 59);
    return { start, end };
  }

  private clearMonthIfNotExactRange() {
    const start: Date | null = this.queryForm.value.TXN_DateStart ?? null;
    const end: Date | null   = this.queryForm.value.TXN_DateEnd ?? null;
    if (!start || !end) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
      return;
    }
    const { start: mStart, end: mEnd } = this.getMonthRange(start);
    const sameStart = new Date(start).getTime() === mStart.getTime();
    const sameEnd   = new Date(end).getTime()   === mEnd.getTime();
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
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    const s = String(val);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
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

  private buildGrandTotalFromSummary(summary: any): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [field, apiKey] of Object.entries(this.detailTotalFieldMap)) {
      out[field] = Number(summary?.[apiKey] ?? 0);
    }
    return out;
  }

  /** 主表：把所有明細彙總到 (tlt_no + tlt_name + ECR_No) */
  private buildMainRowsFromWrapper(wrapper: any): any[] {
    const groups = Array.isArray(wrapper?.tltNoSubTotals) ? wrapper.tltNoSubTotals : [];
    const allSubs = groups.flatMap((g: any) => Array.isArray(g?.subsTotals) ? g.subsTotals : []);
    const details = allSubs.flatMap((s: any) =>
      s?.tLS23070Details ?? s?.TLS23070Details ?? s?.tls23070Details ?? []
    );

    const keyMap = new Map<string, any>();
    const fields = this.numericFields();

    for (const r of details) {
      const k = `${r?.tlt_no ?? ''}|${r?.tlt_name ?? ''}|${r?.ECR_No ?? ''}`;
      if (!keyMap.has(k)) {
        const base: any = {
          tlt_no: r?.tlt_no ?? '',
          tlt_name: r?.tlt_name ?? '',
          ECR_No: r?.ECR_No ?? '',
          _rowKey: k,
        };
        for (const f of fields) base[f] = 0;
        keyMap.set(k, base);
      }
      const agg = keyMap.get(k)!;
      for (const f of fields) {
        agg[f] = Number(agg[f] ?? 0) + Number(r?.[f] ?? 0);
      }
    }

    // 排序：依預設 sort
    const rows = Array.from(keyMap.values());
    rows.sort((a, b) => {
      for (const s of this.defaultSort) {
        const av = a[s.field] ?? '';
        const bv = b[s.field] ?? '';
        if (av === bv) continue;
        return (av > bv ? 1 : -1) * (s.order as number);
      }
      return 0;
    });
    return rows;
  }

  /** 明細：依主表選取的 (tlt_no + ECR_No) 取出所有日期層的明細 */
  private buildDetailRowsForSelection(): any[] {
    if (!this.lastWrapper || !this.selectedMainRow) return [];
    const { tlt_no, ECR_No } = this.selectedMainRow;
    const groups = Array.isArray(this.lastWrapper?.tltNoSubTotals) ? this.lastWrapper.tltNoSubTotals : [];
    const fields = this.numericFields();

    const rows: any[] = [];
    for (const g of groups) {
      if (g?.tlt_no !== tlt_no) continue;
      const subs = Array.isArray(g?.subsTotals) ? g.subsTotals : [];
      for (const s of subs) {
        const dets = s?.tLS23070Details ?? s?.TLS23070Details ?? s?.tls23070Details ?? [];
        for (const r of dets) {
          if (r?.ECR_No !== ECR_No) continue;
          const out: any = {};
          out.TXN_Date = this.toDateOnly(r?.TXN_Date); // 明細要有銷售日期
          for (const f of fields) {
            out[f] = Number(r?.[f] ?? 0);
          }
          out._rowKey = `${tlt_no}|${ECR_No}|${out.TXN_Date}`;
          rows.push(out);
        }
      }
    }

    // 依日期排序
    rows.sort((a, b) => (a.TXN_Date > b.TXN_Date ? 1 : a.TXN_Date < b.TXN_Date ? -1 : 0));
    return rows;
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

  // ===== 欄位 =====
  private buildMainColumns() {
    // 主表：不顯示銷售日期，顯示 tlt_no / tlt_name / ECR_No + 金額欄位
    return [
      { field: 'ECR_No',   header: '收銀機號', visible: true },
      { field: 'tlt_no',   header: '專櫃編號', visible: true },
      { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

      { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt43', header: '中信連線',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt44', header: '中信離線',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt14', header: '中信紅利',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt52', header: '一卡通',       visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt20', header: '禮券',       visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt71', header: '商品抵用券',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt75', header: '折價券',       visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt76', header: '現抵',         visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt24', header: '禮券餘代卡',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt55', header: 'LINE Pay',         visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場',  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt21', header: 'APP禮券',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt53', header: '悠遊卡',                  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt57', header: '台灣Pay',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt58', header: '南紡錢包',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt59', header: '即享券',                  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt60', header: '喜客券',                  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_PayAmt23', header: '外來禮券-高夢',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

      { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_OverAmt',   header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      { field: 'TXN_ExchgAmt',  header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
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
    { field: 'TXN_PayAmt43', header: '中信連線',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通',       visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt20', header: '禮券',       visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券',       visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵',         visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt24', header: '禮券餘代卡',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt55', header: 'LINE Pay',         visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場',  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt53', header: '悠遊卡',                  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券',                  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券',                  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_OverAmt',   header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_ExchgAmt',  header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
  ];
}
