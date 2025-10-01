/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
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
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

// Services
import { TLS2B030Service } from '../../../service/api/tls/tls2-b030.service';
import { CahserTypeService } from '../../../service/basic/cahser-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { RegionService } from '../../../service/basic/region-code.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
// 追加 import（若尚未）
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';


// Models
import { PayTypeItem, TLS2B030Row } from './tls2b030.model';

type SortItem = { field: string; order: 1 | -1 };

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
    // TableComponent,
    TableReportComponent,
  ],
})
export class TLS2B030Component extends BasicQueryPageComponent<any> {
  // ===== 狀態 =====
  data: TLS2B030Row[] = [];
  totalRecords = 0;
  selectedItems: TLS2B030Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined; // 頁尾總計列（SumPayDiffs 會映射進來）
  queryFn = (body: any) => this.tls2b030Service.queryTLS2B030(body);

  // 動態付款清單（No/Name）
  payTypes: PayTypeItem[] = [];

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

  // ===== 表單 =====
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

  // 表格欄位（動態）
  columns: ReportColumn[] = [];

  constructor(
    private tls2b030Service: TLS2B030Service,
    private cahserTypeService: CahserTypeService,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
    private ecrNoService: ECRNoService,
    private counterNameService: CounterNameService
  ) {
    super();
  }

  // ===== 工具 =====
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

  /** 若目前銷售日期不是完整整月，就把 TXN_Month 清空（避免顯示誤會） */
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
      .filter(
        (x) => x && typeof x.field === 'string' && (x.order === 1 || x.order === -1)
      )
      .map((x) => ({ field: String(x.field), order: x.order as 1 | -1 }));
    return cleaned.length ? cleaned : fallback;
  }

 private buildPayload(base: any): any {
  // 先決定要送出的日期範圍（若有選月份，就把日期設為整月）
  let dateStart: Date | null = base?.TXN_DateStart ?? null;
  let dateEnd: Date | null = base?.TXN_DateEnd ?? null;

  if (base?.TXN_Month instanceof Date) {
    const { start, end } = this.getMonthRange(base.TXN_Month);
    dateStart = start;
    dateEnd = end;
  }

  const payload: any = {
    // ✅ 與後端 DTO 對齊（有底線）
    TXN_Date_Start: this.toYMDOrUndef(dateStart),
    TXN_Date_End:   this.toYMDOrUndef(dateEnd),

    // 篩選條件
    TLT_No_List: Array.isArray(base?.TLT_No_List) && base.TLT_No_List.length ? base.TLT_No_List : undefined,
    ECR_No_List: Array.isArray(base?.ECR_No_List) && base.ECR_No_List.length ? base.ECR_No_List : undefined,
    tlt_floor:   Array.isArray(base?.tlt_floor)   && base.tlt_floor.length   ? base.tlt_floor   : undefined,
    area_no:     Array.isArray(base?.area_no)     && base.area_no.length     ? base.area_no     : undefined,
    ECR_Type:    base?.ECR_Type || undefined,
    tlt_building:base?.tlt_building || undefined,

    OnlyShowOverAmount: !!base?.OnlyShowOverAmount,

    // 分頁 / 排序
    pageIndex: Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1,
    pageSize:  Number.isFinite(base?.pageSize) && base.pageSize > 0  ? base.pageSize  : 10,
    SortBy:    this.normalizeSort(base?.SortBy, this.defaultSort),
  };

  // 刪空字串/空陣列/null/undefined
  Object.keys(payload).forEach((k) => {
    const v = payload[k];
    if (v === '' || v == null) delete payload[k];
    if (Array.isArray(v) && v.length === 0) delete payload[k];
  });
  return payload;
}


  /** 用付款清單動態建欄 */
private buildColumnsFromPayTypes(payTypes: PayTypeItem[]) {
  const baseCols: ReportColumn[] = [
    { field: 'ECR_No',  header: '收銀機號' },
    { field: 'TLT_No',  header: '專櫃編號' },
    { field: 'TLT_Name', header: '櫃位名稱' }, // ← 改這裡
  ];

  const payCols: ReportColumn[] = payTypes.map((pt) => ({
    field: `Pay_Dif_${pt.No}`,
    header: pt.Name,
    style: 'text-right',          // ← 改這裡
    format: this.moneyFormat,
    isTotal: true,
  }));

  const totalCol: ReportColumn[] = [
    {
      field: 'PPay_Dif_sum',
      header: '總金額',
      
      format: this.moneyFormat,
      isTotal: true,
    },
  ];

  this.columns = [...baseCols, ...payCols, ...totalCol];
}

// ✅ 提供給 <app-table-report> 的查詢函式（包裝成 Data/TotalCount）
// - 攤平 PayDiffs 成同層欄位（讓動態欄可直接綁）
// - 兼容 API 回傳可能的 { Data: { Rows, SumPayDiffs }, TotalCount } 或 { Data: [] } 兩種型態
public queryTLS2B030ForReport = (body: any) =>
  this.tls2b030Service.queryTLS2B030(body).pipe(
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

        // 產一個穩定的列 key（避免用 TLT_Name 造成重複）
        flat._rowKey = `${flat.ECR_No ?? ''}|${flat.TLT_No ?? ''}`;
        return flat;
      });

      const totalCount =
        Number(res?.TotalCount ?? dataAny?.TotalCount ?? rows.length) || rows.length;

      // 若你有 API 總計（SumPayDiffs），也一併帶回（子表 footer 會用不到，但保留無妨）
      const grandTotal = dataAny?.SumPayDiffs ?? null;

      return { Data: rows, TotalCount: totalCount, GrandTotal: grandTotal };
    })
  );

  // ===== Init =====
  ngOnInit(): void {
    this.initializePage(
      'TLS2B030',
      'tls/tls2B030cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

    // 1) 先把付款清單抓回來，建欄
    this.tls2b030Service.getPayTypes().subscribe((list) => {
      // 依 No 字串排序（或沿用 API 順序）
      this.payTypes = [...list].sort((a, b) => a.No.localeCompare(b.No, 'zh-Hant'));
      this.buildColumnsFromPayTypes(this.payTypes);
    });

    // 月份變更 -> 同步日期（不 emit）
    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(startWith(this.queryForm.controls.TXN_Month.value), distinctUntilChanged())
      .subscribe((d: Date | null) => {
        if (!d || isNaN(new Date(d).getTime())) return;
        const { start, end } = this.getMonthRange(d);
        this.queryForm.patchValue(
          { TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 },
          { emitEvent: false }
        );
      });

    // 日期變更 -> 若不是完整整月，清空 TXN_Month
    this.queryForm.controls.TXN_DateStart.valueChanges.subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges.subscribe(() => this.clearMonthIfNotExactRange());

    // 下拉資料載入
    this.ecrNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.cahserTypeService.getSystemTypes().subscribe((res) => (this.cahserTypeOptions = res));
    this.regionService.getRegionOptions().subscribe((data) => (this.regionOptions = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
  }

  // ===== Submit =====
onSubmit(frm: FormGroup) {
  this.submitted = true;
  if (this.queryForm.invalid) {
    this.queryForm.markAllAsTouched();
    this.messageService?.errorBubble?.('請把日期或月份條件填寫完整', '條件錯誤');
    return;
  }

  const raw = this.queryForm.getRawValue();
  const payload = this.buildPayload(raw);

  // ✅ 初次查詢用 30 筆，並保存 lastQueryBody 給子表用
  payload.pageIndex = 1;
  payload.pageSize  = 30;
  this.lastQueryBody = { ...payload };

  this.handleSubmit(frm, () => {
    this.loading = true;
    this.tls2b030Service.queryTLS2B030(payload).subscribe({
      next: (response) => {
        // 兼容 {Data:{Rows,SumPayDiffs}} / {Data:[]}
        const dataAny = response?.Data as any;
        const rowsRaw = dataAny?.Rows ?? dataAny ?? [];
        const sumRaw  = dataAny?.SumPayDiffs ?? null;

        const rows = (rowsRaw as TLS2B030Row[]).map((r) => {
          const flat: any = { ...r };

          // 攤平 PayDiffs
          if (r?.PayDiffs) {
            Object.entries(r.PayDiffs).forEach(([k, v]) => (flat[k] = v ?? 0));
          }

          // ✅ 給子表穩定 key（很重要）
          flat._rowKey = `${flat.ECR_No ?? ''}|${flat.TLT_No ?? ''}`;
          return flat as TLS2B030Row;
        });

        this.data = rows;

        // ✅ 這裡一定要用「後端總筆數」
        this.totalRecords = Number(response?.TotalCount ?? this.data.length) || this.data.length;

        // ✅ 頁尾總計（維持你原本的映射）
        if (sumRaw) {
          const footer: any = {};
          Object.keys(sumRaw).forEach((k) => {
            const v = sumRaw[k] ?? 0;
            if (k.startsWith('sum_Pay_Dif_')) {
              const code = k.replace('sum_', ''); // sum_Pay_Dif_10 → Pay_Dif_10
              footer[code] = v;
            }
            if (k === 'sum_PPay_Dif_sum') {
              footer['PPay_Dif_sum'] = v;
            }
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
        this.footerData = undefined;
        this.loading = false;
      },
    });
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
  }


}
