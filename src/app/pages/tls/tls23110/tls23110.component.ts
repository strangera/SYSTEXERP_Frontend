/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TypeService } from '../../../service/basic/type.service';
import { CategoryService } from '../../../service/basic/category.service';
import { TLS23110Service } from '../../../service/api/tls/tls23110.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';

import { SortMeta } from 'primeng/api';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';

import { CounterNameService } from '../../../service/basic/counter-name.service';
import { CounterOpCatService } from '../../../service/basic/counter-op-cat.service';
import { WhetherService } from '../../../service/basic/whether.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';

import {  finalize, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tls23110',
  templateUrl: './tls23110.component.html',
  styleUrls: ['./tls23110.component.scss'],
  standalone: true,
  imports: [
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
    Table2Component,
    ButtonModule,
  ],
})
export class TLS23110Component extends BasicQueryPageComponent<any> {
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  data: any[] = [];
  totalRecords = 0;
      btnLoading = false;
  historyRequestBody: any | null = null;


  // 排序（預設依 Day 升冪）
  sortMeta: SortMeta[] = [{ field: 'Day', order: 1 }];

  // 用 table2 的總計容器（沒有小計）
  detailTotals: Record<string, number> = {};
  detailTotalFieldMap: Record<string, string> = {
    // 欄位 => 總計鍵名（這裡採用 Total_<欄位>）
    OriginalPrice_TXN_SaleNoTax: 'Total_OriginalPrice_TXN_SaleNoTax',
    OriginalPrice_TXN_Tax:       'Total_OriginalPrice_TXN_Tax',
    OriginalPrice_Total:         'Total_OriginalPrice_Total',

    Discount90_TXN_SaleNoTax: 'Total_Discount90_TXN_SaleNoTax',
    Discount90_TXN_Tax:       'Total_Discount90_TXN_Tax',
    Discount90_Total:         'Total_Discount90_Total',

    Discount80_TXN_SaleNoTax: 'Total_Discount80_TXN_SaleNoTax',
    Discount80_TXN_Tax:       'Total_Discount80_TXN_Tax',
    Discount80_Total:         'Total_Discount80_Total',

    SpecialPrice_TXN_SaleNoTax: 'Total_SpecialPrice_TXN_SaleNoTax',
    SpecialPrice_TXN_Tax:       'Total_SpecialPrice_TXN_Tax',
    SpecialPrice_Total:         'Total_SpecialPrice_Total',

    Total_TXN_SaleNoTax: 'Total_Total_TXN_SaleNoTax',
    Total_TXN_Tax:       'Total_Total_TXN_Tax',
    Total_Total:         'Total_Total_Total',
  };

  // 表單
  queryForm: any = this.formBuilder.group(
    {
      TXN_DateStart: this.formBuilder.control(this.yesterday, { validators: [Validators.required] }),
      TXN_DateEnd:   this.formBuilder.control(this.yesterday, { validators: [Validators.required] }),
      tlt_term_type: this.formBuilder.control(null),
      rece_yn:       this.formBuilder.control('Y'),
      // 類別：只顯示自營櫃/不包含自營櫃（TF）
      IsNoPLU_No:    this.formBuilder.control(null),
      TLT_No:        this.formBuilder.control(null),
      tlt_building:  this.formBuilder.control(null),
      tlt_floor:     this.formBuilder.control(null),
      org_id:        this.formBuilder.control(null),

      ...createPaginationConfig([{ field: 'Day', order: 1 as 1 }]),
    },
    { validators: [this.sameMonthValidator('TXN_DateStart', 'TXN_DateEnd')] }
  ) as FormGroup;

  // 選項
  receYnOptions = [
    { label: '使用業主發票', value: 'Y' },
    { label: '非使用業主發票', value: 'N' },
  ];
  IsNoPLU_NoOptions = [
    { label: '全部', value: null },
    { label: '不包含自營櫃', value: false },
    { label: '只顯示自營櫃', value: true  },
  ];

  DeductionbigCategoryOptions: any[] = [];
  TypeOptions: any[] = [];
  CategoryOptions: any[] = [];
  OrganizationNumberOptions: any[] = [];
  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOpCatOptions: any[] = [];
  WhetherOptions: any[] = [];

  // debounce 防重
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  constructor(
    private tls23110Service: TLS23110Service,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private typeService: TypeService,
    private categoryService: CategoryService,
    private counterOpCatService: CounterOpCatService,
    private counterNameService: CounterNameService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private whetherService: WhetherService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23110', 'tls/tls23110', this.queryForm, (form) => this.onSubmit(form));

    // 限定日期同月（自動矯正）
    const startCtrl = this.queryForm.controls.TXN_DateStart as FormControl;
    const endCtrl   = this.queryForm.controls.TXN_DateEnd   as FormControl;

    const clampEndToStartMonth = () => {
      const s = startCtrl?.value ? new Date(startCtrl.value) : null;
      const e = endCtrl?.value ? new Date(endCtrl.value) : null;
      if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime())) return;

      const sameMonth = (s.getFullYear() === e.getFullYear()) && (s.getMonth() === e.getMonth());
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

    // 載入選項
    this.whetherService.getWhetherOptions().subscribe((data) => (this.WhetherOptions = data));
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe((data) => (this.DeductionbigCategoryOptions = data));
    this.typeService.getTypeOptions().subscribe((data) => (this.TypeOptions = data));
    this.categoryService.getCategories().subscribe((data) => (this.CategoryOptions = data));
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.OrganizationNumberOptions = data));
    this.counterOpCatService.getCounterOpCat().subscribe((data) => (this.CounterOpCatOptions = data));
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

// 提供給 Table2 的 lazy 載入函式（HTML 綁 [fetchData]="fetchTLS23110"）
fetchTLS23110 = (evt: LazyLoadEvent) => {
  const val = this.queryForm.getRawValue() as any;

  // 小工具：與 onSubmit 內一致
  const toIso = (x: any) => {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  };
  const toTF = (x: any) => {
    if (x === true  || x === 'true'  || x === 1 || x === '1') return true;
    if (x === false || x === 'false' || x === 0 || x === '0') return false;
    return undefined;
  };
  const asArr = (x: any) => Array.isArray(x) ? x : (x == null || x === '' ? undefined : [x]);

  // 排序（事件優先 → 表單 → 目前 sortMeta）
  const sortBy =
    (Array.isArray(evt?.SortBy) && evt!.SortBy!.length) ? evt!.SortBy! :
    (Array.isArray(val?.SortBy) && val!.SortBy!.length) ? val!.SortBy! :
    this.sortMeta;

  // 分頁（事件優先 → 表單 → 預設）
  const pageIndex = Number.isFinite(evt?.pageIndex) ? Number(evt!.pageIndex) : Number(val?.pageIndex ?? 1);
  const pageSize  = Number.isFinite(evt?.pageSize)  ? Number(evt!.pageSize)  : Number(val?.pageSize  ?? 20);

  // 與 onSubmit 相同規則（✅ 不帶 Offset / OrderBy）
  const payload: any = {
    TXN_DateStart: toIso(val?.TXN_DateStart),
    TXN_DateEnd  : toIso(val?.TXN_DateEnd),
    tlt_term_type: val?.tlt_term_type ?? undefined,
    rece_yn      : val?.rece_yn ?? undefined,
    IsNoPLU_No   : toTF(val?.IsNoPLU_No),
    TLT_No       : asArr(val?.TLT_No),
    tlt_building : val?.tlt_building ?? undefined,
    tlt_floor    : asArr(val?.tlt_floor),
    org_id       : asArr(val?.org_id),
    pageIndex,
    pageSize,
    SortBy: sortBy,
  };
this.historyRequestBody = { ...payload };
  return this.tls23110Service.queryTLS23110(payload).pipe(
    map((res: any) => {
      // 兼容多種包法
      const rawRows: any[] =
        Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
        Array.isArray(res?.Data)            ? res.Data :
        Array.isArray(res?.QueryData)       ? res.QueryData : [];

      // 依需求攤平欄位
      const preferredOrder = [
        'OriginalPrice','Discount95','Discount90','Discount85','Discount80',
        'Discount75','Discount70','Discount60','Discount50','SpecialPrice','Total'
      ] as const;
      const metrics = ['TXN_SaleNoTax','TXN_Tax','Total'] as const;

      const rows = rawRows.map((row: any) => {
        const flat: any = { Day: row?.Day ?? '' };
        const d = row?.Discount_List || {};
        for (const bucket of preferredOrder) {
          const obj = d[bucket as string];
          if (!obj) continue;
          for (const m of metrics) {
            const key = `${bucket}_${m}`;
            const num = Number(obj[m as string] ?? 0);
            if (Number.isFinite(num)) flat[key] = num;
          }
        }
        flat._rowKey = String(flat.Day || '') || Math.random().toString(36).slice(2);
        return flat;
      });

      const totalRecords =
        typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

      // 表尾總計（用目前畫面 rows + columns 中 isTotal 欄位計）
      const externalTotals = this.buildTotalsFromRows(rows);

      // 本頁沒有群組小計，故不回傳 externalSubtotals
      return { rows, totalRecords, externalTotals };
    })
  );
};


  // 送出查詢（⚠️ 不送 Offset / OrderBy）
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val: any = this.queryForm.getRawValue();

      const toIso = (x: any) => {
        if (!x) return undefined;
        const d = typeof x === 'string' ? new Date(x) : (x as Date);
        if (isNaN(d.getTime())) return undefined;
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
      };
      const toTF = (x: any) => {
        if (x === true  || x === 'true'  || x === 1 || x === '1') return true;
        if (x === false || x === 'false' || x === 0 || x === '0') return false;
        return undefined;
      };
      const asArr = (x: any) => Array.isArray(x) ? x : (x == null || x === '' ? undefined : [x]);

      const payload: any = {
        TXN_DateStart: toIso(val?.TXN_DateStart),
        TXN_DateEnd  : toIso(val?.TXN_DateEnd),
        tlt_term_type: val?.tlt_term_type ?? undefined,
        rece_yn      : val?.rece_yn ?? undefined,
        IsNoPLU_No   : toTF(val?.IsNoPLU_No),
        TLT_No       : asArr(val?.TLT_No),
        tlt_building : val?.tlt_building ?? undefined,
        tlt_floor    : asArr(val?.tlt_floor),
        org_id       : asArr(val?.org_id),
        pageIndex    : val?.pageIndex ?? 1,
        pageSize     : val?.pageSize ?? 20,
        SortBy       : Array.isArray(val?.SortBy) ? val.SortBy : this.sortMeta,
      };
this.historyRequestBody = { ...payload };
      // 清除空值
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23110Service.queryTLS23110(payload).subscribe({
        next: (res: any) => {
          // 期待：Data:[{ Day, Discount_List: { OriginalPrice:{...}, Discount90:{...}, ... , Total:{...} } }]
          const rawRows: any[] =
            Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
            Array.isArray(res?.Data)            ? res.Data :
            Array.isArray(res?.QueryData)       ? res.QueryData : [];

          // 欄位順序與指標
          const preferredOrder = [
            'OriginalPrice','Discount95','Discount90','Discount85','Discount80',
            'Discount75','Discount70','Discount60','Discount50','SpecialPrice','Total'
          ] as const;
          const metrics = ['TXN_SaleNoTax','TXN_Tax','Total'] as const; // 介面顯示的三項

          // 將資料攤平成一列一日 Day + 各 bucket_指標
          const mapped: any[] = [];

          for (const row of rawRows) {
            const flat: any = { Day: row?.Day ?? '' };
            const d = row?.Discount_List || {};
            // 以 preferredOrder 為主，但只取有資料的
            for (const bucket of preferredOrder) {
              const obj = d[bucket as string];
              if (!obj) continue;
              for (const m of metrics) {
                const key = `${bucket}_${m}`;
                const num = Number(obj[m as string] ?? 0);
                if (Number.isFinite(num)) flat[key] = num;
              }
            }
            // _rowKey
            flat._rowKey = String(flat.Day || '') || Math.random().toString(36).slice(2);
            mapped.push(flat);
          }

          this.data = mapped;
          this.totalRecords = mapped.length;

          // ⬇️ 建立總計（對目前畫面欄位求和）
          this.detailTotals = this.buildTotalsFromRows(mapped);
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  /** 依目前 columns 裡有標示 isTotal 的欄位進行總計 */
  private buildTotalsFromRows(rows: any[]): Record<string, number> {
    const totals: Record<string, number> = {};
    // 取需要總計的欄位
    const totalFields = this.columns
      .filter(c => c.isTotal)
      .map(c => c.field as string);

    const toTotalKey = (f: string) => this.detailTotalFieldMap[f] ?? `Total_${f}`;

    for (const r of rows) {
      for (const f of totalFields) {
        const v = Number(r?.[f] ?? 0);
        if (!Number.isFinite(v)) continue;
        const tk = toTotalKey(f);
        totals[tk] = (totals[tk] ?? 0) + v;
      }
    }
    return totals;
  }

  // ====== 工具 ======
  private sameMonthValidator(startKey: string, endKey: string): ValidatorFn {
    return (group: AbstractControl) => {
      const fg = group as FormGroup;
      const start = fg.get(startKey)?.value as Date | string | null | undefined;
      const end   = fg.get(endKey)?.value   as Date | string | null | undefined;

      const clearOurError = () => {
        const ctrl = fg.get(endKey);
        if (!ctrl) return;
        const err = ctrl.errors || {};
        if ('notSameMonth' in err) {
          delete err['notSameMonth'];
          ctrl.setErrors(Object.keys(err).length ? err : null);
        }
      };

      if (!start || !end) { clearOurError(); return null; }
      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) { clearOurError(); return null; }

      const sameMonth = (s.getFullYear() === e.getFullYear()) && (s.getMonth() === e.getMonth());
      if (!sameMonth) {
        const exist = fg.get(endKey)?.errors || {};
        fg.get(endKey)?.setErrors({ ...exist, notSameMonth: true });
        return { notSameMonth: true };
      } else {
        clearOurError();
        return null;
      }
    };
  }

  moneyFormat(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '';
  }

  // 欄位（有標註 isTotal 方便 table2 顯示總計）
  columns: any[] = [
    { field: 'Day', header: '日期', visible: true },

    { field: 'OriginalPrice_TXN_SaleNoTax', header: '正品-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'OriginalPrice_TXN_Tax',       header: '正品-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'OriginalPrice_Total',         header: '正品-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'Discount90_TXN_SaleNoTax', header: '9折-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'Discount90_TXN_Tax',       header: '9折-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'Discount90_Total',         header: '9折-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'Discount80_TXN_SaleNoTax', header: '8折-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'Discount80_TXN_Tax',       header: '8折-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'Discount80_Total',         header: '8折-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'SpecialPrice_TXN_SaleNoTax', header: '特價-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'SpecialPrice_TXN_Tax',       header: '特價-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'SpecialPrice_Total',         header: '特價-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'Total_TXN_SaleNoTax', header: '總計-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'Total_TXN_Tax',       header: '總計-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'Total_Total',         header: '總計-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
  ];
// ===== 匯出：PDF =====
  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23110Service.exporttls23110PDF(this.historyRequestBody).pipe(
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

