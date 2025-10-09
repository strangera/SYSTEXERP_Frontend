/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TLS23100Service } from '../../../service/api/tls/tls23100.service';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import {  finalize, map } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-tls23100',
  templateUrl: './tls23100.component.html',
  styleUrls: ['./tls23100.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    // DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    Table2Component, // ✅ 使用 table2 才能顯示總計/小計
    ButtonModule,
  ]
})
export class TLS23100Component extends BasicQueryPageComponent<any> {
  // 資料
  data: any[] = [];
  totalRecords = 0;

  // 預設日期（昨天）
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 群組欄位（小計依此欄位）
  readonly groupByField = 'tlt_no';
    btnLoading = false;
  historyRequestBody: any | null = null;

  // --- 排序狀態（群組欄位一定放第一個，避免切段）---
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 }, // ⬅️ 一定要第一個
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];

  /** 去抖動 + 防重複查詢 */
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  /** 後端需要分頁/排序參數（✅ 不傳 Offset / OrderBy） */
  private readonly includePagingAndSorting = true;
  private normalizeSort(sortBy: any[] | undefined): { field: string; order: 1 | -1 }[] {
  const list = Array.isArray(sortBy) ? [...sortBy] : [];
  // 轉字串 + 限定 order 僅 1/-1
  const cleaned = list
    .map(s => ({
      field: Array.isArray(s?.field) ? String(s.field[0] ?? '') : String(s?.field ?? ''),
      order: (s?.order === -1 ? -1 : 1) as 1 | -1,
    }))
    .filter(s => !!s.field);

  // 群組欄位優先，且去重複
  const g = this.groupByField;
  const seen = new Set<string>();
  const ensureGroupFirst = [
    { field: g, order: (cleaned.find(s => s.field === g)?.order ?? 1) as 1 | -1 },
    ...cleaned.filter(s => s.field !== g),
  ].filter(s => {
    if (seen.has(s.field)) return false;
    seen.add(s.field);
    return true;
  });

  return ensureGroupFirst;
}


  // Request
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday as Date, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    ECR_No:        [[]],
    TLT_No:        [[]],
    Pay_No:        [[]],
    CRD_No:        [], // 若未使用可移除
    tlt_building:  [],
    tlt_floor:     [[]],
    org_id:        [[]],

    // ✅ 預設排序：群組欄位優先
    ...createPaginationConfig([
      { field: this.groupByField, order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]),
  });

  // 下拉選單
  paymentTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  ECRNoOptions: any[] = [];

  // ====== 總計 / 小計容器與對應關係 ======
  /** 表尾總計容器（來自 wrapper.totalPayAmt 聚合） */
  detailTotals: Record<string, number> = {};
  /** 欄位 -> 總計鍵對應 */
  detailTotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'totalPayAmt',
  };
  /** 群組小計容器（前端依當頁 rows 計算） */
  detailSubtotals: Record<string, Record<string, number>> = {};
  /** 欄位 -> 小計鍵對應 */
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'Subtotal_TXN_PayAmt',
  };

  constructor(
    private paymentTypeService: PaymentTypeService,
    private tls23100Service: TLS23100Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  // 頁面起始
  ngOnInit(): void {
    this.initializePage('TLS23100', 'tls/tls23100', this.queryForm, (form) => this.onSubmit(form));

    // 初始化 Sort 狀態
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

    // 下拉載入
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.paymentTypeService.getPaymentTypes().subscribe((data) => (this.paymentTypeOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  // 欄位（把要計算總/小計的欄位加上 isTotal / isSubTotal）
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別', visible: true },
    { field: 'PAY_NAME', header: '付款名稱', visible: true },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => this.money(val),
      isTotal: true,
      isSubTotal: true,
    },
  ];

// 提供給 Table2 的 lazy 載入函式（HTML 綁 [fetchData]="fetchTLS23100"）
fetchTLS23100 = (evt: LazyLoadEvent) => {
  const val = this.queryForm.getRawValue() as any;

  // 排序：事件優先 → 表單 → 預設；並強制把群組欄位放第一順位
const eventSort = Array.isArray(evt?.SortBy) ? evt.SortBy : [];
const baseSort = Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort;
const sortBy = this.normalizeSort(eventSort.length ? eventSort : baseSort);

  // 分頁：事件優先 → 表單 → 預設
  const pageIndex = Number.isFinite(evt?.pageIndex)
    ? Number(evt!.pageIndex)
    : Number(val?.pageIndex ?? 1);
  const pageSize = Number.isFinite(evt?.pageSize)
    ? Number(evt!.pageSize)
    : Number(val?.pageSize ?? 10);

  // 與 onSubmit 相同規則（✅ 不帶 Offset / OrderBy）
  const payload = this.prune({
    TXN_DateStart: this.toIso(val?.TXN_DateStart),
    TXN_DateEnd  : this.toIso(val?.TXN_DateEnd),
    ECR_No       : this.ensureArr(val?.ECR_No),
    TLT_No       : this.ensureArr(val?.TLT_No),
    Pay_No       : this.ensureArr(val?.Pay_No),
    CRD_No       : (val?.CRD_No ?? '') || undefined,
    tlt_building : (val?.tlt_building ?? '') || undefined,
    tlt_floor    : this.ensureArr(val?.tlt_floor),
    org_id       : this.ensureArr(val?.org_id),

    pageSize,
    pageIndex,
    SortBy: sortBy,
  });
 this.historyRequestBody = { ...payload };
  return this.tls23100Service.queryTLS23100(payload).pipe(
    map((res: any) => {
      // 兼容 Data 為物件或陣列
      const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);

      // 明細列
      const rows = wrappers
        .flatMap((w: any) => w?.tLS23100Details ?? w?.TLS23100Details ?? w?.tls23100Details ?? [])
        .map((row: any, idx: number) => ({
          ...row,
          _rowKey: `row|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
        }));

      // 總筆數
      const totalRecords =
        typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

      // 表尾總計：wrapper.totalPayAmt 聚合；若後端沒給就用當頁合計
      const totalFromWrapper = wrappers.reduce(
        (s: number, w: any) => s + Number(w?.totalPayAmt ?? 0),
        0,
      );
      const fallbackPageSum = rows.reduce(
        (s: number, r: any) => s + Number(r?.TXN_PayAmt ?? 0),
        0,
      );
      const externalTotals = { totalPayAmt: totalFromWrapper || fallbackPageSum };

      // 群組小計（以 tlt_no 分組；鍵名對應 detailSubtotalFieldMap）
      const externalSubtotals = this.buildSubtotals(rows);

      return { rows, totalRecords, externalTotals, externalSubtotals };
    })
  );
};


  // 送出查詢
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      // 分頁鍵（✅ 不再計算也不傳 Offset）
      const pageSize  = Number.isFinite(val?.pageSize)  ? Number(val.pageSize)  : 10;
      const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;

      // 排序：表單 → sortMeta → defaultSort
   const sortByArr = this.normalizeSort(
  Array.isArray(val?.SortBy) && val.SortBy.length
    ? val.SortBy
    : (this.sortMeta.length ? this.sortMeta : this.defaultSort)
);

      // 組 payload（✅ 僅保留 pageIndex/pageSize/SortBy）
      const payload: any = this.prune({
        TXN_DateStart: this.toIso(val?.TXN_DateStart),
        TXN_DateEnd  : this.toIso(val?.TXN_DateEnd),
        ECR_No       : this.ensureArr(val?.ECR_No),
        TLT_No       : this.ensureArr(val?.TLT_No),
        Pay_No       : this.ensureArr(val?.Pay_No),
        CRD_No       : (val?.CRD_No ?? '') || undefined,
        tlt_building : (val?.tlt_building ?? '') || undefined,
        tlt_floor    : this.ensureArr(val?.tlt_floor),
        org_id       : this.ensureArr(val?.org_id),

        pageSize,
        pageIndex,
        SortBy: sortByArr,
      });
 this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23100Service.queryTLS23100(payload).subscribe({
        next: (res: any) => {
          // 期待：{ Data: [{ totalPayAmt, tLS23100Details: [...] }, ...], TotalCount?, ... }
          const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);

          // 當頁明細
          const details = wrappers.flatMap((w: any) =>
            Array.isArray(w?.tLS23100Details ?? w?.TLS23100Details ?? w?.tls23100Details)
              ? (w.tLS23100Details ?? w.TLS23100Details ?? w.tls23100Details)
              : [],
          );
          this.data = details.map((row: any, idx: number) => ({
            ...row,
            _rowKey: `row|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
          }));

          // 總計（聚合所有 wrapper 的 totalPayAmt；若缺少則回退為當頁加總）
          const totalFromWrapper = wrappers
            .map((w: any) => Number(w?.totalPayAmt ?? 0))
            .reduce((a: number, b: number) => a + b, 0);

          const fallbackPageSum = this.data
            .map((r: any) => Number(r?.TXN_PayAmt ?? 0))
            .reduce((a: number, b: number) => a + b, 0);

          this.detailTotals = { totalPayAmt: totalFromWrapper || fallbackPageSum };

          // 小計（前端依當頁資料，以 tlt_no 分組）
          this.detailSubtotals = this.buildSubtotals(this.data);

          // 總筆數
          this.totalRecords = (typeof res?.TotalCount === 'number')
            ? res.TotalCount
            : this.data.length;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.detailSubtotals = {};
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  // ====== 工具 ======
  private toIso(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }

  private ensureArr = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));

  private prune<T extends Record<string, any>>(obj: T): T {
    const out: any = { ...obj };
    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === '' || v === null || v === undefined) delete out[k];
      else if (Array.isArray(v) && v.length === 0) delete out[k];
      else if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) delete out[k];
    });
    return out as T;
  }

  private ensureGroupFirst(sortBy: any[] | undefined): any[] {
    const g = this.groupByField;
    const list = Array.isArray(sortBy) ? [...sortBy] : [];
    const exist = list.find((s) => s.field === g);
    const rest = list.filter((s) => s.field !== g);
    const order = exist?.order ?? 1;
    return [{ field: g, order }, ...rest];
  }

private buildSubtotals(rows: any[]): Record<string, Record<string, number>> {
  const sub: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const key = String(r?.tlt_no ?? 'UNKNOWN');
    const curr = sub[key] ?? {};
    // 用中括號避免 TS4111
    curr['Subtotal_TXN_PayAmt'] = (curr['Subtotal_TXN_PayAmt'] ?? 0) + Number(r?.TXN_PayAmt ?? 0);
    sub[key] = curr;
  }
  return sub;
}


  money = (val: any) => Number(val || 0).toLocaleString('en-US');
// ===== 匯出：PDF =====
  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23100Service.exporttls23100PDF(this.historyRequestBody).pipe(
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
}
