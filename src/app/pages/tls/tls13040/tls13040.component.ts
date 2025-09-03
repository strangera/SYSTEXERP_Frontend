import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TLS13040Service } from '../../../service/api/tls/tls13040.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
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

@Component({
    selector: 'app-tls13040',
    templateUrl: './tls13040.component.html',
    styleUrls: ['./tls13040.component.scss'],
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
export class TLS13040Component extends BasicQueryPageComponent<any> {
  // ▼ 排序狀態
sortMeta: any[] = [];
readonly defaultSort: any[] = [{ field: 'tlt_no', order: 1 }];

// ▼ 防抖＋去重
private lastQuerySig: string | null = null;
private lazyTimer: any = null;
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
    tlt_no: [''],
    tlt_name: [''],
    tlt_floorList: [[] as string[]],
    area_noList: [[] as string[]],
    bus_typeList: [[] as string[]],
    tlt_openflagList: [[] as string[]],
    tlt_bdate_start: [this.yesterday],
    tlt_bdate_end: [this.yesterday],
    tlt_edate_start: [null],
    tlt_edate_end: [null],
    tlt_term_typeList: [[] as string[]],
    tlt_idList: [[] as string[]],
    cag_barcodeList: [[] as string[]],
    org_idList: [[] as string[]],
    building_no: [''],
    floor_noList: [[] as string[]],     // ✅ 給共通元件用
    tlt_building: [''],                 // ✅ 給共通元件用


    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  DeductionbigCategoryOptions: any[] = [];
  discountOptions: any[] = [];
  organizationOptions: any[] = [];
  bus_typeOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  columns: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'area_no', header: '區域', visible: true },
    { field: 'bus_type', header: '大分類編號', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'bus_class_name', header: '商品類別', visible: true },
    { field: 'tlt_bdate',header: '合約起始日',visible: true,},
    { field: 'tlt_edate',header: '合約截止日',visible: true,},
    { field: 'tlt_id_desc', header: '合約類型', visible: true },
    { field: 'cag_taxtype', header: '課稅別', visible: true },
    { field: 'cag_barcode', header: '折數', visible: true },
    { field: 'cag_barcode_95', header: '95折', visible: true },
    { field: 'cag_barcode_90', header: '9折', visible: true },
    { field: 'cag_barcode_85', header: '85折', visible: true },
    { field: 'cag_barcode_80', header: '8折', visible: true },
    { field: 'cag_barcode_75', header: '75折', visible: true },
    { field: 'cag_barcode_70', header: '7折', visible: true },
    { field: 'cag_barcode_60', header: '6折', visible: true },
    { field: 'cag_barcode_50', header: '5折', visible: true },
    { field: 'cag_barcode_sale', header: '特價', visible: true },
    {
      field: 'org_id',
      header: '組織代碼',
      visible: true,
      format: (value: any) => {
        const found = this.OrganizationCodeOptions.find(opt => String(opt.value) === String(value));
        return found ? `${found.value}` : value ?? '';
      }
    },

    { field: 'org_name', header: '組織名稱', visible: true },
  ];

  private toYMD(v: any): string {
  if (!v) return '';
  const d = typeof v === 'string' ? new Date(v.replace(/\//g, '-')) : new Date(v);
  if (isNaN(d.getTime())) return String(v ?? '');
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 合併 key：tlt_no + tlt_bdate(YYYY-MM-DD)
private buildRowKey(row: any): string {
  return `${row?.tlt_no ?? ''}__${this.toYMD(row?.tlt_bdate)}`;
}
  formatYYYYMMDD(raw: string): string {
    if (!raw) return '';
    const date = new Date(raw);
    if (isNaN(date.getTime())) return raw; // 傳入不是有效日期就直接回傳原值
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }


  constructor(
    private TLS13040Service: TLS13040Service,
    private RegionService: RegionService,
    private floorService: FloorService,
    private operationStatusService: OperationStatusService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private DeductionbigCategoryService: DeductionbigCategoryService,
    private commissionTypeService: CommissionTypeService,
    private discountService: DiscountService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13040', '', this.queryForm, (f) => this.onSubmit(f));

      // ▼ 預設排序
  this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.RegionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.operationStatusService.getOperationStatuses().subscribe(data => this.operationStatusOptions = data);
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => this.businessTypeCodeOptions = data);
    this.DeductionbigCategoryService.getLocalDeductionCategories().subscribe(data => this.DeductionbigCategoryOptions = data);
    this.commissionTypeService.getCommissionTypes().subscribe(data => this.commissionTypeOptions = data);
    this.discountService.getLocalDiscountOptions().subscribe(data => this.discountOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
  }

onSubmit(form: FormGroup): void {
  if (this.loading) return;

  this.handleSubmit(form, () => {
    const formValue = { ...form.value };

    // 空字串 -> null
    for (const k in formValue) {
      if (formValue[k] === '') formValue[k] = null;
    }

    // 明確轉 string[]
    const listFieldsToConvert = [
      'tlt_idList','tlt_term_typeList','cag_barcodeList','bus_typeList','tlt_openflagList',
      'org_idList','tlt_floorList','area_noList','floor_noList'
    ];
    for (const key of listFieldsToConvert) {
      if (Array.isArray(formValue[key])) formValue[key] = formValue[key].map((v: any) => String(v));
    }

    // 共通欄位轉換（維持你的邏輯）
    formValue.tlt_floorList = formValue.floor_noList;

    // ▼ 如果沒有任何排序（例如第一次載入），套用預設或目前 sortMeta
    if (!Array.isArray(formValue.SortBy) || formValue.SortBy.length === 0) {
      formValue.SortBy = this.sortMeta.length ? this.sortMeta : this.defaultSort;
    }

    // 送出
    this.loading = true;
    this.messageService.blockUi();
    this.TLS13040Service.queryTLS13040(formValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          const rows = Array.isArray(res?.Data) ? res.Data : [];
this.data = rows.map((r: any, i: number) => ({
  ...r,
  _key: this.buildRowKey(r) || `row_${i}`, // 萬一缺資料，仍確保唯一
}));
          this.totalRecords = res.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        } else {
          this.messageService.errorBubble('查詢失敗');
        }
      },
      error: () => {
        
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  });
}

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  override onLazyLoadData(event: LazyLoadEvent, queryForm: FormGroup) {
  // 1) 是否更換排序？若有更換，回到第 1 頁
  const currentSort = JSON.stringify(queryForm.value?.SortBy ?? []);
  const nextSort    = JSON.stringify(event.SortBy ?? []);
  const nextPageIdx = currentSort !== nextSort ? 1 : (event.pageIndex ?? queryForm.value.pageIndex);

  // 2) 只 patch 分頁/排序（不要動其他查詢條件）
  queryForm.patchValue(
    {
      pageSize: event.pageSize ?? queryForm.value.pageSize,
      pageIndex: nextPageIdx,
      SortBy: event.SortBy ?? queryForm.value.SortBy,
    },
    { emitEvent: false },
  );

  // 3) 同步給 Table 的多欄位排序 UI
  this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

  // 4) 去重＋0ms 防抖，避免被觸發兩次
  const sig = JSON.stringify({
    pageIndex: nextPageIdx,
    pageSize: event.pageSize ?? queryForm.value.pageSize,
    SortBy: event.SortBy ?? queryForm.value.SortBy,
  });
  if (sig === this.lastQuerySig) return;
  this.lastQuerySig = sig;

  if (this.lazyTimer) clearTimeout(this.lazyTimer);
  this.lazyTimer = setTimeout(() => this.onSubmit(queryForm), 0);
}

}
