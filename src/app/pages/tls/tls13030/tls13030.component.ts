import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
import { DeductionService } from '../../../service/basic/deduction.service';
import { TLS13030Service } from '../../../service/api/tls/tls13030.service';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { MultiLocationFilterComponent } from '../../../shared/componentkit/multi-location-filter/multi-location-filter.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-tls13030',
  templateUrl: './tls13030.component.html',
  styleUrls: ['./tls13030.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    MultiLocationFilterComponent,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS13030Component extends BasicQueryPageComponent<any> {
  // ===== 排序 / lazy 相關 =====
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    // 與 createPaginationConfig 一致
    { field: 'id', order: 1 },
  ];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;
  private readonly includePagingAndSorting = true;

  isPrint = true;
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

queryForm = this.formBuilder.group({
  tlt_no: ['', [Validators.maxLength(10)]],
  tlt_name: ['', [Validators.maxLength(50)]],
  floor_noList: [[] as string[]],
  area_noList: [[] as string[]],
  tlt_openflagList: [[] as string[]],
  tlt_bdate_start: [this.yesterday],
  tlt_bdate_end: [this.yesterday],
  tlt_edate_start: [null],
  tlt_edate_end: [null],
  cap_typeList: [[] as string[]],
  cap_itemList: [[] as string[]],
  tpy_bdate_start: [null],
  tpy_bdate_end: [null],
  tpy_edate_start: [null],
  tpy_edate_end: [null],
  bus_typeList: [[] as string[]],
  tlt_building: ['', [Validators.maxLength(1)]],
  SortBy: [[]],
  // ✅ 統一用大寫分頁鍵（若你要初始為 0，就把 20/1 改成 0/0）
  PageSize: [20],
  PageIndex: [1],
});


  regionOptions: any[] = [];
  floorOptions: any[] = [];
  operationStatusOptions: any[] = [];
  bus_typeOptions: any[] = [];
  deductionCategoryOptions: any[] = [];
  deductionCodeNameServOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  columns: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'area_desc', header: '區域', visible: true, style: 'text-left' },
    { field: 'bus_type', header: '大分類代碼', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'tlt_bdate', header: '合約起始日', visible: true },
    { field: 'tlt_edate', header: '合約截止日', visible: true },
    { field: 'cap_type', header: '扣款類別', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true, style: 'text-left' },
    { field: 'tpy_bdate', header: '扣款起日', visible: true },
    { field: 'tpy_edate', header: '扣款迄日', visible: true },
    { field: 'tpy_totalamt', header: '總金額', visible: true, format: (v: any) => this.moneyFormat(v), style: 'text-right' },
    { field: 'down_payment', header: '頭期款', visible: true, format: (v: any) => this.moneyFormat(v), style: 'text-right' },
    { field: 'period_nos', header: '期數', visible: true },
    { field: 'tpy_amount', header: '每期金額', visible: true, format: (v: any) => this.moneyFormat(v), style: 'text-right' },
    { field: 'tpy_rate', header: '比率或元(月利率%)', visible: true, style: 'text-right' },
    { field: 'defSalesAmt', header: '預設營業額', visible: true, format: (v: any) => v ?? 0, style: 'text-right' },
    { field: 'commRate', header: '抽成百分比%', visible: true, format: (v: any) => v ?? 0, style: 'text-right' },
  ];

  constructor(

    private operationStatusService: OperationStatusService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private deductionService: DeductionService,
    private tls11010Service: Tls11010Service,
    private TLS13030Service: TLS13030Service,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13030', '', this.queryForm);
    // 初始化排序 UI 狀態
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    this.operationStatusService.getOperationStatuses().subscribe(data => this.operationStatusOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);
    this.deductionService.getDeductionCategories().subscribe(data => this.deductionCategoryOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));

    this.queryForm.controls.cap_typeList.valueChanges.subscribe((selectedCapTypes: string[] | null) => {
      if (selectedCapTypes?.length) {
        const payload = { cap_typeList: selectedCapTypes };
        this.deductionService.getAPS1003DropDownList(payload).subscribe(res => {
          this.deductionCodeNameServOptions = res?.map((x: any) => ({
            label: `${x.value} - ${x.label}`,
            value: x.value
          })) || [];
          this.queryForm.controls.cap_itemList.setValue([]);
        });
      } else {
        this.deductionCodeNameServOptions = [];
        this.queryForm.controls.cap_itemList.setValue([]);
      }
    });
  }

  // ===== lazy 事件（分頁/排序）=====
override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
  // 1) 讀 event 的小寫
  const evPageIndex = Number.isFinite(event.pageIndex) ? Number(event.pageIndex) : undefined;
  const evPageSize  = Number.isFinite(event.pageSize)  ? Number(event.pageSize)  : undefined;

  // 2) 排序判斷：你的 LazyLoadEvent 若有 SortBy（大寫）就保留，否則讀 form 的 SortBy
  const currSort = JSON.stringify(form.value?.SortBy ?? []);
  const nextSort = JSON.stringify(event.SortBy ?? form.value.SortBy ?? []);
  const nextPageIndex = currSort !== nextSort ? 1 : (evPageIndex ?? form.value.PageIndex ?? 1);

  // 3) 只 patch 到表單中的「大寫」分頁鍵
  form.patchValue({
    SortBy: event.SortBy ?? form.value.SortBy ?? [],
    PageIndex: nextPageIndex,
    PageSize: evPageSize ?? form.value.PageSize ?? 20,
  }, { emitEvent: false });

  // 4) 更新排序 UI 狀態（沿用你原本的結構）
  this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

  // 5) 去重簽章（使用大寫鍵，確保和 payload 一致）
  const sig = JSON.stringify({
    PageIndex: form.value.PageIndex,
    PageSize: form.value.PageSize,
    SortBy: form.value.SortBy,
  });
  if (sig === this.lastQuerySig) return;
  this.lastQuerySig = sig;

  if (this.lazyTimer) clearTimeout(this.lazyTimer);
  this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
}


  // ===== 查詢 =====
  onSubmit(form: FormGroup): void {
    this.submitted = true;

    const raw = { ...form.value };

    // 修剪字串、空字串轉 null
    for (const k in raw) {
      if (typeof raw[k] === 'string') {
        raw[k] = raw[k].trim();
        if (raw[k] === '') raw[k] = null;
      }
      if (raw[k] === '') raw[k] = null;
    }

    // 下拉物件 → 值
    if (raw.tlt_building && typeof raw.tlt_building === 'object') {
      raw.tlt_building = raw.tlt_building?.value;
    }

    // 明確轉字串陣列
    const listKeys = [
      'tlt_idList',
      'tlt_term_typeList',
      'cag_barcodeList',
      'bus_typeList',
      'tlt_openflagList',
      'org_idList',
      'tlt_floorList',
      'area_noList',
      'floor_noList',
      'cap_typeList',
      'cap_itemList',
    ];
    for (const key of listKeys) {
      if (Array.isArray(raw[key])) raw[key] = raw[key].map((v: any) => String(v));
    }

    // 對應欄位
    raw.tlt_floorList = raw.floor_noList;
    raw.area_noList = raw.area_noList;

    // 產生 payload（含分頁/排序）
    const payload = this.buildPayload({ ...raw });

    this.loading = true;
    this.messageService.blockUi();

    this.TLS13030Service.queryTLS13030(payload).pipe(
      finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      })
    ).subscribe({
      next: (res) => {
        if (res?.Status === '0000') {
          const arr = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
          this.data = this.processResultData(arr);
          this.totalRecords = Number(res?.TotalCount ?? this.data.length ?? 0);
          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
        } else {
          this.messageService.errorBubble('查詢失敗');
          this.data = [];
          this.totalRecords = 0;
        }
      },
      error: () => {
        this.data = [];
        this.totalRecords = 0;
      }
    });
  }

  /** 組查詢 payload（含排序＆分頁鍵） */
private buildPayload(val: any) {
  const pageSize = Number.isFinite(val?.PageSize) ? Number(val.PageSize) : 10;
  const pageIndex = Number.isFinite(val?.PageIndex) ? Number(val.PageIndex) : 1;

  const sortByArr = Array.isArray(val?.SortBy) && val.SortBy.length
    ? val.SortBy
    : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

  const o: any = { ...val };

  if (this.includePagingAndSorting) {
    Object.assign(o, {
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortByArr,
    });
  }

  // 🔎 主動移除小寫分頁鍵，避免後端看到兩份
  delete o.pageSize;
  delete o.pageIndex;

  // 一般清理
  Object.keys(o).forEach(k => {
    const v = o[k];
    if (v === undefined || v === '') delete o[k];
    if (Array.isArray(v) && v.length === 0) delete o[k];
  });

  return o;
}



  // ===== 後端回傳資料格式化 =====
  processResultData(resData: any[]): any[] {
    const formatYYYYMM = (value: string): string => {
      if (value && value.length === 6) return `${value.substring(0, 4)}/${value.substring(4, 6)}`;
      return value;
    };
    return (resData || []).map((item: any) => ({
      ...item,
      defSalesAmt: item.defSalesAmt ?? 0,
      commRate: item.commRate ?? 0,
      tpy_bdate: formatYYYYMM(item.tpy_bdate),
      tpy_edate: formatYYYYMM(item.tpy_edate),
    }));
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  onDelete(selectedItems: any[]): void {
    if (!selectedItems.length) return;
    const confirmDel = window.confirm('是否確定刪除選取項目？');
    if (!confirmDel) return;

    const idList = selectedItems.map((item) => item.id);
    this.TLS13030Service.deleteTLS13030(idList).subscribe({
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
