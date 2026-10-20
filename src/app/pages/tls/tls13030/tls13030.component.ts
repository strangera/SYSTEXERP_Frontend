/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

import { LazyLoadEvent } from '../../../others/component/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS13030Service } from '../../../service/api/tls/tls13030.service';
// UI
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MultiLocationFilterComponent } from 'src/app/shared/biz-components/multi-location-filter/multi-location-filter.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

@UntilDestroy()
@Component({
  selector: 'app-tls13030',
  templateUrl: './tls13030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    MultiLocationFilterComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    DropdownComponent,
    CalendarRangeComponent,
  ],
})
export class TLS13030Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 排序 / lazy 相關 =====
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [{ field: 'tlt_no', order: 1 }];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;
  footerData: any[] = [];
  private readonly includePagingAndSorting = true;
  lastQueryBody: any = null;
  queryTLS13030Fn = (body: any) =>
    this.tls13030Service.queryTLS13030(body).pipe(
      map((res: any) => ({
        Data: res?.Data?.QueryData ?? [],
        TotalCount: res?.TotalCount ?? res?.Data?.TotalCount ?? 0,
        QueryDataSum: res?.Data?.QueryDataSum ?? null,
      }))
    );
  private readonly allowedSortFields = new Set<string>([
    'tlt_no', 'tlt_name', 'tlt_building', 'location_no',
    'floor_desc', 'area_desc', 'bus_type', 'bus_type_name',
    'tlt_bdate', 'tlt_edate', 'cap_type', 'CAP_Name',
    'tpy_bdate', 'tpy_edate', 'tpy_totalamt', 'down_payment', 'ADV_payment',
    'period_nos', 'tpy_amount', 'tpy_rate', 'org_id', 'org_name'
  ]);

  isPrint = true;

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  // ===== 表單 =====
  queryForm = this.formBuilder.group({
    tlt_no: ['', [Validators.maxLength(10)]],
    tlt_name: ['', [Validators.maxLength(50)]],
    floor_noList: [[] as string[]],
    area_noList: [[] as string[]],
    tlt_openflagList: [[] as string[]],
    tlt_bdate_start: [],
    tlt_bdate_end: [],
    tlt_edate_start: [null],
    tlt_edate_end: [null],

    cap_typeList: [[] as string[]], // 扣款類別
    cap_itemList: [[] as string[]], // 扣款代碼

    tpy_bdate_start: [null],
    tpy_bdate_end: [null],
    tpy_edate_start: [null],
    tpy_edate_end: [null],
    bus_typeList: [[] as string[]],
    tlt_building: ['', [Validators.maxLength(1)]],
    org_idList: [[] as string[]],

    // ✅ 分頁 + 排序（小寫 pageIndex / pageSize）
    ...createPaginationConfig([
      { field: 'tlt_no', order: 1 },
    ]),
  });

  // ===== 下拉選項 =====
  operationStatusOptions = [
    { value: '0', label: '已撤櫃' },
    { value: '1', label: '營業中' },
    { value: '9', label: '合約未生效' },
  ];

  bus_typeOptions: any = [];
  deductionCategoryOptions = [
    { value: 'A', label: 'A-一次扣款' },
    { value: 'B', label: 'B-每月扣款' },
    { value: 'C', label: 'C-平均分攤' },
    { value: 'D', label: 'D-比率分攤' },
    { value: 'Z', label: 'Z-其他扣款' },
  ];

  deductCodeNameOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  organizationOptions: any[] = [];
  CounterOptions: any[] = [];


  // ===== 表格欄位 =====
  columns: any[] = [
    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'area_desc', header: '區域', visible: true, style: 'text-left' },
    { field: 'org_name', header: '組織名稱', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'location_no', header: '位置編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'bus_type', header: '大分類代碼', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'tlt_bdate', header: '合約起始日', visible: true },
    { field: 'tlt_edate', header: '合約截止日', visible: true },
    { field: 'cap_type', header: '扣款類別', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true, style: 'text-left' },
    { field: 'tpy_bdate', header: '扣款起日', visible: true },
    { field: 'tpy_edate', header: '扣款迄日', visible: true },
    { field: 'tpy_totalamt', header: '總金額', visible: true, format: (v: any) => this.moneyFormat(v), style: 'text-right' },
    { field: 'ADV_payment', header: '頭期款', visible: true, format: (v: any) => this.moneyFormat(v), style: 'text-right' },
    { field: 'period_nos', header: '期數', visible: true },
    { field: 'tpy_amount', header: '每期金額', visible: true, format: (v: any) => this.moneyFormat(v), style: 'text-right' },
    { field: 'down_payment', header: '首期金額', visible: true, format: (v: any) => this.moneyFormat(v), style: 'text-right' },
    { field: 'tpy_rate', header: '比率或元(月利率%)', visible: true, style: 'text-right' },
    { field: 'defSalesAmt', header: '預設營業額', visible: true, format: (v: any) => v ?? 0, style: 'text-right' },
    { field: 'commRate', header: '抽成百分比%', visible: true, format: (v: any) => v ?? 0, style: 'text-right' },
  ];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private tls11010Service: Tls11010Service,
    private tls13030Service: TLS13030Service,
  ) {
    super();
  }

  // ===== 初始化 =====
  ngOnInit(): void {
    this.initializePage('TLS13030', '', this.queryForm);
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    this.dropdownApiService
      .queryTltBusType()
      .pipe(untilDestroyed(this))
      .subscribe(data => this.bus_typeOptions = data);

    this.tls11010Service
      .getBuildingOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.BUILDING_NO_Options = res));

    this.tls13030Service
      .getSYS3100DropDownList()
      .pipe(
        map(opts => opts.map(o => ({
          value: o.value,
          label: [o.value, o.label].filter(Boolean).join('-')
        }))),
        untilDestroyed(this)
      )
      .subscribe(opts => (this.organizationOptions = opts));

    this.dropdownApiService.queryTltTalent()
      .pipe(untilDestroyed(this))
      .subscribe(v => {
        this.CounterOptions = (v || []).map((x) => ({
          label: x.label,
          formLabel: `${x.label}`,
          value: x.value,
        }));
      });
    this.tls13030Service.getAPS1003DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(v => {
        this.deductCodeNameOptions = (v || []).map((x) => ({
          label: `${x.value} - ${x.label}`,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

  }

  // ===== lazy 事件（分頁/排序）=====
  // ※前提：queryForm 內請改成 pageIndex: [1] (小寫)
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    // 1) 取出 event 的 pageIndex / pageSize（若沒給就 undefined）
    const evPageIndex =
      Number.isFinite(event.pageIndex) ? Number(event.pageIndex) : undefined;

    const evPageSize =
      Number.isFinite(event.pageSize) ? Number(event.pageSize) : undefined;

    // 2) 判斷排序是否改變：排序一變就要回到第一頁
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? form.value?.SortBy ?? []);

    const nextPageIndex =
      currSort !== nextSort
        ? 1
        : (evPageIndex ?? form.value?.pageIndex ?? 1);

    // 3) 寫回表單（emitEvent:false 避免 valueChanges 連鎖）
    form.patchValue(
      {
        SortBy: event.SortBy ?? form.value?.SortBy ?? [],
        pageIndex: nextPageIndex,
        pageSize: evPageSize ?? form.value?.pageSize ?? 30,
      },
      { emitEvent: false }
    );

    // 4) 更新本地 sortMeta（若你 table 需要）
    this.sortMeta = (event.SortBy ?? []).map((s: any) => ({ ...s }));

    // 5) 防止同樣分頁/排序重複打 API
    const sig = JSON.stringify({
      pageIndex: form.value?.pageIndex,
      pageSize: form.value?.pageSize,
      SortBy: form.value?.SortBy,
    });

    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    // 6) 觸發查詢（避免連續事件）
    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }


  // ===== 組 payload（分頁/排序 + 清理空值）=====
  private buildPayload(val: any) {
    // 1) pageSize / pageIndex（小寫）
    const pageSize =
      Number.isFinite(val?.pageSize) ? Number(val.pageSize) : 30;

    const pageIndex =
      Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;

    // 2) SortBy：優先 val.SortBy，其次 this.sortMeta，再其次 defaultSort
    const rawSortBy = Array.isArray(val?.SortBy) ? val.SortBy : [];
    const sortByArr =
      rawSortBy.length
        ? rawSortBy
        : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

    // 3) 只允許後端認得的排序欄位（避免 SQL injection / 後端報錯）
    const filteredSortBy = (sortByArr || []).filter((s: any) =>
      this.allowedSortFields.has(String(s?.field || ''))
    );

    // 4) 複製一份當 payload 基礎
    const o: any = { ...val };

    // 5) 只在需要時帶入分頁/排序（你原本的行為）
    if (this.includePagingAndSorting) {
      Object.assign(o, {
        pageSize,
        pageIndex,
        SortBy: filteredSortBy,
      });
    }

    // 6) 清掉表單內同名欄位（避免帶出重複欄位）
    //    你表單有 pageSize/pageIndex 就會被上面 Object.assign 覆蓋成 number，
    //    但還是建議清掉不必要的舊欄位（包含你以前的 PageIndex）
    delete o.PageIndex; // ★如果你有舊欄位殘留，直接保險砍掉
    // （注意：不要 delete o.pageSize / o.pageIndex，因為這次 payload 就要送它們）

    // 7) 清理空值/空陣列
    Object.keys(o).forEach((k) => {
      const v = o[k];

      if (v === undefined || v === '') {
        delete o[k];
        return;
      }

      if (Array.isArray(v) && v.length === 0) {
        delete o[k];
        return;
      }
    });

    return o;
  }


  // ===== 查詢 =====
  onSubmit(form: FormGroup): void {
    this.submitted = true;

    const raw = { ...form.value };

    for (const k in raw) {
      if (typeof raw[k] === 'string') {
        raw[k] = raw[k].trim();
        if (raw[k] === '') raw[k] = null;
      }
      if (raw[k] === '') raw[k] = null;
    }

    if (raw.tlt_building && typeof raw.tlt_building === 'object') {
      raw.tlt_building = raw.tlt_building?.value;
    }

    const listKeys = [
      'bus_typeList',
      'tlt_openflagList',
      'org_idList',
      'area_noList',
      'floor_noList',
      'cap_typeList',
      'cap_itemList',
    ];
    for (const key of listKeys) {
      if (Array.isArray(raw[key])) raw[key] = raw[key].map((v: any) => String(v));
    }

    raw.tlt_floorList = raw.floor_noList;
    raw.area_noList = raw.area_noList;

    const monthKeys = [
      'tpy_bdate_start',
      'tpy_bdate_end',
      'tpy_edate_start',
      'tpy_edate_end',
    ];
    for (const key of monthKeys) {
      if (raw[key]) raw[key] = this.toYYYYMM(raw[key]);
    }

    const payload = this.buildPayload({ ...raw });

    // ✅ 給 table-report 往下滾用
    this.lastQueryBody = { ...payload };
    // ✅（可選）同步一下 sortMeta，避免 UI sort 箭頭不同步
    this.sortMeta = payload.SortBy ?? this.sortMeta;
    this.loading = true;
    this.messageService.blockUi();

    this.tls13030Service
      .queryTLS13030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          const rows = res?.Data?.QueryData ?? [];
          const sum = res?.Data?.QueryDataSum ?? null;

          this.data = this.processResultData(rows);
          this.totalRecords = res?.TotalCount ?? res?.Data?.TotalCount ?? 0;

          this.footerData = sum ? [sum] : [];

          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('queryTLS13030 error:', err);

          this.data = [];
          this.totalRecords = 0;
          this.footerData = [];

          this.loading = false;
          this.messageService.unblockUi();
        }
      });

  }


  private toYYYYMM(value: any): string | null {
    if (!value) return null;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (/^\d{6}$/.test(trimmed)) return trimmed;
    }

    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
  }

  processResultData(resData: any[]): any[] {
    const formatYYYYMM = (value: string): string => {
      if (value && value.length === 6) return `${value.substring(0, 4)}/${value.substring(4, 6)}`;
      return value;
    };

    return (resData || []).map((item: any) => ([
      'defSalesAmt',
      'commRate',
    ].reduce((acc, k) => ({ ...acc, [k]: item[k] ?? 0 }), {
      ...item,
      tpy_bdate: formatYYYYMM(item.tpy_bdate),
      tpy_edate: formatYYYYMM(item.tpy_edate),
    })));
  }

  moneyFormat(value: number | string): string {
    if (value == null) return '0';
    const num = typeof value === 'string' ? Number(value.toString().replace(/,/g, '')) : value;
    return Number.isFinite(num) ? (num as number).toLocaleString('en-US') : String(value ?? '0');
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  onDelete(selectedItems: any[]): void {
    if (!selectedItems.length) return;
    const confirmDel = globalThis.confirm('是否確定刪除選取項目？');
    if (!confirmDel) return;

    const idList = selectedItems.map((item) => item.id);
    this.tls13030Service.deleteTLS13030(idList)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        },
        error: () => {
          this.messageService.errorBubble('刪除失敗');
        },
      });
  }
}
