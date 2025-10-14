/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { RegionService } from '../../../service/basic/region-code.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23130Service } from '../../../service/api/tls/tls23130.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { of, map, catchError, finalize } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls23130',
  templateUrl: './tls23130.component.html',
  styleUrls: ['./tls23130.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    DropdownComponent,
    MultiSelectComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    TableReportComponent, // ✅ 改用 app-table-report
  ],
})
export class TLS23130Component extends BasicQueryPageComponent<any> {
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
groupSubtotals: Record<string, Record<string, number>> = {};  // ⬅️ 新增
  data: any[] = [];
  totalRecords = 0;

  btnLoading = false;
  historyRequestBody: any | null = null;

  // 排序狀態（先按群組欄位 tlt_no，再日期/卡號）
  readonly groupByField = 'CRD_No';
  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 },
    { field: 'TXN_Date', order: 1 },
    { field: 'CRD_No', order: 1 },
  ];

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    // 單選：string（必填）
    BNK_No: this.formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tlt_building: [],
    tlt_floor:    [],
    org_id:       [],
    // 仍保留 createPaginationConfig 讓排序初始值存在（實際發送固定 pageSize=30）
    ...createPaginationConfig([
      { field: this.groupByField, order: 1 },
      { field: 'TXN_Date', order: 1 },
      { field: 'CRD_No', order: 1 },
    ]),
  });

  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  whetherOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  CounterOptions: any[] = [];
  bus_typeOptions: any[] = [];

  constructor(
    private tls23130Service: TLS23130Service,
    private regionService: RegionService,
    private cardTypeService: CardTypeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private whetherService: WhetherService,
    private floorService: FloorService,
    private counterNameService: CounterNameService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23130', 'tls/tls23130', this.queryForm, (form) => this.onSubmit(form));

    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(res => {
      this.bus_typeOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: x.label, value: x.value,
      }));
    });
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });

    // 銀行下拉（單選字串）— 預設帶入第一筆
    this.tls23130Service
      .queryAPS1001_DropDownList({ SearchKeyword: '' })
      .pipe(
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
        if (opts.length > 0) {
          const ctrl = this.queryForm.get('BNK_No') as FormControl<string>;
          ctrl.setValue(opts[0].value);
          ctrl.updateValueAndValidity({ onlySelf: true });
        }
      });
  }

  // ===== 查詢（固定 pageSize=30；PageSize=30）=====
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const toIso = (x: any) => {
        if (!x) return undefined;
        const d = typeof x === 'string' ? new Date(x) : (x as Date);
        if (isNaN(d.getTime())) return undefined;
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString().slice(0, 19);
      };
      const asArr = (x: any) => Array.isArray(x) ? x : (x == null || x === '' ? undefined : [x]);

      const payload: any = {
        TXN_DateStart: toIso(val?.TXN_DateStart),
        TXN_DateEnd:   toIso(val?.TXN_DateEnd),
        BNK_No:        (typeof val?.BNK_No === 'string' && val.BNK_No !== '') ? val.BNK_No : undefined,
        tlt_building:  val?.tlt_building ?? undefined,
        tlt_floor:     asArr(val?.tlt_floor),
        org_id:        asArr(val?.org_id),

        // ✅ 固定 30（大小寫都帶）
        pageSize: 30,
        PageSize: 30,

        // 排序使用預設
       SortBy: this.dedupeSortMeta(this.defaultSort),
      };

      // 清除空值
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      // 提供給 app-table-report 的 lastQueryBody
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23130Service.queryTLS23130(payload).pipe(
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res: any) => {
          const mapped = this.mapResponseToRowsAndTotals(res);
          this.data = mapped.rows;
          this.totalRecords = mapped.totalRecords;
           this.groupSubtotals = mapped.groupSub;  
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.groupSubtotals = {};  
        },
      });
    });
  }
  private dedupeSortMeta(meta: Array<{ field?: string; order?: 1 | -1 }> = []) {
  // 後者優先：若同欄位多次出現，保留最後一次的設定
  const seen = new Set<string>();
  const result: Array<{ field: string; order: 1 | -1 }> = [];
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


  // ===== 提供給 app-table-report 的查詢函式（固定 pageSize=30；回傳 GrandTotal/GroupSubtotals）=====
public queryTLS23130ForReport = (body: any) =>
  this.tls23130Service
    .queryTLS23130({
      ...(body || {}),
      pageSize: 30,
      PageSize: 30,
      // 若外部有 SortBy 就去重；沒有就用預設
      SortBy: this.dedupeSortMeta((body && body.SortBy) || this.defaultSort),
    })
    .pipe(
      map((res: any) => {
        const { rows, totalRecords, grand, groupSub } = this.mapResponseToRowsAndTotals(res);
        return { Data: rows, TotalCount: totalRecords, GrandTotal: grand, GroupSubtotals: groupSub };
      })
    );

  // ===== 共同轉換器：把 API 轉 rows / totals / 小計 =====
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

      // 穩定 rowKey
      const dateKey = String(rec.TXN_Date ?? '').slice(0, 19);
      rec._rowKey = `${dateKey}|${rec.CRD_No ?? ''}|${rec.tlt_no ?? ''}`;

      // 欄位數值
      const pay  = Number(rec.TXN_PayAmt ?? 0);
      const head = Number(rec.EDC_InstHeadAmt ?? 0);
      const each = Number(rec.EDC_InstEachAmt ?? 0);
      sumPay  += Number.isFinite(pay)  ? pay  : 0;
      sumHead += Number.isFinite(head) ? head : 0;
      sumEach += Number.isFinite(each) ? each : 0;

      // 小計（by tlt_no）
      const gk = String(rec.tlt_no ?? 'UNKNOWN');
      const g  = groupSub[gk] ?? { TXN_PayAmt: 0, EDC_InstHeadAmt: 0, EDC_InstEachAmt: 0 };

      // ✅ 改用中括號，避免 TS4111
      g['TXN_PayAmt']      = (g['TXN_PayAmt']      ?? 0) + (Number.isFinite(pay)  ? pay  : 0);
      g['EDC_InstHeadAmt'] = (g['EDC_InstHeadAmt'] ?? 0) + (Number.isFinite(head) ? head : 0);
      g['EDC_InstEachAmt'] = (g['EDC_InstEachAmt'] ?? 0) + (Number.isFinite(each) ? each : 0);

      groupSub[gk] = g;

      rows.push(rec);
    }
  }

  const totalRecords =
    typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

  // GrandTotal（優先採用 wrapper 的 TotalPayAmt 聚合）
  const grand = {
    TXN_PayAmt:      (wrapTotalPay > 0 ? wrapTotalPay : sumPay),
    EDC_InstHeadAmt: sumHead,
    EDC_InstEachAmt: sumEach,
  };

  return { rows, totalRecords, grand, groupSub };
}


  // ===== 匯出：PDF（不傳 pageSize/pageIndex；含大小寫） =====
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    // 刪除大小寫 pageSize/pageIndex
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    const body = this.buildExportBody();
    this.btnLoading = true;
    this.tls23130Service.exporttls23130PDF(body).pipe(
      finalize(() => (this.btnLoading = false))
    ).subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
      error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
    });
  }

  // ===== 通用下載處理 =====
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

    // RFC 5987: filename*
    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch[1]) {
      const encoded = filenameStarMatch[1].trim();
      try {
        return decodeURIComponent(encoded.replace(/^UTF-8''/, ''));
      } catch {
        return encoded;
      }
    }

    // filename="xxx"
    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch && filenameMatch[1]) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }
    return `download${defaultExtension}`;
  }

  // ===== 顯示格式工具 =====
  formatYMD = (val: unknown): string => {
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
  };

  moneyFormat = (value: any): string =>
    value == null || value === '' ? '' : Number(value).toLocaleString('en-US');

  formatISOToHHMMSS = (val: string): string => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    return `${hh}:${mm}:${ss}`;
  };

  // ===== 表格欄位（標記 isTotal/isSubTotal：app-table-report 可用於總計/小計顯示）=====
  columns = [
    { field: 'CRD_No', header: '卡號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'EDC_InstHeadAmt', header: '頭期', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'EDC_InstEachAmt', header: '每期', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_Date', header: '銷售日期', visible: true, format: this.formatYMD },
    { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '銷售時間', visible: true, format: this.formatISOToHHMMSS },
    { field: 'TERM_No', header: '分期數', visible: true },
  ];
}
