/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { startWith, distinctUntilChanged } from 'rxjs/operators';

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
    TableComponent,
  ],
})
export class TLS2B030Component extends BasicQueryPageComponent<any> {
  // ===== 狀態 =====
  data: TLS2B030Row[] = [];
  totalRecords = 0;
  selectedItems: TLS2B030Row[] = [];

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
  columns: any[] = [];

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
    // 先決定要送出的日期範圍
    let dateStart: Date | null = base?.TXN_DateStart ?? null;
    let dateEnd: Date | null = base?.TXN_DateEnd ?? null;

    if (base?.TXN_Month instanceof Date) {
      const { start, end } = this.getMonthRange(base.TXN_Month);
      dateStart = start;
      dateEnd = end;
    }

    const payload: any = {
      TXN_DateStart: this.toYMDOrUndef(dateStart),
      TXN_DateEnd: this.toYMDOrUndef(dateEnd),

      // 篩選條件
      TLT_No_List:
        Array.isArray(base?.TLT_No_List) && base.TLT_No_List.length
          ? base.TLT_No_List
          : undefined,
      ECR_No_List:
        Array.isArray(base?.ECR_No_List) && base.ECR_No_List.length
          ? base.ECR_No_List
          : undefined,
      tlt_floor:
        Array.isArray(base?.tlt_floor) && base.tlt_floor.length
          ? base.tlt_floor
          : undefined,
      area_no:
        Array.isArray(base?.area_no) && base.area_no.length
          ? base.area_no
          : undefined,
      ECR_Type: base?.ECR_Type || undefined,
      tlt_building: base?.tlt_building || undefined,

      // 其它
      OnlyShowOverAmount: !!base?.OnlyShowOverAmount,

      // 分頁 / 排序
      pageIndex:
        Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
          ? base.pageIndex
          : 1,
      pageSize:
        Number.isFinite(base?.pageSize) && base.pageSize > 0
          ? base.pageSize
          : 10,
      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),
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
    const baseCols = [
      { field: 'ECR_No', header: '收銀機號', visible: true },
      { field: 'TLT_No', header: '專櫃編號', visible: true },
      { field: 'TLT_Name', header: '櫃位名稱', visible: true, style: 'text-left' },
    ];

    const payCols = payTypes.map((pt) => ({
      field: `Pay_Dif_${pt.No}`,
      header: pt.Name,
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    }));

    const totalCol = [
      {
        field: 'PPay_Dif_sum',
        header: '總金額',
        visible: true,
        style: 'text-right',
        format: this.moneyFormat,
        isTotal: true,
      },
    ];

    this.columns = [...baseCols, ...payCols, ...totalCol];
  }

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

    this.handleSubmit(frm, () => {
      this.loading = true;
      this.tls2b030Service.queryTLS2B030(payload).subscribe({
        next: (response) => {
          if (response?.Status === '0000') {
            const rows = (response.Data || []) as TLS2B030Row[];

            // ★ 把 PayDiffs 攤平成同層（field: Pay_Dif_XX），配合動態 columns 顯示
            this.data = rows.map((r) => {
              const flat: any = { ...r };
              if (r.PayDiffs) {
                Object.entries(r.PayDiffs).forEach(([k, v]) => {
                  flat[k] = v ?? 0;
                });
              }
              return flat as TLS2B030Row;
            });

            this.totalRecords =
              typeof response?.TotalCount === 'number'
                ? response.TotalCount
                : this.data.length || 0;

            // 保存查詢狀態
            this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          } else {
            console.error('API error:', response?.Status, response?.Message);
            this.data = [];
            this.totalRecords = 0;
          }
          this.loading = false;
        },
        error: (err: any) => {
          console.error('API error:', err);
          this.data = [];
          this.totalRecords = 0;
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
