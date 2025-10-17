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

// Models
import { PayTypeItem, TLS2B030Row } from './tls2b030.model';

// until-destroy
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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

  // 欄位只建一次 → 快取鍵（若後端結構有變，請手動改版本字尾）
  private readonly COL_CACHE_KEY = 'TLS2B030_COLS_V1';

  // 欄位/付款清單
  columns: ReportColumn[] = [];
  payTypes: PayTypeItem[] = [];
  // ===== 狀態 =====

viewTotalRecords = 0;      // 首屏用，先用本頁筆數撐表，高度穩定後再切回 totalRecords
tableVer = 0;              // 強制重建 table 的 key（欄位動態/重新查詢時 ++）




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

  // 金額格式
  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  // 預設排序
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
    const month = d.getMonth(); // 0-based
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

  /** 付款清單 → 欄位（只建一次） */
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
      { field: 'PPay_Dif_sum', header: '總金額', format: this.moneyFormat, isTotal: true },
    ];

    this.columns = [...baseCols, ...payCols, ...totalCol];
  }

  /** ⛳️ 欄位只建一次：先讀快取 → 沒有才打 API → 建欄 → 寫回快取 */
  private initColumnsOnce(): void {
    try {
      const cached = sessionStorage.getItem(this.COL_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { payTypes: PayTypeItem[]; columns: ReportColumn[] };
        this.payTypes = Array.isArray(parsed?.payTypes) ? parsed.payTypes : [];
        this.columns  = Array.isArray(parsed?.columns)  ? parsed.columns  : [];
        if (this.columns.length) {
          this.columnsReady = true;
          return; // 用快取即結束
        }
      }
    } catch { /* ignore bad cache */ }

    // 沒快取 → 打 API 建一次欄位
    this.tls2b030Service.getPayTypes()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (list) => {
          // 可依需求排序；若不想排序，直接用 list
          this.payTypes = [...list].sort((a, b) => a.No.localeCompare(b.No, 'zh-Hant'));
          this.buildColumnsFromPayTypes(this.payTypes);
          this.columnsReady = true;

          // 寫回快取
          try {
            sessionStorage.setItem(
              this.COL_CACHE_KEY,
              JSON.stringify({ payTypes: this.payTypes, columns: this.columns })
            );
          } catch { /* storage full or disallowed */ }
        },
        error: () => {
          // 欄位一定要有；若 API 失敗，至少給最小欄位，避免整頁卡死
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

          // 攤平 PayDiffs => Pay_Dif_XX 欄位
          if (r?.PayDiffs) {
            Object.entries(r.PayDiffs).forEach(([k, v]) => {
              flat[k] = v ?? 0;
            });
          }

          flat._rowKey = `${flat.ECR_No ?? ''}|${flat.TLT_No ?? ''}`;
          return flat;
        });

        const totalCount =
          Number(res?.TotalCount ?? dataAny?.TotalCount ?? rows.length) || rows.length;

        // 只在第 1 頁同步「總計列」
        const isFirstPage = !body?.pageIndex || Number(body.pageIndex) === 1;
        if (isFirstPage) {
          const sumRaw = dataAny?.SumPayDiffs ?? null;
          if (sumRaw) {
            const footer: any = {};
            Object.keys(sumRaw).forEach((k) => {
              const v = sumRaw[k] ?? 0;
              if (k.startsWith('sum_Pay_Dif_')) footer[k.replace('sum_', '')] = v;
              if (k === 'sum_PPay_Dif_sum') footer['PPay_Dif_sum'] = v;
            });
            this.footerData = footer;
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

    // ⛳️ 欄位初始化（只做一次，後續都用快取）
    this.initColumnsOnce();

    // 月份變更 -> 同步日期（不 emit）
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

    // 日期變更 -> 若不是完整整月，清空 TXN_Month
    this.queryForm.controls.TXN_DateStart.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.clearMonthIfNotExactRange());

    // 下拉資料載入
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

  /* ----------------- Submit（固定 pageSize=30；等欄位就緒） ----------------- */
onSubmit(frm: FormGroup) {
  this.submitted = true;

  // 驗證
  if (this.queryForm.invalid) {
    this.queryForm.markAllAsTouched();
    this.messageService?.errorBubble?.('請把日期或月份條件填寫完整', '條件錯誤');
    return;
  }

  // 組 payload（首次固定 30 筆）
  const raw = this.queryForm.getRawValue();
  const payload = this.buildPayload(raw);
  payload.pageIndex = 1;
  payload.pageSize  = 30;

  // 重置畫面狀態
  this.loading = true;
  this.data = [];
  this.selectedItems = [];
  this.footerData = undefined;
  this.totalRecords = 0;        // 清乾淨，避免殘留
  this.viewTotalRecords = 0;    // 首屏先 0，等資料回來後用本頁筆數撐
  this.tableVer++;              // ↩️ 讓 <app-table-report> 強制重建（欄位/狀態都乾淨）

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
      Object.entries(r.PayDiffs).forEach(([k, v]) => (flat[k] = (v as number) ?? 0));
    }
    flat._rowKey = `${flat.ECR_No ?? ''}|${flat.TLT_No ?? ''}`;
    return flat as TLS2B030Row;
  });

  this.data = rows;

  // 先用「本頁筆數」撐出高度，避免臨界筆數撐破
  this.viewTotalRecords = this.data.length;

  // 🔑 立刻跑一次變更偵測，讓 DOM 先以本頁筆數成形
  this.cdr.detectChanges();

  // 下一個 tick 再切回真正總筆數，啟用虛擬捲動/續載
  const realTotal = Number(response?.TotalCount ?? rows.length) || rows.length;
  setTimeout(() => {
    this.totalRecords = realTotal;
    this.viewTotalRecords = realTotal;
    this.lastQueryBody = { ...payload };
  });

  // footer 處理同你原本
  if (sumRaw) {
    const footer: any = {};
    Object.keys(sumRaw).forEach((k) => {
      const v = (sumRaw as any)[k] ?? 0;
      if (k.startsWith('sum_Pay_Dif_')) footer[k.replace('sum_', '')] = v;
      if (k === 'sum_PPay_Dif_sum') footer['PPay_Dif_sum'] = v;
    });
    this.footerData = footer;
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
}
