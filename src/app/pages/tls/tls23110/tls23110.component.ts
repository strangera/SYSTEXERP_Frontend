/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23110Service } from '../../../service/api/tls/tls23110.service';
import { FloorService } from '../../../service/basic/floor.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { SortMeta } from 'primeng/api';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { CounterNameService } from '../../../service/basic/counter-name.service';

import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

import { HttpResponse } from '@angular/common/http';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, map } from 'rxjs/operators';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23110',
  templateUrl: './tls23110.component.html',
  styleUrls: ['./tls23110.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    DropdownComponent,
    RadiobuttonComponent,
    MultiSelectComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    CalendarComponent,
    TableReportComponent, // ✅ 使用 app-table-report
  ],
})
export class TLS23110Component extends BasicQueryPageComponent<any> {
  // ====== 常數與工具 ======
  /** 後端折扣桶位顯示順序（可擴充） */
  private readonly DISCOUNT_KEYS = [
    'OriginalPrice',
    'Discount95',
    'Discount90',
    'Discount85',
    'Discount80',
    'Discount75',
    'Discount70',
    'Discount60',
    'Discount50',
    'SpecialPrice',
    'Total',
  ] as const;

  /** 顯示用標籤 */
  private readonly labelMap: Record<string, string> = {
    OriginalPrice: '正品',
    Discount95: '95折',
    Discount90: '9折',
    Discount85: '85折',
    Discount80: '8折',
    Discount75: '75折',
    Discount70: '7折',
    Discount60: '6折',
    Discount50: '5折',
    SpecialPrice: '特價',
    Total: '總計',
  };

  // ====== 狀態 ======
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  private grandTotal: Record<string, number> = {};
  data: any[] = [];
  totalRecords = 0;

  btnLoading = false;
  historyRequestBody: any | null = null;

  // 排序（預設依 Day 升冪）
  sortMeta: SortMeta[] = [{ field: 'Day', order: 1 }];

  // ====== 表單 ======
  queryForm: any = this.formBuilder.group(
    {
      TXN_Month: [null],
      TXN_DateStart: this.formBuilder.control(this.yesterday, { validators: [Validators.required] }),
      TXN_DateEnd: this.formBuilder.control(this.yesterday, { validators: [Validators.required] }),
      tlt_term_type: this.formBuilder.control(null),
      rece_yn: this.formBuilder.control('Y'),
      // 類別：只顯示自營櫃/不包含自營櫃（TF）
      IsNoPLU_No: this.formBuilder.control(null),
      TLT_No: this.formBuilder.control(null),
      tlt_building: this.formBuilder.control(null),
      tlt_floor: this.formBuilder.control(null),
      org_id: this.formBuilder.control(null),

      ...createPaginationConfig([{ field: 'Day', order: 1 as 1 }]),
    },
    { validators: [this.sameMonthValidator('TXN_DateStart', 'TXN_DateEnd')] }
  ) as FormGroup;

  // ====== 選項 ======
  receYnOptions = [
    { label: '使用業主發票', value: 'Y' },
    { label: '非使用業主發票', value: 'N' },
  ];
  IsNoPLU_NoOptions = [
    { label: '全部', value: null },
    { label: '不包含自營櫃', value: false },
    { label: '只顯示自營櫃', value: true },
  ];

  DeductionbigCategoryOptions = [
    { value: '0', label: '類別0' },
    { value: '1', label: '類別1' },
    { value: '2', label: '類別2' },
    { value: '3', label: '類別3' },
    { value: '4', label: '類別4' },
    { value: '5', label: '類別5' },
    { value: '6', label: '類別6' },
    { value: '7', label: '類別7' },
    { value: '8', label: '類別8' },
    { value: '9', label: '類別9' },
  ];
  TypeOptions = [
    { value: 1, label: '使用業主發票' },
    { value: 2, label: '非使用業主發票' },
  ];
  OrganizationNumberOptions: any[] = [];
  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOpCatOptions: any[] = [
    { value: '1', label: '不包含自營櫃' },
    { value: '2', label: '只顯示自營櫃' },
  ];

  // ====== 欄位（動態建置，因後端多傳） ======
  columns: any[] = [];

  constructor(
    private tls23110Service: TLS23110Service,
    private counterNameService: CounterNameService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  // ====== 生命週期 ======
  ngOnInit(): void {
    this.initializePage('TLS23110', 'tls/tls23110', this.queryForm, (form) => this.onSubmit(form));

    // 動態建欄位（含 95/85/75/70/60）
    this.columns = this.buildColumns();

    // 月份變更 -> 同步日期
    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d: Date | null) => {
        if (!d || isNaN(new Date(d).getTime())) return;
        const { start, end } = this.getMonthRange(d);
        this.queryForm.patchValue({ TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 }, { emitEvent: false });
      });

    // 若不是整月 -> 清空月份
    this.queryForm.controls.TXN_DateStart.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());

    // 限定日期同月 & 調整結束日
    const startCtrl = this.queryForm.controls.TXN_DateStart as FormControl;
    const endCtrl = this.queryForm.controls.TXN_DateEnd as FormControl;
    const clampEndToStartMonth = () => {
      const s = startCtrl?.value ? new Date(startCtrl.value) : null;
      const e = endCtrl?.value ? new Date(endCtrl.value) : null;
      if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime())) return;
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
    startCtrl.valueChanges.subscribe(clampEndToStartMonth);
    endCtrl.valueChanges.subscribe(clampEndToStartMonth);
    clampEndToStartMonth();

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    // TODO 請呼叫API 不要呼叫寫死的
    // this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.OrganizationNumberOptions = data));
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

  // ====== UI 輔助 ======
  moneyFormat(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '';
  }

  /** 依 DISCOUNT_KEYS 產生所有欄位（未稅/稅額/合計），並標示 isTotal 供加總 */
  private buildColumns() {
    const cols: any[] = [{ field: 'Day', header: '日期', visible: true }];
    for (const key of this.DISCOUNT_KEYS) {
      const label = this.labelMap[key] ?? key;
      cols.push(
        { field: `${key}_TXN_Net`, header: `${label}-未稅`, visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
        { field: `${key}_TXN_SaleNoTax`, header: `${label}-免稅`, visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
        { field: `${key}_TXN_Tax`, header: `${label}-稅額`, visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
        { field: `${key}_Total`, header: `${label}-合計`, visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
      );
    }
    return cols;
  }

  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) footer[col.field] = this.grandTotal[col.field] ?? 0;
    }
    // footer['Day'] = '總計'; // 如需顯示文字可打開
    return footer;
  }

  // ====== 查詢（按鈕）— 固定 pageSize=30 ======
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val: any = this.queryForm.getRawValue();

      const toTF = (x: any) => {
        if (x === true || x === 'true' || x === 1 || x === '1') return true;
        if (x === false || x === 'false' || x === 0 || x === '0') return false;
        return undefined;
      };
      const asArr = (x: any) => (Array.isArray(x) ? x : x == null || x === '' ? undefined : [x]);

      const payload: any = {
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),

        // 🔴 關鍵：統一送「字串」
        tlt_term_type: this.toStringOrUndef(val?.tlt_term_type),

        rece_yn: val?.rece_yn ?? undefined,
        IsNoPLU_No: toTF(val?.IsNoPLU_No),
        TLT_No: asArr(val?.TLT_No),
        tlt_building: val?.tlt_building ?? undefined,
        tlt_floor: asArr(val?.tlt_floor),
        org_id: asArr(val?.org_id),

        pageIndex: val?.pageIndex ?? 1,
        pageSize: 30,
        PageIndex: val?.pageIndex ?? 1,
        PageSize: 30,
        SortBy: Array.isArray(val?.SortBy) ? val.SortBy : this.sortMeta,
      };

      // 提供給 app-table-report
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23110Service
        .queryTLS23110(payload)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          })
        )
        .subscribe({
          next: (res: any) => {
            const rawRows: any[] =
              Array.isArray(res?.Data?.QueryData)
                ? res.Data.QueryData
                : Array.isArray(res?.Data)
                  ? res.Data
                  : Array.isArray(res?.QueryData)
                    ? res.QueryData
                    : [];

            const metrics = ['TXN_Net', 'TXN_SaleNoTax', 'TXN_Tax', 'Total'] as const;

            const mapped = rawRows.map((row: any) => {
              const flat: any = { Day: row?.Day ?? '' };
              const d = row?.Discount_List || {};
              for (const bucket of this.DISCOUNT_KEYS) {
                const obj = d[bucket as string];
                if (!obj) continue;

                // 兼容：優先 TXN_Net，沒有就退回 TXN_SaleNoTax
                const pick = (o: any, k: 'TXN_Net' | 'TXN_SaleNoTax' | 'TXN_Tax' | 'Total') =>
                  k === 'TXN_Net' ? Number(o?.TXN_Net ?? o?.TXN_SaleNoTax ?? 0) : Number(o?.[k] ?? 0);

                for (const m of metrics) {
                  const key = `${bucket}_${m}`;
                  const num = pick(obj, m);
                  if (Number.isFinite(num)) flat[key] = num;
                }
              }
              flat._rowKey = String(flat.Day || '') || Math.random().toString(36).slice(2);
              return flat;
            });

            this.data = mapped;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : mapped.length;

            // 🔴 首次 onSubmit 也要算出總計，讓 footer 有資料
            const grandFromApi = this.buildGrandFromTotalSummary(res?.Data?.TotalSummary);
            const fallbackGrand = this.computeGrandTotals(mapped);
            this.grandTotal = Object.keys(grandFromApi).length ? grandFromApi : fallbackGrand;

            // const footer = this.buildFooterFromGrandTotal();
            // if (footer) footer['Day'] = '總計';
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
          },
        });
    });
  }

  // ====== 提供給 app-table-report 的查詢函式 — 固定 pageSize=30，回傳 GrandTotal ======
  public queryTLS23110ForReport = (body: any) =>
    this.tls23110Service
      .queryTLS23110({
        ...(body || {}),
        TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),

        // 🔴 關鍵：統一字串
        tlt_term_type: this.toStringOrUndef(body?.tlt_term_type ?? this.queryForm.value?.tlt_term_type),

        pageSize: 30,
        PageSize: 30,
      })
      .pipe(
        map((res: any) => {
          const rawRows: any[] =
            Array.isArray(res?.Data?.QueryData)
              ? res.Data.QueryData
              : Array.isArray(res?.Data)
                ? res.Data
                : Array.isArray(res?.QueryData)
                  ? res.QueryData
                  : [];

          const metrics = ['TXN_Net', 'TXN_Tax', 'Total'] as const;

          const rows = rawRows.map((row: any) => {
            const flat: any = { Day: row?.Day ?? '' };
            const d = row?.Discount_List || {};
            for (const bucket of this.DISCOUNT_KEYS) {
              const obj = d[bucket as string];
              if (!obj) continue;

              const pick = (o: any, k: 'TXN_Net' | 'TXN_Tax' | 'Total') =>
                k === 'TXN_Net' ? Number(o?.TXN_Net ?? o?.TXN_SaleNoTax ?? 0) : Number(o?.[k] ?? 0);

              for (const m of metrics) {
                const key = `${bucket}_${m}`;
                const num = pick(obj, m);
                if (Number.isFinite(num)) flat[key] = num;
              }
            }
            flat._rowKey = String(flat.Day || '') || Math.random().toString(36).slice(2);
            return flat;
          });

          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // ✅ 優先用 API 的 TotalSummary 轉成對應欄位；沒有就用當頁加總
          const grandFromApi = this.buildGrandFromTotalSummary(res?.Data?.TotalSummary);
          const pageGrand = this.computeGrandTotals(rows);
          const grand = Object.keys(grandFromApi).length ? grandFromApi : pageGrand;

          // ✅ 只在第一頁同步到 component 狀態，避免後面分頁覆蓋
          const isFirstPage = !body?.pageIndex || Number(body.pageIndex) === 1;
          if (isFirstPage) this.grandTotal = { ...grand };

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );

  // ====== 匯出 PDF：不帶 pageSize/pageIndex（含大小寫） ======
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
    const body = this.buildExportBody();
    this.tls23110Service
      .exporttls23110PDF(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
      });
  }

  // ====== 下載處理 ======
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

  /** 以 columns 裡 isTotal=true 的欄位，對目前 rows 求和，回傳 { [field]: total } */
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

  /** 把 API 的 TotalSummary 轉成 { [field]: number }，只產出 columns 中 isTotal 的欄位 */
  private buildGrandFromTotalSummary(totalSummary: any): Record<string, number> {
    const out: Record<string, number> = {};
    if (!totalSummary) return out;

    for (const col of this.columns) {
      if (!col?.isTotal) continue;
      const field = col.field as string;

      // 只切第一個底線
      const underscore = field.indexOf('_');
      if (underscore <= 0) continue; // 防呆，例如 "Day"

      const bucket = field.slice(0, underscore); // e.g. "OriginalPrice"
      const metric = field.slice(underscore + 1); // e.g. "TXN_Net" / "TXN_Tax" / "Total"

      const bucketObj = totalSummary[bucket];
      if (!bucketObj) continue;

      let val: number;
      if (metric === 'TXN_Net') {
        // 相容後端可能用 TXN_SaleNoTax 的情況
        val = Number(bucketObj?.TXN_Net ?? bucketObj?.TXN_SaleNoTax ?? 0);
      } else {
        val = Number(bucketObj?.[metric] ?? 0);
      }

      if (Number.isFinite(val)) out[field] = val;
    }

    return out;
  }

  // ====== 日期工具 ======
  /** 取得某日期所在月份的起訖 */
  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-based
    const start = new Date(year, month, 1, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return { start, end };
  }

  /** 若目前銷售日期不是完整整月，清空 TXN_Month */
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

  /** 驗證兩個日期是否在同一個月份 */
  private sameMonthValidator(startKey: string, endKey: string): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const start = group.get(startKey)?.value;
      const end = group.get(endKey)?.value;
      if (!start || !end) return null;
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
      const sameMonth = startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth();
      return sameMonth ? null : { notSameMonth: true };
    };
  }

  // ====== 其他工具 ======
  /** yyyy-MM-dd（DateOnly），相容字串/Date，無時區偏移 */
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  // 放在 class 內
  private normalizeTermType(v: any): string[] | undefined {
    if (v == null || v === '') return undefined;
    if (Array.isArray(v)) return v.map((x) => String(x));
    return [String(v)]; // 0 -> "0"
  }
  // class 裡加上：把任何輸入轉成「字串 or undefined」；若傳陣列取第一個
  private toStringOrUndef(v: any): string | undefined {
    if (v === null || v === undefined || v === '') return undefined;
    const take = Array.isArray(v) ? v[0] : v; // 防呆：有人把單選設成 [0]
    return String(take);
  }

}
