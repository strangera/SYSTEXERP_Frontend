/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23110Service } from '../../../service/api/tls/tls23110.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatAmount,
  ReportColumn
} from '../../../shared/componentkit/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23110',
  templateUrl: './tls23110.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, MultiSelectComponent,
    InputTextModule, ButtonComponent, TranslateModule, ButtonModule, CalendarComponent,
    TableReportComponent,
  ],
})
export class TLS23110Component extends BasicQueryPageComponent<any> implements OnInit {
  // ====== 常數與桶位對照定義 ======
  private readonly DISCOUNT_KEYS = [
    'OriginalPrice', 'Discount95', 'Discount90', 'Discount85', 'Discount80',
    'Discount75', 'Discount70', 'Discount60', 'Discount50', 'SpecialPrice', 'Total',
  ] as const;

  private readonly labelMap: Record<string, string> = {
    OriginalPrice: '正品', Discount95: '95折', Discount90: '9折', Discount85: '85折',
    Discount80: '8折', Discount75: '75折', Discount70: '7折', Discount60: '6折',
    Discount50: '5折', SpecialPrice: '特價', Total: '總計',
  };

  // ====== 狀態管理 ======
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;
  columns: ReportColumn[] = [];

  private grandTotal: Record<string, number> = {};

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ====== 表單宣告（符合 1000 規格與頁碼 1 起始） ======
  queryForm: any = this.formBuilder.group(
    {
      TXN_Month: [null],
      TXN_DateStart: [this.yesterday, [Validators.required]],
      TXN_DateEnd: [this.yesterday, [Validators.required]],
      tlt_term_type: [null],
      rece_yn: ['Y'],
      IsNoPLU_No: [null],
      TLT_No: [null],
      tlt_building: [null],
      tlt_floor: [null],
      org_id: [null],
      pageSize: [1000], // ⬅️ 調整為 1000 規格
      pageIndex: [1],   // ⬅️ 調整初始頁碼為 1
      SortBy: [[{ field: 'Day', order: 1 }]],
    },
    { validators: [this.sameMonthValidator('TXN_DateStart', 'TXN_DateEnd')] }
  ) as FormGroup;

  // ====== 下拉選單選項資料集 ======
  readonly receYnOptions = [
    { label: '使用業主發票', value: 'Y' },
    { label: '非使用業主發票', value: 'N' },
  ];
  readonly IsNoPLU_NoOptions = [
    { label: '全部', value: null },
    { label: '不包含自營櫃', value: false },
    { label: '只顯示自營櫃', value: true },
  ];
  readonly DeductionbigCategoryOptions = [
    { value: '0', label: '類別0' }, { value: '1', label: '類別1' }, { value: '2', label: '類別2' },
    { value: '3', label: '類別3' }, { value: '4', label: '類別4' }, { value: '5', label: '類別5' },
    { value: '6', label: '類別6' }, { value: '7', label: '類別7' }, { value: '8', label: '類別8' },
    { value: '9', label: '類別9' },
  ];

  OrganizationNumberOptions: any[] = [];
  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23110Service: TLS23110Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23110', 'tls/tls23110', this.queryForm, (form) => this.onSubmit(form));

    // 動態建置包含各式折扣與稅制的欄位
    this.columns = this.buildColumns();

    // 銷售月份聯動偵聽機制
    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d: Date | null) => {
        if (!d || Number.isNaN(new Date(d).getTime())) return;
        const { start, end } = this.getMonthRange(d);
        this.queryForm.patchValue({ TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 }, { emitEvent: false });
      });

    this.queryForm.controls.TXN_DateStart.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());

    const startCtrl = this.queryForm.controls.TXN_DateStart as FormControl;
    const endCtrl = this.queryForm.controls.TXN_DateEnd as FormControl;

    const clampEndToStartMonth = () => {
      const s = startCtrl?.value ? new Date(startCtrl.value) : null;
      const e = endCtrl?.value ? new Date(endCtrl.value) : null;
      if (!s || !e || Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return;

      const sameMonth = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();
      if (!sameMonth) {
        const lastDay = new Date(s.getFullYear(), s.getMonth() + 1, 0);
        endCtrl.patchValue(lastDay, { emitEvent: false });
        this.queryForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      } else if (e.getTime() < s.getTime()) {
        endCtrl.patchValue(s, { emitEvent: false });
        this.queryForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    };

    startCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe(clampEndToStartMonth);
    endCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe(clampEndToStartMonth);
    clampEndToStartMonth();

    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 聲明式載入優化)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      counters: this.dropdownApiService.queryTltTalent().pipe(catchError(() => of([]))),
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), catchError(() => of([]))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      orgs: this.dropdownApiService.querySys3100().pipe(catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
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

  /**
   * 依據折扣定義桶位結構動態組裝前端表格 ReportColumn (全面校正對齊規格)
   */
  private buildColumns(): ReportColumn[] {
    const cols: ReportColumn[] = [{ field: 'Day', header: '日期', visible: true }];
    for (const key of this.DISCOUNT_KEYS) {
      const label = this.labelMap[key] ?? key;
      cols.push(
        { field: `${key}_TXN_Net`, header: `${label}-未稅`, visible: true, align: 'right', format: formatAmount, isTotal: true },
        { field: `${key}_TXN_SaleNoTax`, header: `${label}-免稅`, visible: true, align: 'right', format: formatAmount, isTotal: true },
        { field: `${key}_TXN_Tax`, header: `${label}-稅額`, visible: true, align: 'right', format: formatAmount, isTotal: true },
        { field: `${key}_Total`, header: `${label}-合計`, visible: true, align: 'right', format: formatAmount, isTotal: true }
      );
    }
    return cols;
  }

  // ========= 查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val: any = this.queryForm.getRawValue();
      const toTF = (x: any) => {
        if (x === true || x === 'true' || x === 1 || x === '1') return true;
        if (x === false || x === 'false' || x === 0 || x === '0') return false;
        return undefined;
      };
      const asArr = (x: any) => Array.isArray(x) ? x : (x == null || x === '' ? undefined : [x]);

      const payload: any = {
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
        tlt_term_type: this.toStringOrUndef(val?.tlt_term_type),
        rece_yn: val?.rece_yn ?? undefined,
        IsNoPLU_No: toTF(val?.IsNoPLU_No),
        TLT_No: asArr(val?.TLT_No),
        tlt_building: val?.tlt_building ?? undefined,
        tlt_floor: asArr(val?.tlt_floor),
        org_id: asArr(val?.org_id),
        pageIndex: val?.pageIndex ?? 1,
        pageSize: 1000, // ⬅️ 調整為全域指定之 1000 規格
        SortBy: Array.isArray(val?.SortBy) ? val.SortBy : [{ field: 'Day', order: 1 }],
      };

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23110Service.queryTLS23110(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          })
        )
        .subscribe({
          next: (res: any) => {
            const rawRows: any[] = Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData : Array.isArray(res?.Data) ? res.Data : Array.isArray(res?.QueryData) ? res.QueryData : [];
            const metrics = ['TXN_Net', 'TXN_SaleNoTax', 'TXN_Tax', 'Total'] as const;

            const mapped = rawRows.map((row: any, idx: number) => {
              const flat: any = { Day: row?.Day ?? '' };
              const d = row?.Discount_List || {};
              for (const bucket of this.DISCOUNT_KEYS) {
                const obj = d[bucket as string];
                if (!obj) continue;
                const pick = (o: any, k: 'TXN_Net' | 'TXN_SaleNoTax' | 'TXN_Tax' | 'Total') => k === 'TXN_Net' ? Number(o?.TXN_Net ?? o?.TXN_SaleNoTax ?? 0) : Number(o?.[k] ?? 0);
                for (const m of metrics) {
                  const key = `${bucket}_${m}`;
                  const num = pick(obj, m);
                  if (Number.isFinite(num)) flat[key] = num;
                }
              }
              flat._rowKey = `tls23110_${flat.Day ? String(flat.Day).trim() : `empty_day_${idx}`}`;
              return flat;
            });

            this.data = mapped;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : mapped.length;

            const grandFromApi = this.buildGrandFromTotalSummary(res?.Data?.TotalSummary);
            const fallbackGrand = this.computeGrandTotals(mapped);
            this.grandTotal = Object.keys(grandFromApi).length ? grandFromApi : fallbackGrand;

            const rawPageSize = this.historyRequestBody?.pageSize || 1000;
            const effectivePageSize = this.totalRecords <= this.data.length ? (this.data.length || rawPageSize) : rawPageSize;

            this.historyRequestBody = {
              ...this.historyRequestBody,
              pageSize: effectivePageSize,
              pageIndex: 1,
            };
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
          },
        });
    });
  }

  // ========= <app-table-report> 查詢封裝調用（支援 1000 規格滾動） =========
  public queryTLS23110ForReport = (body: any) => {
    return this.tls23110Service.queryTLS23110({
      ...(body || {}),
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
      tlt_term_type: this.toStringOrUndef(body?.tlt_term_type ?? this.queryForm.value?.tlt_term_type),
      pageSize: body?.pageSize ?? 1000, // ⬅️ 固定 1000 規格
    }).pipe(
      map((res: any) => {
        const rawRows: any[] = Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData : Array.isArray(res?.Data) ? res.Data : Array.isArray(res?.QueryData) ? res.QueryData : [];
        const metrics = ['TXN_Net', 'TXN_Tax', 'Total'] as const;

        const rows = rawRows.map((row: any, idx: number) => {
          const flat: any = { Day: row?.Day ?? '' };
          const d = row?.Discount_List || {};
          for (const bucket of this.DISCOUNT_KEYS) {
            const obj = d[bucket as string];
            if (!obj) continue;
            const pick = (o: any, k: 'TXN_Net' | 'TXN_Tax' | 'Total') => k === 'TXN_Net' ? Number(o?.TXN_Net ?? o?.TXN_SaleNoTax ?? 0) : Number(o?.[k] ?? 0);
            for (const m of metrics) {
              const key = `${bucket}_${m}`;
              const num = pick(obj, m);
              if (Number.isFinite(num)) flat[key] = num;
            }
          }
          flat._rowKey = `tls23110_${flat.Day ? String(flat.Day).trim() : `empty_day_${idx}`}`;
          return flat;
        });

        const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;
        const grandFromApi = this.buildGrandFromTotalSummary(res?.Data?.TotalSummary);
        const pageGrand = this.computeGrandTotals(rows);
        const grand = Object.keys(grandFromApi).length ? grandFromApi : pageGrand;

        if (!body?.pageIndex || Number(body.pageIndex) === 1) {
          this.grandTotal = { ...grand };
        }

        const requestedPageSize = body?.pageSize || 1000;
        const effectivePageSize = totalCount <= rows.length ? (rows.length || requestedPageSize) : requestedPageSize;

        this.historyRequestBody = {
          ...this.historyRequestBody,
          ...body,
          pageSize: effectivePageSize,
          pageIndex: body?.pageIndex ?? 1,
        };

        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      })
    );
  };

  // ========= 檔案匯出維護處理 =========
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23110Service.exporttls23110PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
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
      a.remove();
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
      try { return decodeURIComponent(filenameMatch[1].replaceAll('+', ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  // ====== 數據清算工廠方法群 ======
  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) footer[col.field] = this.grandTotal[col.field] ?? 0;
    }
    return footer;
  }

  private computeGrandTotals(rows: any[]): Record<string, number> {
    const totalFields = this.columns.filter((c) => c.isTotal).map((c) => c.field as string);
    const out: Record<string, number> = {};
    for (const f of totalFields) out[f] = 0;
    for (const r of rows) {
      for (const f of totalFields) {
        const v = Number(r?.[f] ?? 0);
        if (Number.isFinite(v)) out[f] += v;
      }
    }
    return out;
  }

  private buildGrandFromTotalSummary(totalSummary: any): Record<string, number> {
    const out: Record<string, number> = {};
    if (!totalSummary) return out;
    for (const col of this.columns) {
      if (!col?.isTotal) continue;
      const field = col.field as string;
      const underscore = field.indexOf('_');
      if (underscore <= 0) continue;

      const bucket = field.slice(0, underscore);
      const metric = field.slice(underscore + 1);
      const bucketObj = totalSummary[bucket];
      if (!bucketObj) continue;

      let val: number;
      if (metric === 'TXN_Net') {
        val = Number(bucketObj?.TXN_Net ?? bucketObj?.TXN_SaleNoTax ?? 0);
      } else {
        val = Number(bucketObj?.[metric] ?? 0);
      }
      if (Number.isFinite(val)) out[field] = val;
    }
    return out;
  }

  // ====== 日期區間輔助運算 ======
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

  private sameMonthValidator(startKey: string, endKey: string): ValidatorFn {
    return (group: AbstractControl): Record<string, any> | null => {
      const start = group.get(startKey)?.value;
      const end = group.get(endKey)?.value;
      if (!start || !end) return null;
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
      return (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) ? null : { notSameMonth: true };
    };
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (Number.isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private toStringOrUndef(v: any): string | undefined {
    if (v === null || v === undefined || v === '') return undefined;
    return String(Array.isArray(v) ? v[0] : v);
  }
}
