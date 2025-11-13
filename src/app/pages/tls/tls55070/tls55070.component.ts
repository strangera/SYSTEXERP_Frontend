/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, map, catchError, of, timeout } from 'rxjs';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

import { TLS55070Service } from '../../../service/api/tls/tls55070.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CounterNameService } from '@service/basic/counter-name.service';
import { CashierService } from '@service/basic/cashier.service';
import { tls2b010tableComponent } from '@shared/componentkit/tls2-b010-table/tls2b010table.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TLS55070TableComponent } from '@shared/componentkit/tls55070-table/tls55070-table.component';

const TOTAL_FIELD_MAP = { TXN_SaleAmt: 'Total_TXN_SaleAmt' } as const;
type TotalFieldMap = typeof TOTAL_FIELD_MAP;
const SUBTOTAL_FIELD_MAP = { TXN_SaleAmt: 'SubTotal_TXN_SaleAmt' } as const;
type SubtotalFieldMap = typeof SUBTOTAL_FIELD_MAP;

@Component({
  selector: 'app-tls55070',
  standalone: true,
  templateUrl: './tls55070.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    CalendarRangeQuickComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    CheckboxModule,
    ButtonModule,
    InputTextRangeComponent,
    TLS55070TableComponent,
  ],
})
export class TLS55070Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  /** 用銷售單號當群組鍵（也當排序的群組欄） */
  readonly groupByField = '_grp'; // 內部群組鍵
  /** 讓 rowspan 依銷售單號合併（在 ngAfterViewInit 指定給子元件的 groupKey） */
  @ViewChild('saleTable', { static: false }) saleTable?: tls2b010tableComponent;

  enableCrossPageSubtotalPeek = false;

  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 },     // 代表 TXN_SaleNoteNo
    { field: 'TXN_SaleNoteNo', order: 1 },      // 明確放前面，確保同單號連在一起
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No', order: 1 },
  ];
  sortMeta: any[] = [];

  // 匯出 loading 分離
  btnLoadingExcel = false;
  btnLoadingPDF = false;

  data: any[] = [];
  totalRecords = 0;
 activated = false; // 尚未按查詢前，不處理任何 lazy 事件
  detailTotals: Record<string, number> = {};
  visibleSubtotals: Record<string, Record<string, number>> = {};
  private allSubtotals: Record<string, Record<string, number>> = {};
  detailTotalFieldMap: TotalFieldMap = TOTAL_FIELD_MAP;
  detailSubtotalFieldMap: SubtotalFieldMap = SUBTOTAL_FIELD_MAP;

  historyRequestBody: any | null = null;
  private readonly includePagingAndSorting = true;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    TXN_SaleNoteNo: [''],
    ECR_No: [''],
    TXN_GUIBegNoStart: [null],
    TXN_GUIBegNoEnd: [null],
    TXN_NoStart: [null],
    TXN_NoEnd: [null],
    LOGO_No: [''],
    TLT_No: [''],
    HOS_NO: [''],
    USR_No: [''],
    TXN_Status: [''],
    IsShowStatus: [''],
    ...createPaginationConfig(this.defaultSort),
  });

  /** 欄位設定：把「銷售單號」設為置中，並做為 merged column */
  columns: any[] = [
    { field: 'TXN_SaleNoteNo', header: '銷售單號', visible: true, style: 'text-center' },
    { field: this.groupByField, header: 'grp', visible: false, hidden: true }, // 群組鍵
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (v: string) => this.formatDate(v),
    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'HOS_NO', header: '倉別', visible: true },
    { field: 'HOS_NAME', header: '倉別名稱', visible: true, style: 'text-left' },
    { field: 'TXN_TaxType', header: '稅別', visible: true },
    { field: 'GUINO', header: '發票號碼', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true, style: 'text-left' },
    { field: 'TXN_Qty', header: '數量', visible: true, style: 'text-right' },
    { field: 'TXN_Disc', header: '折讓金額', visible: true, style: 'text-right' },
    {
      field: 'DiscRate',
      header: '折扣率',
      visible: true,
      style: 'text-right',
      format: (v: number | string) => this.percent(v),
    },
    {
      field: 'TXN_SaleAmt',
      header: '單項小計',
      visible: true,
      style: 'text-right',
      format: (n: number) => this.money(n),
      isTotal: true,
      isSubTotal: true,
    },
  ];

  ECRNoOptions: any[] = [];
  txnStatusOptions = [
    { value: '1', label: '一般交易' },
    { value: '2', label: '一般作廢' },
    { value: '3', label: '退貨' },
  ];
  yesNoOptions = [
    { value: '0', label: '全部' },
    { value: '1', label: '顯示' },
  ];

  // LOGO/HOS_No / 專櫃 / 銷售人員
  logoOptions: Array<{ label: string; value: string }> = [];
  hosOptions: Array<{ label: string; value: string }> = [];
  CounterOptions: any[] = [];
  cashierOptions: any[] = [];

  constructor(
    private tls55070Service: TLS55070Service,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private cashierService: CashierService,
  ) {
    super();
  }

  ngAfterViewInit(): void {
    // 直接把子元件的 groupKey 改成我們的群組欄位（銷售單號 _grp）
    // 這樣 mergedColumns 的 rowspan 就會以銷售單號群組計算
    queueMicrotask(() => {
      if (this.saleTable) this.saleTable.groupKey = this.groupByField;
    });
  }

// src/app/pages/tls/tls55070/tls55070.component.ts (ngOnInit 部分)

ngOnInit(): void {
  this.loading = false;
  this.initializePage('TLS55070', 'tls/tls55070', this.queryForm, (f) => this.onSubmit(f));
  this.sortMeta = this.defaultSort.map((x) => ({ ...x }));
  this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

  // 其它下拉（各打一支即可）
  this.ECRNoService.getECRNo().subscribe((data) => (this.ECRNoOptions = data));
  this.counterNameService.getCounters().subscribe((res) => {
    this.CounterOptions =
      res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
  });
  this.cashierService.getCashierOptions().subscribe((res) => {
    this.cashierOptions =
      res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
  });

  // ★ LOGO + 倉別：一次合併取回（倉別改打 /queryPOS2034_DropDownList）
  this.tls55070Service.getLogoAndHosOptions().subscribe(({ logoOptions, hosOptions }) => {
    this.logoOptions = logoOptions;
    this.hosOptions = hosOptions;
  });

  this.loading = false;
}


  private parsePercent(v: any): number {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return v;
    const s = String(v).trim();
    if (s.endsWith('%')) {
      const n = Number(s.slice(0, -1));
      return isNaN(n) ? 0 : n;
    }
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }

percent(val: any): string {
  // 空值（null/undefined/''）→ 直接顯示空白，不轉百分比
  if (val === null || val === undefined || val === '') return '';

  // 若你之前用 'nopercent' 當禁用標記，也一起回傳空白
  if (val === 'nopercent') return '';

  const n = this.parsePercent(val);
  return (n / 100).toLocaleString('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
  });
}

  /** Lazy 取數（提供給子元件） */
/** Lazy 取數（提供給子元件） */
fetchTLS55070 = (evt: LazyLoadEvent) => {
  const raw: any = this.queryForm.getRawValue();

  // 事件可能給 pageSize 或 rows（PrimeNG）
  const evtPageSize = Number.isFinite((evt as any)?.pageSize)
    ? Number((evt as any).pageSize)
    : Number.isFinite((evt as any)?.rows)
      ? Number((evt as any).rows)
      : undefined;

 // 改成（加上分組）
const pageSize = (evtPageSize ?? Number(raw?.pageSize)) || 20;

  // 事件可能沒有 pageIndex（PrimeNG 常見），用 first/rows 推回 pageIndex
  const evtHasPageIndex = Number.isFinite((evt as any)?.pageIndex);
  const evtFirst = Number.isFinite((evt as any)?.first) ? Number((evt as any).first) : 0;
  const pageIndex = evtHasPageIndex
    ? Number((evt as any).pageIndex)
    : Math.floor(evtFirst / pageSize) + 1;

  // 排序：evt.SortBy > raw.SortBy > defaultSort，並確保 group 欄位優先
  const uiSort = this.ensureGroupFirst(
    Array.isArray((evt as any)?.SortBy) && (evt as any).SortBy.length
      ? (evt as any).SortBy
      : Array.isArray(raw?.SortBy) && raw.SortBy.length
        ? raw.SortBy
        : this.defaultSort,
  );
  const apiSort = this.toApiSort(uiSort);

  const payload = this.buildPayload({
    ...raw,
    pageSize,
    pageIndex,
    SortBy: apiSort,
  });

  // 同步表單（匯出或續載時可拿到正確的頁碼/筆數/排序）
  this.queryForm.patchValue({ pageSize, pageIndex, SortBy: uiSort }, { emitEvent: false });

  return this.tls55070Service.queryTLS55070(payload).pipe(
    map((res: any) => {
      const wrappers = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
      const { rows, allSubtotals, externalTotals, totalRecords: computedRowsCount } =
        this.unpackResponse(wrappers);

      const apiTotal = Number(res?.TotalCount);
      const totalRecords = Number.isFinite(apiTotal) ? apiTotal : computedRowsCount;

      // 決定哪些群組已經結束 -> 顯示外部小計
      const ended = new Set<string>();
      for (let i = 0; i < rows.length - 1; i++) {
        const g1 = rows[i][this.groupByField];
        const g2 = rows[i + 1][this.groupByField];
        if (g1 !== g2) ended.add(g1);
      }
      const totalPage =
        Number(res?.TotalPage ?? Math.ceil((totalRecords || 0) / (pageSize || 1))) || 0;
      const hasNext = totalPage ? pageIndex < totalPage : pageIndex * pageSize < totalRecords;
      const lastKey = rows[rows.length - 1]?.[this.groupByField];
      if (!hasNext && lastKey) ended.add(lastKey);

      const externalSubtotals: Record<string, Record<string, number>> = {};
      ended.forEach((k) => {
        if (allSubtotals[k]) externalSubtotals[k] = allSubtotals[k];
      });

      this.allSubtotals = allSubtotals;
      this.visibleSubtotals = externalSubtotals;
      this.detailTotals = externalTotals;

      return { rows, totalRecords, externalTotals, externalSubtotals };
    }),
    catchError(() =>
      of({
        rows: [],
        totalRecords: 0,
        externalTotals: {},
        externalSubtotals: {},
      }),
    ),
  );
};

onSubmit(form: FormGroup): void {
  this.activated = true;          // 允許後續 lazy 載入
  this.loading = true;

  // 重新查詢 -> 回到第一頁
  this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });

  const raw: any = { ...this.queryForm.getRawValue() };
  const pageSize = Number.isFinite(raw?.pageSize) ? Number(raw.pageSize) : 20;
  const pageIndex = Number.isFinite(raw?.pageIndex) ? Number(raw.pageIndex) : 1;

  // 排序：raw.SortBy 或現有 sortMeta，最後保底 defaultSort；並確保群組優先
  const uiSortBy: any[] = this.ensureGroupFirst(
    Array.isArray(raw?.SortBy) && raw.SortBy.length
      ? raw.SortBy
      : this.sortMeta?.length
        ? this.sortMeta
        : this.defaultSort,
  ).map((s) => ({ ...s }));

  const payload = this.buildPayload({
    ...raw,
    pageSize,
    pageIndex,
    SortBy: this.toApiSort(uiSortBy),
  });
  this.historyRequestBody = { ...payload };

  this.tls55070Service
    .queryTLS55070(payload)
    .pipe(
      timeout(60_000),
      finalize(() => (this.loading = false)),
      catchError(() => of({ Data: [], TotalCount: 0, TotalPage: 0 })),
    )
    .subscribe((res: any) => {
      const wrappers = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
      const { rows, allSubtotals, externalTotals, totalRecords: computedRowsCount } =
        this.unpackResponse(wrappers);

      const apiTotal = Number(res?.TotalCount);
      const totalRecords = Number.isFinite(apiTotal) ? apiTotal : computedRowsCount;

      const ended = new Set<string>();
      for (let i = 0; i < rows.length - 1; i++) {
        const g1 = rows[i][this.groupByField];
        const g2 = rows[i + 1][this.groupByField];
        if (g1 !== g2) ended.add(g1);
      }
      const totalPage =
        Number(res?.TotalPage ?? Math.ceil((totalRecords || 0) / (pageSize || 1))) || 0;
      const hasNext = totalPage ? pageIndex < totalPage : pageIndex * pageSize < totalRecords;
      const lastKey = rows[rows.length - 1]?.[this.groupByField];
      if (!hasNext && lastKey) ended.add(lastKey);

      const vis: Record<string, Record<string, number>> = {};
      ended.forEach((k) => {
        if (allSubtotals[k]) vis[k] = allSubtotals[k];
      });

      this.data = rows;
      this.totalRecords = totalRecords;
      this.allSubtotals = allSubtotals;
      this.visibleSubtotals = vis;
      this.detailTotals = externalTotals;

      // 確保子表格群組鍵
      queueMicrotask(() => {
        if (this.saleTable) this.saleTable.groupKey = this.groupByField;
      });
    });
}


  // === 匯出 Excel ===
  onExportExcel() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoadingExcel = true;
    this.tls55070Service
      .exportTLS55070Excel(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoadingExcel = false)))
      .subscribe({
        next: (r: HttpResponse<Blob>) => this.handleFileExport(r, '.xlsx'),
      });
  }

  // === 匯出 PDF ===
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoadingPDF = true;
    this.tls55070Service
      .exportTLS55070PDF(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoadingPDF = false)))
      .subscribe({
        next: (r: HttpResponse<Blob>) => this.handleFileExport(r, '.pdf'),
      });
  }

  // ==== helpers ====
  private buildPayload(raw: any) {
    const toYMD = (d: any): string | null => {
      const date = d instanceof Date ? d : new Date(d);
      return isNaN(date.getTime())
        ? null
        : `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, '0')}-${(date.getDate() + '').padStart(2, '0')}`;
    };

    const payload: any = {
      TXN_DateStart: toYMD(raw['TXN_DateStart']),
      TXN_DateEnd: toYMD(raw['TXN_DateEnd']),
      TXN_SaleNoteNo: this.emptyToNull(raw['TXN_SaleNoteNo']),
      ECR_No: this.emptyToNull(raw['ECR_No']),
      TXN_GUIBegNoStart: this.emptyToNull(raw['TXN_GUIBegNoStart']),
      TXN_GUIBegNoEnd: this.emptyToNull(raw['TXN_GUIBegNoEnd']),
      TXN_NoStart: this.emptyToNull(raw['TXN_NoStart']),
      TXN_NoEnd: this.emptyToNull(raw['TXN_NoEnd']),
      LOGO_No: this.emptyToNull(raw['LOGO_No']),
      TLT_No: this.emptyToNull(raw['TLT_No']),
      HOS_NO: this.emptyToNull(raw['HOS_NO']),
      USR_No: this.emptyToNull(raw['USR_No']),
      TXN_Status: this.emptyToNull(raw['TXN_Status']),
      IsShowStatus: this.emptyToNull(raw['IsShowStatus']),
    };

    if (this.includePagingAndSorting) {
      payload['pageSize'] = Number.isFinite(raw?.pageSize) ? Number(raw.pageSize) : 20;
      payload['pageIndex'] = Number.isFinite(raw?.pageIndex) ? Number(raw.pageIndex) : 1;
      payload['SortBy'] = Array.isArray(raw?.SortBy) ? raw.SortBy : this.toApiSort(this.defaultSort);
    }

    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    return payload;
  }

  private unpackResponse(wrappers: any[]) {
      
    const rows: any[] = [];
    const allSubtotals: Record<string, Record<string, number>> = {};
    let totalRecords = 0;

    for (const w of wrappers || []) {
      const list = Array.isArray(w?._DetailList) ? w._DetailList : [];
    


      // 以銷售單號做群組鍵
      const saleNo = String(w?.TXN_SaleNoteNo ?? '').trim();
      const grpKey = saleNo || `${w?.TXN_Date ?? ''}|${w?.ECR_No ?? ''}|${rows.length}`;

      // 收集小計
allSubtotals[grpKey] = {
  [this.detailSubtotalFieldMap.TXN_SaleAmt]: Number(w?.SumTXN_SaleAmt ?? 0),
};

      // 明細列
      list.forEach((d: any, i: number) => {
        rows.push({
          ...w,
          ...d,
          _rowKey: `${grpKey}|${i}`,
          [this.groupByField]: grpKey, // 群組鍵
          TXN_SaleNoteNo: saleNo,      // 讓合併欄有值
          TXN_SaleAmt: Number(d?.TXN_SaleAmt ?? 0),
          TXN_Qty: Number(d?.TXN_Qty ?? 0),
          TXN_Disc: Number(d?.TXN_Disc ?? 0),
          DiscRate: this.parsePercent(d?.DiscRate),
        });
      });

      // 小計列（放在每組最後一筆，PLU_Name 顯示「銷售金額」）
      // ✅ 小計列獨立成另一個群組，且不顯示銷售單號
// 小計列（放在每組最後一筆，PLU_Name 顯示「銷售金額」）
rows.push({
  _rowKey: `${grpKey}|__SUBTOTAL__`,
  [this.groupByField]: `${grpKey}__SUB`, // 小計獨立群組
  _grpBase: grpKey,                      // 👈 加這個，記住原本的群組鍵

  TXN_SaleNoteNo: '',
  TXN_Date: '',
  ECR_No: '',
  TLT_No: '',
  HOS_NO: '',
  HOS_NAME: '',
  TXN_TaxType: '',
  GUINO: '',
  PLU_Name: '銷售金額',
  DiscRate: '',
  SumTXN_SaleAmt: Number(w?.SumTXN_SaleAmt ?? 0),  // 原始小計（可留著）
 TXN_SaleAmt: Number(w?.SumTXN_SaleAmt ?? 0),
  __isSubRow: true,
});

      totalRecords += list.length || 0;
    }

    const externalTotals = wrappers.reduce((agg, w) => {
      const a = Number(w?.SumTXN_SaleAmt ?? 0);
      const keyA = this.detailTotalFieldMap.TXN_SaleAmt;
      agg[keyA] = Number(agg[keyA] ?? 0) + a;
      return agg;
    }, {} as Record<string, number>);

    return { rows, allSubtotals, externalTotals, totalRecords };
  }

  private ensureGroupFirst(sortBy: any[] | undefined): any[] {
    const g = this.groupByField;
    const list = Array.isArray(sortBy) ? [...sortBy] : [];
    const exist = list.find((s) => s.field === g);
    const rest = list.filter((s) => s.field !== g);
    const order = exist?.order ?? 1;
    return [{ field: g, order }, ...rest];
  }

  /** UI sort 轉 API sort：把 _grp 映成 TXN_SaleNoteNo，避免打散群組 */
  private toApiSort(
    uiSort: Array<{ field: string; order: 1 | -1 }>
  ): Array<{ field: string; order: 1 | -1 }> {
    const out: Array<{ field: string; order: 1 | -1 }> = [];
    let injectedSaleNo = false;

    for (const s of uiSort ?? []) {
      if (s.field === this.groupByField) {
        out.push({ field: 'TXN_SaleNoteNo', order: s.order });
        injectedSaleNo = true;
      } else {
        out.push(s);
      }
    }
    if (!injectedSaleNo) out.unshift({ field: 'TXN_SaleNoteNo', order: 1 });

    const seen = new Set<string>();
    return out.filter(s => (seen.has(s.field) ? false : (seen.add(s.field), true)));
  }

  private emptyToNull(v: any) {
    return v === '' ? null : v;
  }
  private formatDate(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${(d.getMonth() + 1 + '').padStart(2, '0')}/${(d.getDate() + '').padStart(2, '0')}`;
  }
  money(val: number): string {
    return Number(val ?? 0).toLocaleString('en-US');
  }

  private handleFileExport(response: HttpResponse<Blob>, defExt: string): void {
    const cd = response.headers.get('Content-Disposition');
    const name = this.getFilenameFromHeader(cd, defExt);
    const blob = response.body;
    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }
  private getFilenameFromHeader(cd: string | null, defExt: string): string {
    const def = `download${defExt}`;
    if (!cd) return def;
    const star = /filename\*=([^;]+)/.exec(cd);
    if (star?.[1]) {
      try { return decodeURIComponent(star[1].replace(/^UTF-8''/, '')); }
      catch { return star[1]; }
    }
    const m = /filename="([^"]+)"/.exec(cd);
    if (m?.[1]) {
      try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); }
      catch { return m[1]; }
    }
    return def;
  }

/** 提供給外層 lazy slot（TLS2B010 用法） */
override onLazyLoadData = (evt: LazyLoadEvent | Event, _form: FormGroup) => {
  if (!this.activated) return; // 未按查詢前，不要自動打 API

  const e = evt as any as LazyLoadEvent;

  // 事件可能給 pageSize 或 rows（PrimeNG）
  const evtPageSize = Number.isFinite((e as any)?.pageSize)
    ? Number((e as any).pageSize)
    : Number.isFinite((e as any)?.rows)
      ? Number((e as any).rows)
      : undefined;
  const pageSize = (evtPageSize ?? Number(this.queryForm.value?.pageSize)) || 20;

  // 事件可能沒有 pageIndex（PrimeNG 常見）：用 first/rows 推回 pageIndex
  const evtHasPageIndex = Number.isFinite((e as any)?.pageIndex);
  const first = Number.isFinite((e as any)?.first) ? Number((e as any).first) : 0;
  const pageIndex = evtHasPageIndex ? Number((e as any).pageIndex) : Math.floor(first / pageSize) + 1;

  // 同步回表單
  this.queryForm.patchValue({ pageIndex, pageSize }, { emitEvent: false });

  this.fetchTLS55070(e).subscribe({
    next: ({ rows, totalRecords, externalTotals, externalSubtotals }) => {
      this.data = rows;
      this.totalRecords = totalRecords;
      this.detailTotals = externalTotals;
      this.visibleSubtotals = externalSubtotals;
    },
    error: _ => {
      this.data = [];
      this.totalRecords = 0;
      this.detailTotals = {};
      this.visibleSubtotals = {};
    }
  });
};



}
