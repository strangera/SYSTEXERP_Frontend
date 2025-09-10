import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23070Service } from '../../../service/api/tls/tls23070.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
  LazyLoadEvent,
} from '../../../shared/componentkit/table/table.model';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, map } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-tls23070',
  templateUrl: './tls23070.component.html',
  styleUrls: ['./tls23070.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    Table2Component,

    CalendarComponent
  ],
})
export class TLS23070Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  // ====== 表尾總計 / 群組小計容器 ======
  detailTotals: Record<string, number> = {};
  detailSubtotals: Record<string, Record<string, number>> = {};

  // 總計欄位對應（表尾） -> 對應 totalSummary 的欄位
  detailTotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'totalTotPayAmt',
    TXN_PayAmt10:  'totalPayAmt10',
    TXN_PayAmt41:  'totalPayAmt41',
    TXN_PayAmt42:  'totalPayAmt42',
    TXN_PayAmt12:  'totalPayAmt12',
    TXN_PayAmt81:  'totalPayAmt81',
    TXN_PayAmt43:  'totalPayAmt43',
    TXN_PayAmt44:  'totalPayAmt44',
    TXN_PayAmt14:  'totalPayAmt14',
    TXN_PayAmt82:  'totalPayAmt82',
    TXN_PayAmt52:  'totalPayAmt52',
    TXN_PayAmt20:  'totalPayAmt20',
    TXN_PayAmt62:  'totalPayAmt62',
    TXN_PayAmt77:  'totalPayAmt77',
    TXN_PayAmt71:  'totalPayAmt71',
    TXN_PayAmt30:  'totalPayAmt30',
    TXN_PayAmt73:  'totalPayAmt73',
    TXN_PayAmt72:  'totalPayAmt72',
    TXN_PayAmt74:  'totalPayAmt74',
    TXN_PayAmt75:  'totalPayAmt75',
    TXN_PayAmt76:  'totalPayAmt76',
    TXN_PayAmt24:  'totalPayAmt24',
    TXN_PayAmt25:  'totalPayAmt25',
    TXN_PayAmt07:  'totalPayAmt07',
    TXN_PayAmt55:  'totalPayAmt55',
    TXN_PayAmt83:  'totalPayAmt83',
    TXN_PayAmt78:  'totalPayAmt78',
    TXN_PayAmt79:  'totalPayAmt79',
    TXN_PayAmt21:  'totalPayAmt21',
    TXN_PayAmt53:  'totalPayAmt53',
    TXN_PayAmt56:  'totalPayAmt56',
    TXN_PayAmt57:  'totalPayAmt57',
    TXN_PayAmt58:  'totalPayAmt58',
    TXN_PayAmt59:  'totalPayAmt59',
    TXN_PayAmt60:  'totalPayAmt60',
    TXN_PayAmt22:  'totalPayAmt22',
    TXN_PayAmt23:  'totalPayAmt23',
    TXN_PrePayAmt: 'totalPrePayAmt',
    TXN_OverAmt:   'totalOverAmt',
    TXN_ReturnAmt: 'totalReturnAmt',
    TXN_CancelAmt: 'totalCancelAmt',
  };

  // 小計欄位對應（群組尾） -> 對應 tltNoSubTotals 的欄位
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'tltNoTotalTotPayAmt',
    TXN_PayAmt10:  'tltNoTotalPayAmt10',
    TXN_PayAmt41:  'tltNoTotalPayAmt41',
    TXN_PayAmt42:  'tltNoTotalPayAmt42',
    TXN_PayAmt12:  'tltNoTotalPayAmt12',
    TXN_PayAmt81:  'tltNoTotalPayAmt81',
    TXN_PayAmt43:  'tltNoTotalPayAmt43',
    TXN_PayAmt44:  'tltNoTotalPayAmt44',
    TXN_PayAmt14:  'tltNoTotalPayAmt14',
    TXN_PayAmt82:  'tltNoTotalPayAmt82',
    TXN_PayAmt52:  'tltNoTotalPayAmt52',
    TXN_PayAmt20:  'tltNoTotalPayAmt20',
    TXN_PayAmt62:  'tltNoTotalPayAmt62',
    TXN_PayAmt77:  'tltNoTotalPayAmt77',
    TXN_PayAmt71:  'tltNoTotalPayAmt71',
    TXN_PayAmt30:  'tltNoTotalPayAmt30',
    TXN_PayAmt73:  'tltNoTotalPayAmt73',
    TXN_PayAmt72:  'tltNoTotalPayAmt72',
    TXN_PayAmt74:  'tltNoTotalPayAmt74',
    TXN_PayAmt75:  'tltNoTotalPayAmt75',
    TXN_PayAmt76:  'tltNoTotalPayAmt76',
    TXN_PayAmt24:  'tltNoTotalPayAmt24',
    TXN_PayAmt25:  'tltNoTotalPayAmt25',
    TXN_PayAmt07:  'tltNoTotalPayAmt07',
    TXN_PayAmt55:  'tltNoTotalPayAmt55',
    TXN_PayAmt83:  'tltNoTotalPayAmt83',
    TXN_PayAmt78:  'tltNoTotalPayAmt78',
    TXN_PayAmt79:  'tltNoTotalPayAmt79',
    TXN_PayAmt21:  'tltNoTotalPayAmt21',
    TXN_PayAmt53:  'tltNoTotalPayAmt53',
    TXN_PayAmt56:  'tltNoTotalPayAmt56',
    TXN_PayAmt57:  'tltNoTotalPayAmt57',
    TXN_PayAmt58:  'tltNoTotalPayAmt58',
    TXN_PayAmt59:  'tltNoTotalPayAmt59',
    TXN_PayAmt60:  'tltNoTotalPayAmt60',
    TXN_PayAmt22:  'tltNoTotalPayAmt22',
    TXN_PayAmt23:  'tltNoTotalPayAmt23',
    TXN_PrePayAmt: 'tltNoTotalPrePayAmt',
    TXN_OverAmt:   'tltNoTotalOverAmt',
    TXN_ReturnAmt: 'tltNoTotalReturnAmt',
    TXN_CancelAmt: 'tltNoTotalCancelAmt',
  };

  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: 'TXN_Date', order: 1 }, // 近到遠
    { field: 'ECR_No',   order: 1 },
  ];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_Month: [null],
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    tlt_no:        [],
    tlt_building:  [],
    tlt_floor:     [],
    org_id:        [],
    ...createPaginationConfig([
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No',   order: 1 },
    ]),
  });

  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  constructor(
    private tls23070Service: TLS23070Service,
    private counterNameService: CounterNameService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23070', 'tls/tls23070', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
     this.queryForm.controls.TXN_Month.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d: Date | null) => {
        if (!d || isNaN(new Date(d).getTime())) return;
    
        const { start, end } = this.getMonthRange(d);
        // 同步到「銷售日期」的起訖（避免觸發二次查詢所以不 emit）
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

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

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

// 提供給 Table2 的 lazy 載入函式（在 HTML 綁 [fetchData]="fetchTLS23070"）
fetchTLS23070 = (evt: LazyLoadEvent) => {
  const val = this.queryForm.getRawValue() as any;

  // 分頁/排序（事件優先，其次表單/預設）
  const pageIndex = Number.isFinite(evt?.pageIndex) ? Number(evt!.pageIndex) : Number(val?.pageIndex ?? 1);
  const pageSize  = Number.isFinite(evt?.pageSize)  ? Number(evt!.pageSize)  : Number(val?.pageSize  ?? 20);
  const sortBy    = Array.isArray((evt as any)?.SortBy) && (evt as any).SortBy.length
    ? (evt as any).SortBy
    : (Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort);

  // 與 onSubmit 對齊的 payload（不傳 Offset/OrderBy）
  const payload: any = {
    TXN_DateStart: formatDateToYYYY_MM_DD(val?.TXN_DateStart),
    TXN_DateEnd:   formatDateToYYYY_MM_DD(val?.TXN_DateEnd),
    tlt_no:        Array.isArray(val?.tlt_no) && val.tlt_no.length ? val.tlt_no : undefined,
    tlt_building:  val?.tlt_building ?? undefined,
    tlt_floor:     Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
    org_id:        Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
    pageIndex,
    pageSize,
    SortBy: sortBy,
  };

  // 清理空值
  Object.keys(payload).forEach((k) => {
    const v = payload[k];
    if (v === '' || v === null || v === undefined) delete payload[k];
    if (Array.isArray(v) && v.length === 0) delete payload[k];
  });

  return this.tls23070Service.queryTLS23070(payload).pipe(
    map((res: any) => {
      const data = res?.Data;
      const wrapper = Array.isArray(data) ? (data[0] ?? {}) : (data ?? {});

      // ① 表尾總計（totalSummary）
      const totalSummary = wrapper?.totalSummary ?? {};
      const externalTotals: Record<string, number> = {};
      Object.values(this.detailTotalFieldMap).forEach((apiKey) => {
        externalTotals[apiKey] = Number(totalSummary?.[apiKey] ?? 0);
      });

      // ② 群組小計（tltNoSubTotals）
      const groups = Array.isArray(wrapper?.tltNoSubTotals) ? wrapper.tltNoSubTotals : [];
      const externalSubtotals: Record<string, Record<string, number>> = {};
      for (const g of groups) {
        const groupKey = String(g?.tlt_no ?? 'UNKNOWN');
        const one: Record<string, number> = {};
        Object.values(this.detailSubtotalFieldMap).forEach((apiKey) => {
          one[apiKey] = Number(g?.[apiKey] ?? 0); // 中括號避免 TS4111
        });
        externalSubtotals[groupKey] = one;
      }

      // ③ 明細 rows（從各群組的 subsTotals -> *Details 展開）
      const allSubs = groups.flatMap((g: any) => Array.isArray(g?.subsTotals) ? g.subsTotals : []);
      const details = allSubs.flatMap((s: any) =>
        s?.tLS23070Details ?? s?.TLS23070Details ?? s?.tls23070Details ?? []
      );

      const rows = (Array.isArray(details) ? details : []).map((r: any, i: number) => ({
        ...r,
        _rowKey: `${r?.tlt_no ?? ''}|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${i}`,
      }));

      const totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

      return { rows, totalRecords, externalTotals, externalSubtotals };
    })
  );
};


  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      // ✅ 僅保留 pageIndex/pageSize/SortBy；不傳 Offset / OrderBy
      const payload: any = {
        TXN_DateStart: formatDateToYYYY_MM_DD(val?.TXN_DateStart),
        TXN_DateEnd:   formatDateToYYYY_MM_DD(val?.TXN_DateEnd),
        tlt_no:        val?.tlt_no,
        tlt_building:  val?.tlt_building,
        tlt_floor:     val?.tlt_floor,
        org_id:        val?.org_id,
        pageSize:      Number.isFinite(val?.pageSize)  ? val.pageSize  : 10,
        pageIndex:     Number.isFinite(val?.pageIndex) ? val.pageIndex : 1,
        SortBy:        Array.isArray(val?.SortBy) ? val.SortBy : this.sortMeta,
      };

      // 清掉空值/空陣列
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23070Service.queryTLS23070(payload).subscribe({
        next: (res: any) => {
          const data = res?.Data;
          const wrapper = Array.isArray(data) ? data[0] : data;

          // ====== 表尾總計（totalSummary）======
          const totalSummary = wrapper?.totalSummary ?? {};
          const totals: Record<string, number> = {};
          Object.entries(this.detailTotalFieldMap).forEach(([field, apiKey]) => {
            totals[apiKey] = Number(totalSummary?.[apiKey] ?? 0);
          });
          this.detailTotals = totals;

          // ====== 群組小計（tltNoSubTotals）======
          const groups = Array.isArray(wrapper?.tltNoSubTotals) ? wrapper.tltNoSubTotals : [];
          const subMap: Record<string, Record<string, number>> = {};
          for (const g of groups) {
            const key = String(g?.tlt_no ?? 'UNKNOWN');
            const one: Record<string, number> = {};
            Object.values(this.detailSubtotalFieldMap).forEach((apiKey: string) => {
              one[apiKey] = Number(g?.[apiKey] ?? 0);
            });
            subMap[key] = one;
          }
          this.detailSubtotals = subMap;

          // ====== 明細資料（從 subsTotals 取 details，若無就當空）======
          const allSubs = groups.flatMap((g: any) => Array.isArray(g?.subsTotals) ? g.subsTotals : []);
          const details = allSubs.flatMap((s: any) =>
            (s?.tLS23070Details ?? s?.TLS23070Details ?? s?.tls23070Details ?? []) as any[],
          );

          this.data = (details ?? []).map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.tlt_no ?? ''}|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${i}`,
          }));

          this.totalRecords =
            typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
        },
        error: (err) => {
          console.error('TLS23070 查詢失敗', err);
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.detailSubtotals = {};
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }
   /** 取得某日期所在月份的起訖（start: 1號 00:00:00, end: 當月最後一天 23:59:59） */
private getMonthRange(d: Date) {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-based
  const start = new Date(year, month, 1, 0, 0, 0);              // 1號 00:00:00
  const end   = new Date(year, month + 1, 0, 23, 59, 59);       // 當月最後一天 23:59:59
  return { start, end };
}

/** 若目前銷售日期不是「完整整月」，就把 TXN_Month 清空（避免顯示誤會） */
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

  // ===== 小工具 =====
  formatYMD = (val: unknown): string => {
    if (val == null) return '';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    const s = String(val);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${y}/${mm}/${dd}`;
    }
    return s;
  };

  moneyFormat(value: number): string {
    return value != null ? Number(value || 0).toLocaleString('en-US') : '0';
  }

  // ===== 欄位（含總計/小計標記）=====
  columns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: this.formatYMD },
    { field: 'ECR_No',   header: '收銀機號', visible: true },
    { field: 'tlt_no',   header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    // 總金額
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },

    // 各支付別
    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },

    // 其他金額（API 有提供，若不需顯示可移除欄位；mapping 仍可保留）
    { field: 'TXN_PrePayAmt', header: '預售訂金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_OverAmt',   header: '溢收',     visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨',     visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢',     visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true, isSubTotal: true },
  ];
}
