/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23130Service } from '../../../service/api/tls/tls23130.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { RegionService } from '../../../service/basic/querySYS3A00.service';
import { BigCategoryCodeService } from '../../../service/basic/queryTLTBUSTYPE.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatAmount,
  formatDate,
  formatTime,
  ReportColumn
} from '../../../shared/componentkit/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23130',
  templateUrl: './tls23130.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextModule,
    ButtonComponent, TranslateModule, ButtonModule, TableReportComponent,
  ],
})
export class TLS23130Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;
  columns: ReportColumn[] = [];

  private grandTotal: Record<string, number> = {};
  groupSubtotals: Record<string, Record<string, number>> = {};

  readonly groupByField = 'CRD_No';
  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 },
    { field: 'TXN_Date', order: 1 },
    { field: 'CRD_No', order: 1 },
  ];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 (符合 1000 規格與頁碼 1 起始) =====
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    BNK_No: [null as string | null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    pageSize: [1000],  // ⬅️ 調整為 1000 規格
    PageSize: [1000],  // 大寫保底
    pageIndex: [1],    // ⬅️ 調整初始頁碼為 1
    PageIndex: [1],    // 大寫保底
    SortBy: [[{ field: this.groupByField, order: 1 }, { field: 'TXN_Date', order: 1 }, { field: 'CRD_No', order: 1 }]],
  });

  // ===== 下拉選項選單記憶體 =====
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  CounterOptions: any[] = [];
  bus_typeOptions: any[] = [];

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23130Service: TLS23130Service,
    private readonly regionService: RegionService,
    private readonly floorService: FloorService,
    private readonly counterNameService: CounterNameService,
    private readonly bigCategoryCodeService: BigCategoryCodeService,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23130', 'tls/tls23130', this.queryForm, (form) => this.onSubmit(form));

    this.columns = this.buildColumns();

    this.initDropdownData();
    this.initBankDropdown();
  }

  /**
   * 初始化基礎下拉選單資料 (forkJoin 聲明式載入優化)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      regions: this.regionService.getRegionOptions().pipe(catchError(() => of([]))),
      floors: this.floorService.getFloors().pipe(catchError(() => of([]))),
      busTypes: this.bigCategoryCodeService.getSystemTypes().pipe(catchError(() => of([]))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      orgs: this.tls11010Service.getOrgOptions().pipe(catchError(() => of([]))),
      counters: this.counterNameService.getCounters().pipe(catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
      this.regionOptions = res.regions || [];
      this.floorOptions = res.floors || [];
      this.BUILDING_NO_Options = res.buildings || [];

      this.bus_typeOptions = (res.busTypes || []).map((x: any) => ({
        label: x.label,
        formLabel: x.label,
        value: x.value,
      }));

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      });

      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
      this.CounterOptions = (res.counters || []).map(mapStandardOption);
    });
  }

  /**
   * 初始化銀行專用卡種下拉選單
   */
  private initBankDropdown(): void {
    this.tls23130Service.queryAPS1001_DropDownList({ SearchKeyword: '' })
      .pipe(
        untilDestroyed(this),
        map(res => (Array.isArray(res?.Data) ? res.Data : [])),
        map(list => list.map((x: any) => {
          const v = String(x.No ?? x.BNK_No ?? '');
          const l = String(x.Name ?? x.BankName ?? '');
          return { label: `${v} - ${l}`, value: v, formLabel: `${v} - ${l}` };
        })),
        catchError(err => {
          console.error('queryAPS1001_DropDownList 失敗', err);
          return of([] as any[]);
        })
      )
      .subscribe(opts => {
        this.cardTypeOptions = opts;
      });
  }

  // ========= 查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const asArr = (x: any) => Array.isArray(x) ? x : (x == null || x === '' ? undefined : [x]);

      const payload: any = {
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
        BNK_No: (typeof val?.BNK_No === 'string' && val.BNK_No !== '') ? val.BNK_No : undefined,
        tlt_building: val?.tlt_building ?? undefined,
        tlt_floor: asArr(val?.tlt_floor),
        org_id: asArr(val?.org_id),
        pageSize: 1000,  // ⬅️ 調整為全域指定之 1000 規格
        PageSize: 1000,
        SortBy: this.dedupeSortMeta(this.defaultSort),
      };

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) {
          delete payload[k];
        }
      });

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23130Service.queryTLS23130(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          })
        )
        .subscribe({
          next: (res: any) => {
            const mapped = this.mapResponseToRowsAndTotals(res);
            this.data = mapped.rows;
            this.totalRecords = mapped.totalRecords;
            this.groupSubtotals = mapped.groupSub;
            this.grandTotal = mapped.grand;
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.groupSubtotals = {};
            this.grandTotal = {};
          },
        });
    });
  }

  // ========= <app-table-report> 查詢封裝調用（支援 1000 規格分頁滾動與雙層合計機制） =========
  public queryTLS23130ForReport = (body: any) => {
    return this.tls23130Service.queryTLS23130({
      ...(body || {}),
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
      pageSize: body?.pageSize ?? 1000, // ⬅️ 固定 1000 規格
      PageSize: body?.pageSize ?? 1000,
      SortBy: this.dedupeSortMeta((body && body.SortBy) || this.defaultSort),
    }).pipe(
      map((res: any) => {
        const { rows, totalRecords, grand, groupSub } = this.mapResponseToRowsAndTotals(res);
        this.grandTotal = { ...grand };
        this.groupSubtotals = { ...groupSub };
        return { Data: rows, TotalCount: totalRecords, GrandTotal: grand, GroupSubtotals: groupSub };
      })
    );
  };

  // ========= 共同轉換工廠：精算 rows / 總計 / 分組小計數據鏈 =========
  private mapResponseToRowsAndTotals(res: any) {
    const wrappers: any[] = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
    const rows: any[] = [];
    const groupSub: Record<string, Record<string, number>> = {};
    let wrapTotalPay = 0;
    let sumPay = 0, sumHead = 0, sumEach = 0;

    for (const w of wrappers) {
      wrapTotalPay += Number(w?.TotalPayAmt ?? 0);
      const details = Array.isArray(w?.tLS23130_Details) ? w.tLS23130_Details : [];
      for (const it of details) {
        const rec = { ...it } as any;
        const dateKey = String(rec.TXN_Date ?? '').slice(0, 19);
        rec._rowKey = `${dateKey}|${rec.CRD_No ?? ''}|${rec.tlt_no ?? ''}`;

        const pay = Number(rec.TXN_PayAmt ?? 0);
        const head = Number(rec.EDC_InstHeadAmt ?? 0);
        const each = Number(rec.EDC_InstEachAmt ?? 0);

        if (Number.isFinite(pay)) sumPay += pay;
        if (Number.isFinite(head)) sumHead += head;
        if (Number.isFinite(each)) sumEach += each;

        const gk = String(rec[this.groupByField] ?? 'UNKNOWN');
        const g = groupSub[gk] ?? { TXN_PayAmt: 0, EDC_InstHeadAmt: 0, EDC_InstEachAmt: 0 };

        g['TXN_PayAmt'] = (g['TXN_PayAmt'] ?? 0) + (Number.isFinite(pay) ? pay : 0);
        g['EDC_InstHeadAmt'] = (g['EDC_InstHeadAmt'] ?? 0) + (Number.isFinite(head) ? head : 0);
        g['EDC_InstEachAmt'] = (g['EDC_InstEachAmt'] ?? 0) + (Number.isFinite(each) ? each : 0);
        groupSub[gk] = g;

        rows.push(rec);
      }
    }

    const totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;
    const grand = {
      TXN_PayAmt: (wrapTotalPay > 0 ? wrapTotalPay : sumPay),
      EDC_InstHeadAmt: sumHead,
      EDC_InstEachAmt: sumEach,
    };

    return { rows, totalRecords, grand, groupSub };
  }

  // ========= 檔案匯出維護機制 =========
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23130Service.exporttls23130PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
      });
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
      try { return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  private dedupeSortMeta(meta: { field?: string; order?: 1 | -1 }[] = []) {
    const seen = new Set<string>();
    const result: { field: string; order: 1 | -1 }[] = [];
    for (let i = meta.length - 1; i >= 0; i--) {
      const f = (meta[i]?.field || '').trim();
      if (!f) continue;
      const key = f.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.unshift({ field: f, order: meta[i]?.order === -1 ? -1 : 1 });
    }
    return result;
  }

  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) footer[col.field] = this.grandTotal[col.field] ?? 0;
    }
    return footer;
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且校正對齊) =====
  private buildColumns(): ReportColumn[] {
    return [
      { field: 'CRD_No', header: '卡號', visible: true },
      { field: 'tlt_no', header: '專櫃編號', visible: true },
      { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
      { field: 'TXN_PayAmt', header: '金額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
      { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
      { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
      { field: 'TXN_Time', header: '銷售時間', visible: true, format: formatTime },
      { field: 'TERM_No', header: '分期數', visible: true },
      { field: 'EDC_InstHeadAmt', header: '頭期', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
      { field: 'EDC_InstEachAmt', header: '每期', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    ];
  }
}
