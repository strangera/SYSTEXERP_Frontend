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
import { CommonModule } from '@angular/common';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TypeService } from '../../../service/basic/type.service';
import { CategoryService } from '../../../service/basic/category.service';
import { TLS23110Service } from '../../../service/api/tls/tls23110.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';

import { SortMeta } from 'primeng/api';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

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
import { ButtonModule } from 'primeng/button';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

import { finalize, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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

  // 表單
  queryForm: any = this.formBuilder.group(
    {
      TXN_Month: [null],
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

    // 月份變更 -> 同步日期
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

    // 若不是整月 -> 清空月份
    this.queryForm.controls.TXN_DateStart.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());

    // 限定日期同月
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

    // 選項載入
    this.whetherService.getWhetherOptions().subscribe((data) => (this.WhetherOptions = data));
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe((data) => (this.DeductionbigCategoryOptions = data));
    this.typeService.getTypeOptions().subscribe((data) => (this.TypeOptions = data));
    this.categoryService.getCategories().subscribe((data) => (this.CategoryOptions = data));
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.OrganizationNumberOptions = data));
    this.counterOpCatService.getCounterOpCat().subscribe((data) => (this.CounterOpCatOptions = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
  }

  // ====== 查詢（按鈕）— 固定 pageSize=30 ======
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
        // ✅ 固定 30（大小寫都帶，避免後端鍵名差異）
        pageIndex    : val?.pageIndex ?? 1,
        pageSize     : 30,
        PageIndex    : val?.pageIndex ?? 1,
        PageSize     : 30,
        SortBy       : Array.isArray(val?.SortBy) ? val.SortBy : this.sortMeta,
      };

      // 提供給 app-table-report
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23110Service.queryTLS23110(payload).pipe(
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res: any) => {
          const rawRows: any[] =
            Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
            Array.isArray(res?.Data)            ? res.Data :
            Array.isArray(res?.QueryData)       ? res.QueryData : [];

          const preferredOrder = [
            'OriginalPrice','Discount95','Discount90','Discount85','Discount80',
            'Discount75','Discount70','Discount60','Discount50','SpecialPrice','Total'
          ] as const;
          const metrics = ['TXN_SaleNoTax','TXN_Tax','Total'] as const;

          const mapped = rawRows.map((row: any) => {
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

          this.data = mapped;
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : mapped.length;
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
      .queryTLS23110({ ...(body || {}), pageSize: 30, PageSize: 30 })
      .pipe(
        map((res: any) => {
          const rawRows: any[] =
            Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
            Array.isArray(res?.Data)            ? res.Data :
            Array.isArray(res?.QueryData)       ? res.QueryData : [];

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

          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // GrandTotal：以欄位(field)為鍵，僅對 columns 中 isTotal=true 的欄位加總
          const grand = this.computeGrandTotals(rows);

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );

  // ===== 匯出 PDF：不帶 pageSize/pageIndex（含大小寫） =====
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
    this.tls23110Service.exporttls23110PDF(body).pipe(
      finalize(() => (this.btnLoading = false))
    ).subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
      error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
    });
  }

  // ===== 下載處理 =====
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

  /** 以 columns 裡 isTotal=true 的欄位，對目前 rows 求和，回傳 { [field]: total } */
  private computeGrandTotals(rows: any[]): Record<string, number> {
    const totalFields = this.columns.filter(c => c.isTotal).map(c => c.field as string);
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

  // ====== 欄位 ======
  moneyFormat(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '';
  }

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

  /** 取得某日期所在月份的起訖 */
  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-based
    const start = new Date(year, month, 1, 0, 0, 0);
    const end   = new Date(year, month + 1, 0, 23, 59, 59);
    return { start, end };
  }

  /** 若目前銷售日期不是完整整月，清空 TXN_Month */
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
}
