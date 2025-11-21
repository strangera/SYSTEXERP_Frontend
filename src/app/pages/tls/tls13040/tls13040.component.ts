/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';

// options services
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { RegionService } from '../../../service/basic/querySYS3A00.service';
import { BigCategoryCodeService } from '../../../service/basic/queryTLTBUSTYPE.service';

// api service
import { TLS13040Service } from '../../../service/api/tls/tls13040.service';

// UI
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiLocationFilterComponent } from '../../../shared/componentkit/multi-location-filter/multi-location-filter.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

// untilDestroyed
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';

@UntilDestroy()
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
  // ▼ 多欄位排序狀態
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

    // 共通位置篩選
    tlt_floorList: [[] as string[]],
    area_noList: [[] as string[]],
    building_no: [''],
    floor_noList: [[] as string[]], // ✅ 給共通元件用
    tlt_building: [''],            // ✅ 給共通元件用

    // 商務/狀態/類別
    bus_typeList: [[] as string[]],
    tlt_openflagList: [[] as string[]],
    tlt_term_typeList: [[] as string[]], // 抽成別
    tlt_idList: [[] as string[]],        // 抽成類別
    cag_barcodeList: [[] as string[]],   // 折扣（正品/95/90/.../特價）
    org_idList: [[] as string[]],

    // 合約日期
    tlt_bdate_start: [],
    tlt_bdate_end: [],
    tlt_edate_start: [null],
    tlt_edate_end: [null],

    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]),
  });

  // 下拉選項
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  operationStatusOptions = [
    { value: 0, label: '閉店/撤櫃' },
    { value: 1, label: '營業中' },
    { value: 2, label: '合約結束' },
    { value: 9, label: '核准時合約尚未開始' },
  ];
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  DeductionbigCategoryOptions = [
    { value: 0, label: '類別0' },
    { value: 1, label: '類別1' },
    { value: 2, label: '類別2' },
    { value: 3, label: '類別3' },
    { value: 4, label: '類別4' },
    { value: 5, label: '類別5' },
    { value: 6, label: '類別6' },
    { value: 7, label: '類別7' },
    { value: 8, label: '類別8' },
    { value: 9, label: '類別9' },
  ];
  discountOptions = [
    { value: '000', label: '正品' },
    { value: '095', label: '95折' },
    { value: '090', label: '90折' },
    { value: '085', label: '85折' },
    { value: '080', label: '80折' },
    { value: '075', label: '75折' },
    { value: '070', label: '70折' },
    { value: '065', label: '65折' },
    { value: '060', label: '60折' },
    { value: '055', label: '55折' },
    { value: '050', label: '50折' },
    { value: '999', label: '特價' },
  ];
  organizationOptions: any[] = [];
  bus_typeOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  // 欄位：依後端中文定義，並把「大/中」分類緊鄰放一起
  columns: any[] = [
    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'area_no', header: '區域', visible: true },

    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'location_no', header: '位置編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },

    // 大/中分類緊鄰排列
    { field: 'bus_type', header: '大分類編號', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'bus_class', header: '中分類編號', visible: true },
    { field: 'bus_class_name', header: '中分類名稱', visible: true },
    { field: 'bus_sclass', header: '小分類編號', visible: true },
    { field: 'bus_sclass_name', header: '小分類名稱', visible: true },

    { field: 'tlt_bdate', header: '合約起始日期', visible: true },
    { field: 'tlt_edate', header: '合約終止日期', visible: true },

    { field: 'tlt_id_desc', header: '抽成別', visible: true },
    { field: 'cag_taxtype', header: '稅別', visible: true },

    // 折扣群
    { field: 'cag_barcode', header: '正品', visible: true },
    { field: 'cag_barcode_95', header: '95折', visible: true },
    { field: 'cag_barcode_90', header: '90折', visible: true },
    { field: 'cag_barcode_85', header: '85折', visible: true },
    { field: 'cag_barcode_80', header: '80折', visible: true },
    { field: 'cag_barcode_75', header: '75折', visible: true },
    { field: 'cag_barcode_70', header: '70折', visible: true },
    { field: 'cag_barcode_60', header: '60折', visible: true },
    { field: 'cag_barcode_50', header: '50折', visible: true },
    { field: 'cag_barcode_sale', header: '特價', visible: true },

    {
      field: 'org_id',
      header: '組織代碼',
      visible: true,
      format: (value: any) => {
        const found = this.OrganizationCodeOptions.find(opt => String(opt.value) === String(value));
        return found ? `${found.value}` : (value ?? '');
      },
    },
    { field: 'org_name', header: '組織名稱', visible: true },
  ];

  constructor(
    private TLS13040Service: TLS13040Service,
    private RegionService: RegionService,
    private floorService: FloorService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13040', '', this.queryForm, (f) => this.onSubmit(f));

    // 預設排序
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    // ▼ 選項載入（全部加 untilDestroyed）
    this.bigCategoryCodeService.getSystemTypes()
      .pipe(untilDestroyed(this))
      .subscribe(data => this.bus_typeOptions = data);

    this.floorService.getFloors()
      .pipe(untilDestroyed(this))
      .subscribe(data => this.floorOptions = data);

    this.RegionService.getRegionOptions()
      .pipe(untilDestroyed(this))
      .subscribe(data => this.regionOptions = data);

    // TODO: 請改打API
    // this.businessTypeCodeService.getBusinessTypeCodes()
    //   .pipe(untilDestroyed(this))
    //   .subscribe(data => this.businessTypeCodeOptions = data);

    this.tls11010Service.getBuildingOptions()
      .pipe(untilDestroyed(this))
      .subscribe(res => (this.BUILDING_NO_Options = res));

    this.tls11010Service.getOrgOptions()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
          label: x.label,                       // table 顯示
          formLabel: `${x.value} - ${x.label}`, // 下拉顯示
          value: x.value,
        }));
      });
  }

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

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  onSubmit(form: FormGroup): void {
    if (this.loading) return;

    this.handleSubmit(form, () => {
      const formValue: any = { ...form.value };

      // 空字串 -> null
      for (const k in formValue) {
        if (formValue[k] === '') formValue[k] = null;
      }

      // 明確轉 string[]
      const listFieldsToConvert = [
        'tlt_idList', 'tlt_term_typeList', 'cag_barcodeList', 'bus_typeList', 'tlt_openflagList',
        'org_idList', 'tlt_floorList', 'area_noList', 'floor_noList',
      ];
      for (const key of listFieldsToConvert) {
        if (Array.isArray(formValue[key])) formValue[key] = formValue[key].map((v: any) => String(v));
      }

      // 共通欄位轉換（維持你的邏輯）
      formValue.tlt_floorList = formValue.floor_noList;

      // 排序預設
      if (!Array.isArray(formValue.SortBy) || formValue.SortBy.length === 0) {
        formValue.SortBy = this.sortMeta.length ? this.sortMeta : this.defaultSort;
      }

      this.loading = true;
      this.messageService.blockUi();

      this.TLS13040Service.queryTLS13040(formValue)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              const rows = Array.isArray(res?.Data) ? res.Data : [];
              this.data = rows.map((r: any, i: number) => ({
                ...r,
                _key: this.buildRowKey(r) || `row_${i}`, // 確保唯一
              }));
              this.totalRecords = res.TotalCount || this.data.length;
              this.queryStateService.setQueryState(this.ProgNo, formValue);
            } else {
              // 可依專案訊息規格顯示錯誤
            }
          },
          error: () => {
            // 可依專案訊息規格顯示錯誤
          },
          complete: () => {
            this.loading = false;
            this.messageService.unblockUi();
          },
        });
    });
  }

  override onLazyLoadData(event: LazyLoadEvent, queryForm: FormGroup) {
    // 1) 是否更換排序？若有更換，回到第 1 頁
    const currentSort = JSON.stringify(queryForm.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? []);
    const nextPageIdx = currentSort !== nextSort ? 1 : (event.pageIndex ?? queryForm.value.pageIndex);

    // 2) 只 patch 分頁/排序
    queryForm.patchValue(
      {
        pageSize: event.pageSize ?? queryForm.value.pageSize,
        pageIndex: nextPageIdx,
        SortBy: event.SortBy ?? queryForm.value.SortBy,
      },
      { emitEvent: false },
    );

    // 3) 同步 table UI 的多欄位排序
    this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

    // 4) 去重＋0ms 防抖
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
