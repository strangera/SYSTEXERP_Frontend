/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { startWith, distinctUntilChanged, finalize, map } from 'rxjs/operators';

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
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✓ 金額格式化
  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  // ===== 排序（維持你原本預設）=====
  readonly defaultSort: SortItem[] = [{ field: 'TLT_Name', order: 1 }];

  // ===== 表單 =====
  // 改成：TXN_Month + TXN_DateStart/End（和 TLS23070 一致做法）
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

  // ===== 下拉資料 =====
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  cahserTypeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  // ===== 欄位 =====
  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'Pay_Dif_10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_41', header: '聯信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_42', header: '聯信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_12', header: '聯信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_56', header: 'iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'PPay_Dif_sum', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
  ];

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
private toYMDOrUndef(d: Date | string | null | undefined): string | undefined {
  if (d == null) return undefined; // 同時擋掉 null/undefined
  const s = formatDateToYYYY_MM_DD(d as Date | string) as string | null | undefined;
  return s == null || s === '' ? undefined : s;
}

  // ===== 工具 =====
  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-based
    const start = new Date(year, month, 1, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return { start, end };
  }

  /** 若目前銷售日期不是「完整整月」，就把 TXN_Month 清空（避免顯示誤會） */
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
        (x) =>
          x &&
          typeof x.field === 'string' &&
          (x.order === 1 || x.order === -1)
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
TXN_DateEnd:   this.toYMDOrUndef(dateEnd),

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

  // ===== Init =====
  ngOnInit(): void {
    this.initializePage('TLS2B030', 'tls/tls2B030cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

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
    this.queryForm.controls.TXN_DateStart.valueChanges
      .subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges
      .subscribe(() => this.clearMonthIfNotExactRange());

    // 下拉資料
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

    // 基本 required 在 DateStart/End 上，若用月份會同步成整月後再組 payload
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
            this.data = response.Data || [];
            this.totalRecords =
              typeof response?.TotalCount === 'number'
                ? response.TotalCount
                : this.data.length || 0;

            // 保存查詢狀態
            this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          } else {
            console.error('API error:', response?.Status, response?.Message);
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
