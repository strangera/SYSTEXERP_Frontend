/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { startWith, distinctUntilChanged, map } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';

// UI
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

// Services
import { TLS2B030Service } from '../../../service/api/tls/tls2-b030.service';
import { CahserTypeService } from '../../../service/basic/cahser-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { RegionService } from '../../../service/basic/region-code.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ButtonModule } from 'primeng/button';
// Models
import { PayTypeItem, TLS2B030Row } from './tls2b030.model';

// until-destroy
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { HttpResponse } from '@angular/common/http';

type SortItem = { field: string; order: 1 | -1 };

@UntilDestroy()
@Component({
  selector: 'app-tls2b030',
  templateUrl: './tls2b030.component.html',
  styleUrl: './tls2b030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    CalendarComponent,
    MultiSelectComponent,
    DropdownComponent,
    CheckboxModule,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule
  ],
})
export class TLS2B030Component extends BasicQueryPageComponent<any> {
  /* ----------------- 狀態 ----------------- */
  data: TLS2B030Row[] = [];
  columnsReady = false;
  totalRecords = 0;
  selectedItems: TLS2B030Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;

  // 欄位只建一次 → 快取鍵
  private readonly COL_CACHE_KEY = 'TLS2B030_COLS_V1';

  // 欄位/付款清單
  columns: ReportColumn[] = [];
  payTypes: PayTypeItem[] = [];

  viewTotalRecords = 0;
  tableVer = 0;

  // 下拉資料
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  cahserTypeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 匯出 loading 狀態
  btnExportLoading = false;

  private readonly moneyNF = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });

  moneyFormat = (value: unknown): string => {
    if (value == null || value === '') return '0';
    const num = typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);
    return Number.isFinite(num) ? this.moneyNF.format(num) : '0';
  };

  private formatMoneyFieldsInRow(flat: any): void {
    Object.keys(flat).forEach((k) => {
      if (k === 'PPay_Dif_sum' || k.startsWith('Pay_Dif_')) {
        flat[k] = this.moneyFormat(flat[k] as unknown);
      }
    });
  }

  private formatMoneyFieldsInFooter(footer: any): any {
    const out: any = {};
    Object.keys(footer || {}).forEach((k) => {
      if (k === 'PPay_Dif_sum' || k.startsWith('Pay_Dif_')) {
        out[k] = this.moneyFormat(footer[k] as unknown);
      } else {
        out[k] = footer[k];
      }
    });
    return out;
  }

  private toNumberLoose(v: unknown): number {
    if (v == null || v === '') return 0;
    if (typeof v === 'string') {
      const n = Number(v.replace(/,/g, ''));
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  readonly defaultSort: SortItem[] = [{ field: 'TLT_Name', order: 1 }];

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    TXN_Month: [null as Date | null],
    TXN_DateStart: [this.yesterday as Date, [Validators.required]],
    TXN_DateEnd: [this.yesterday as Date, [Validators.required]],

    TLT_No_List: this.formBuilder.control([] as string[]),
    ECR_No_List: this.formBuilder.control([] as string[]),
    tlt_floor: this.formBuilder.control([] as string[]),
    area_no: this.formBuilder.control([] as string[]),

    ECR_Type: ['' as string],
    tlt_building: ['' as string],
    OnlyShowOverAmount: [false as boolean],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private tls2b030Service: TLS2B030Service,
    private cahserTypeService: CahserTypeService,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
    private ecrNoService: ECRNoService,
    private cdr: ChangeDetectorRef,
    private counterNameService: CounterNameService
  ) {
    super();
  }

  /* ----------------- 工具 ----------------- */
  private toYMDOrUndef(d: Date | string | null | undefined): string | undefined {
    if (d == null) return undefined;
    const s = formatDateToYYYY_MM_DD(d as Date | string) as string | null | undefined;
    return s == null || s === '' ? undefined : s;
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

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && (x.order === 1 || x.order === -1))
      .map((x) => ({ field: String(x.field), order: x.order as 1 | -1 }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildPayload(base: any): any {
    let dateStart: Date | null = base?.TXN_DateStart ?? null;
    let dateEnd: Date | null = base?.TXN_DateEnd ?? null;

    if (base?.TXN_Month instanceof Date) {
      const { start, end } = this.getMonthRange(base.TXN_Month);
      dateStart = start;
      dateEnd = end;
    }

    const payload: any = {
      TXN_Date_Start: this.toYMDOrUndef(dateStart),
      TXN_Date_End:   this.toYMDOrUndef(dateEnd),

      TLT_No_List: Array.isArray(base?.TLT_No_List) && base.TLT_No_List.length ? base.TLT_No_List : undefined,
      ECR_No_List: Array.isArray(base?.ECR_No_List) && base.ECR_No_List.length ? base.ECR_No_List : undefined,
      tlt_floor:   Array.isArray(base?.tlt_floor)   && base.tlt_floor.length   ? base.tlt_floor   : undefined,
      area_no:     Array.isArray(base?.area_no)     && base.area_no.length     ? base.area_no     : undefined,
      ECR_Type:    base?.ECR_Type || undefined,
      tlt_building:base?.tlt_building || undefined,

      OnlyShowOverAmount: !!base?.OnlyShowOverAmount,

      pageIndex: Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1,
      pageSize:  Number.isFinite(base?.pageSize) && base.pageSize > 0 ? base.pageSize : 10,
      SortBy:    this.normalizeSort(base?.SortBy, this.defaultSort),
    };

    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v == null) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });
    return payload;
  }

  /** ✅ 匯出專用：沿用查詢條件，但移除 pageIndex/pageSize */
  private buildExportPayload(): any {
    const base = this.queryForm.getRawValue();
    const payload = this.buildPayload(base);
    delete payload.pageIndex;
    delete payload.pageSize;
    return payload;
  }

  private buildColumnsFromPayTypes(payTypes: PayTypeItem[]) {
    const baseCols: ReportColumn[] = [
      { field: 'ECR_No',  header: '收銀機號' },
      { field: 'TLT_No',  header: '專櫃編號' },
      { field: 'TLT_Name', header: '櫃位名稱' },
    ];

    const payCols: ReportColumn[] = payTypes.map((pt) => ({
      field: `Pay_Dif_${pt.No}`,
      header: pt.Name,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    }));

    const totalCol: ReportColumn[] = [
      { field: 'PPay_Dif_sum', header: '總金額' , format: this.moneyFormat, isTotal: true },
    ];

    this.columns = [...baseCols, ...payCols, ...totalCol];
  }

  private initColumnsOnce(): void {
    try {
      const cached = sessionStorage.getItem(this.COL_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { payTypes: PayTypeItem[]; columns: ReportColumn[] };
        this.payTypes = Array.isArray(parsed?.payTypes) ? parsed.payTypes : [];
        this.columns  = Array.isArray(parsed?.columns)  ? parsed.columns  : [];
        if (this.columns.length) {
          this.columnsReady = true;
          return;
        }
      }
    } catch { /* ignore */ }

    this.tls2b030Service.getPayTypes()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (list) => {
          this.payTypes = [...list].sort((a, b) => a.No.localeCompare(b.No, 'zh-Hant'));
          this.buildColumnsFromPayTypes(this.payTypes);
          this.columnsReady = true;

          try {
            sessionStorage.setItem(
              this.COL_CACHE_KEY,
              JSON.stringify({ payTypes: this.payTypes, columns: this.columns })
            );
          } catch { /* ignore */ }
        },
        error: () => {
          this.payTypes = [];
          this.columns = [
            { field: 'ECR_No',  header: '收銀機號' },
            { field: 'TLT_No',  header: '專櫃編號' },
            { field: 'TLT_Name', header: '櫃位名稱' },
            { field: 'PPay_Dif_sum', header: '總金額', format: this.moneyFormat, isTotal: true },
          ];
          this.columnsReady = true;
        }
      });
  }

  /* ----------------- 提供給 <app-table-report> 的查詢函式（固定 30） ----------------- */
  public queryTLS2B030ForReport = (body: any) =>
    this.tls2b030Service.queryTLS2B030({ ...(body || {}), pageSize: 30 }).pipe(
      map((res: any) => {
        const dataAny = res?.Data as any;
        const rowsRaw = dataAny?.Rows ?? dataAny ?? [];
        const rows = (Array.isArray(rowsRaw) ? rowsRaw : []).map((r: any) => {
          const flat: any = { ...r };

          if (r?.PayDiffs) {
            Object.entries(r.PayDiffs as Record<string, unknown>).forEach(([k, v]) => {
              flat[k] = this.toNumberLoose(v);
            });
          }
          if (flat.PPay_Dif_sum != null) {
            flat.PPay_Dif_sum = this.toNumberLoose(flat.PPay_Dif_sum as unknown);
          }

          this.formatMoneyFieldsInRow(flat);

          flat._rowKey = `${flat.ECR_No ?? ''}|${flat.TLT_No ?? ''}`;
          return flat;
        });

        const totalCount =
          Number(res?.TotalCount ?? dataAny?.TotalCount ?? rows.length) || rows.length;

        const isFirstPage = !body?.pageIndex || Number(body.pageIndex) === 1;
        if (isFirstPage) {
          const sumRaw = dataAny?.SumPayDiffs ?? null;
          if (sumRaw) {
            const footer: any = {};
            Object.keys(sumRaw).forEach((k) => {
              const raw = sumRaw[k] ?? 0;
              const num = typeof raw === 'string' ? Number(raw.replace(/,/g, '')) : Number(raw);
              const safe = Number.isFinite(num) ? num : 0;

              if (k.startsWith('sum_Pay_Dif_')) footer[k.replace('sum_', '')] = safe;
              if (k === 'sum_PPay_Dif_sum') footer['PPay_Dif_sum'] = safe;
            });
            this.footerData = this.formatMoneyFieldsInFooter(footer);
          } else {
            this.footerData = undefined;
          }
        }

        return { Data: rows, TotalCount: totalCount, GrandTotal: dataAny?.SumPayDiffs ?? null };
      })
    );

  /* ----------------- Init ----------------- */
  ngOnInit(): void {
    this.initializePage('TLS2B030', 'tls/tls2B030cru', this.queryForm, (form) => this.onSubmit(form));

    this.initColumnsOnce();

    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(
        startWith(this.queryForm.controls.TXN_Month.value),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe((d: Date | null) => {
        if (!d || isNaN(new Date(d).getTime())) return;
        const { start, end } = this.getMonthRange(d);
        this.queryForm.patchValue(
          { TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 },
          { emitEvent: false }
        );
      });

    this.queryForm.controls.TXN_DateStart.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());

    this.ecrNoService.getECRNo().pipe(untilDestroyed(this)).subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().pipe(untilDestroyed(this)).subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.cahserTypeService.getSystemTypes().pipe(untilDestroyed(this)).subscribe((res) => (this.cahserTypeOptions = res));
    this.regionService.getRegionOptions().pipe(untilDestroyed(this)).subscribe((data) => (this.regionOptions = data));
    this.floorService.getFloors().pipe(untilDestroyed(this)).subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().pipe(untilDestroyed(this)).subscribe((data) => (this.BUILDING_NO_Options = data));
  }

  /* ----------------- Submit ----------------- */
  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      this.messageService?.errorBubble?.('請把日期或月份條件填寫完整', '條件錯誤');
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload(raw);
    payload.pageIndex = 1;
    payload.pageSize  = 30;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.tls2b030Service
      .queryTLS2B030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          const dataAny = response?.Data as any;
          const rowsRaw = dataAny?.Rows ?? dataAny ?? [];
          const sumRaw  = dataAny?.SumPayDiffs ?? null;

          const rows = (rowsRaw as TLS2B030Row[]).map((r) => {
            const flat: any = { ...r };

            if (r?.PayDiffs) {
              Object.entries(r.PayDiffs as Record<string, unknown>).forEach(([k, v]) => {
                flat[k] = this.toNumberLoose(v);
              });
            }
            if (flat.PPay_Dif_sum != null) {
              flat.PPay_Dif_sum = this.toNumberLoose(flat.PPay_Dif_sum as unknown);
            }

            this.formatMoneyFieldsInRow(flat);

            flat._rowKey = `${flat.ECR_No ?? ''}|${flat.TLT_No ?? ''}`;
            return flat as TLS2B030Row;
          });

          this.data = rows;
          this.viewTotalRecords = this.data.length;
          this.cdr.detectChanges();

          const realTotal = Number(response?.TotalCount ?? rows.length) || rows.length;
          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = { ...payload };
          });

          if (sumRaw) {
            const footer: any = {};
            Object.keys(sumRaw).forEach((k) => {
              const rawv = (sumRaw as any)[k] ?? 0;
              const num = typeof rawv === 'string' ? Number(rawv.replace(/,/g, '')) : Number(rawv);
              const safe = Number.isFinite(num) ? num : 0;

              if (k.startsWith('sum_Pay_Dif_')) footer[k.replace('sum_', '')] = safe;
              if (k === 'sum_PPay_Dif_sum') footer['PPay_Dif_sum'] = safe;
            });

            this.footerData = this.formatMoneyFieldsInFooter(footer);
          } else {
            this.footerData = undefined;
          }

          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          this.loading = false;
        },
        error: (err) => {
          console.error('API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
        },
      });
  }

  onClear(frm: FormGroup) {
    frm.reset({
      TXN_Month: null,
      TXN_DateStart: this.yesterday,
      TXN_DateEnd: this.yesterday,
      TLT_No_List: [],
      ECR_No_List: [],
      tlt_floor: [],
      area_no: [],
      ECR_Type: '',
      tlt_building: '',
      OnlyShowOverAmount: false,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.footerData = undefined;
  }

  /* ----------------- 匯出：Excel ----------------- */
  private getFilenameFromResponse(res: HttpResponse<Blob>, fallback: string): string {
    const cd = res.headers.get('Content-Disposition') || res.headers.get('content-disposition');
    if (!cd) return fallback;
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
    if (!match || !match[1]) return fallback;
    return decodeURIComponent(match[1].replace(/['"]/g, ''));
  }

  private saveBlob(res: HttpResponse<Blob>, defaultName: string) {
    const blob = new Blob([res.body as Blob], { type: res.body?.type || 'application/octet-stream' });
    const fileName = this.getFilenameFromResponse(res, defaultName);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadTLS2B030Excel(): void {
    // 用與查詢相同的條件，但移除分頁
    const payload = this.buildExportPayload();

    // 預設檔名（你也可以補上日期區間）
    const defaultName = 'TLS2B030_專櫃機台溢欠表.xlsx';

    this.btnExportLoading = true;

    this.tls2b030Service.exportTLS2B030Excel(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.saveBlob(res, defaultName);
          this.messageService?.successBubble?.('Excel 產檔完成');
        },
        error: (err) => {
          console.error(err);
          this.messageService?.errorBubble?.('Excel 匯出失敗');
        }
      })
      .add(() => {
        this.btnExportLoading = false;
      });
  }
}
