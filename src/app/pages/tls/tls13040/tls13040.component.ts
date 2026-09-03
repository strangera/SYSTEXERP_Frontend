/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';

// options services
import { map } from 'rxjs/operators';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// api service
import { TLS13040Service } from '../../../service/api/tls/tls13040.service';

// UI
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

// untilDestroyed
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MultiLocationFilterComponent } from 'src/app/shared/biz-components/multi-location-filter/multi-location-filter.component';
import { ExportContext } from '@shared/exports/report-export.service';
@UntilDestroy()
@Component({
  selector: 'app-tls13040',
  templateUrl: './tls13040.component.html',
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
    TranslateModule,
    DropdownComponent,
    TableReportComponent,

  ],
})
export class TLS13040Component extends BasicQueryPageComponent<any> implements OnInit {
  // ▼ 多欄位排序狀態
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [{ field: 'tlt_no', order: 1 }];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  CounterOptions: any[] = [];

  /** table-report 需要 */
  lastQueryBody: any = null;
  queryTLS13040Fn = (body: any) => this.TLS13040Service.queryTLS13040(body);

  queryForm = this.formBuilder.group({
    tlt_no: [''],
    tlt_name: [''],

    // 共通位置篩選
    tlt_floorList: [[] as string[]],
    area_noList: [[] as string[]],
    building_no: [''],
    floor_noList: [[] as string[]], // ✅ 給共通元件用
    tlt_building: [''],             // ✅ 給共通元件用

    // 商務/狀態/類別
    bus_typeList: [[] as string[]],
    tlt_openflagList: [[] as string[]],
    tlt_term_typeList: [[] as string[]], // 抽成別
    tlt_idList: [[] as string[]],        // 抽成類別
    cag_barcodeList: [[] as string[]],   // 折扣
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
    { value: '0', label: '已撤櫃' },
    { value: '1', label: '營業中' },
    { value: '9', label: '合約未生效' },
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

  bus_typeOptions: any = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  columns: any[] = [
    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
      format: (value: any) =>
        this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'area_desc', header: '區域', visible: true },

    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'location_no', header: '位置編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },

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
        const found = this.OrganizationCodeOptions.find(
          (opt) => String(opt.value) === String(value)
        );
        return found ? `${found.value}` : (value ?? '');
      },
    },
    { field: 'org_name', header: '組織名稱', visible: true },
  ];

  constructor(
    private TLS13040Service: TLS13040Service,
    private readonly dropdownApiService: DropdownApiService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13040', '', this.queryForm, (f) => this.onSubmit(f));

    // 預設排序
    this.sortMeta = this.defaultSort.map((x) => ({ ...x }));

    // ▼ 選項載入
    this.dropdownApiService
      .queryTltBusType()
      .pipe(untilDestroyed(this))
      .subscribe((data) => (this.bus_typeOptions = data));

    this.dropdownApiService
      .queryTltTalent()
      .pipe(untilDestroyed(this))
      .subscribe((v) => {
        this.CounterOptions = (v || []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.label}`,
          value: x.value,
        }));
      });

    this.dropdownApiService
      .querySys3900()
      .pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), untilDestroyed(this))
      .subscribe((data) => (this.floorOptions = data));

    this.dropdownApiService
      .querySys3A00()
      .pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), untilDestroyed(this))
      .subscribe((data) => (this.regionOptions = data));

    this.tls11010Service
      .getBuildingOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.BUILDING_NO_Options = res));

    this.tls11010Service
      .getOrgOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });
  }

  private toYMD(v: any): string {
    if (!v) return '';
    const d =
      typeof v === 'string' ? new Date(v.replace(/\//g, '-')) : new Date(v);
    if (isNaN(d.getTime())) return String(v ?? '');
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private buildRowKey(row: any): string {
    return `${row?.tlt_no ?? ''}__${this.toYMD(row?.tlt_bdate)}`;
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  /** 給 API 用的 payload 轉換：維持你原本邏輯，但把結果存進 lastQueryBody 給 table-report 用 */
  private buildApiPayload(raw: any): any {
    const formValue: any = { ...raw };

    // 空字串 -> null
    for (const k in formValue) {
      if (formValue[k] === '') formValue[k] = null;
    }

    // 明確轉 string[]
    const listFieldsToConvert = [
      'tlt_idList',
      'tlt_term_typeList',
      'cag_barcodeList',
      'bus_typeList',
      'tlt_openflagList',
      'org_idList',
      'tlt_floorList',
      'area_noList',
      'floor_noList',
    ];
    for (const key of listFieldsToConvert) {
      if (Array.isArray(formValue[key])) {
        formValue[key] = formValue[key].map((v: any) => String(v));
      }
    }

    // 共通欄位轉換（維持你的邏輯）
    formValue.tlt_floorList = formValue.floor_noList;

    // 排序預設（table-report 內部排序會覆寫 lastQueryBody.SortBy）
    if (!Array.isArray(formValue.SortBy) || formValue.SortBy.length === 0) {
      formValue.SortBy = this.sortMeta.length ? this.sortMeta : this.defaultSort;
    }

    // pageSize 預設（table-report 內部用 lastQueryBody.pageSize 判斷虛擬滾動/載入更多）
    formValue.pageSize = formValue.pageSize ?? 30;
    formValue.pageIndex = formValue.pageIndex ?? 1;

    return formValue;
  }

  onSubmit(form: FormGroup): void {
    if (this.loading) return;

    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const payload = this.buildApiPayload(raw);

      // ✅ 給 table-report 用（lazy/排序/載入更多都靠它）
      this.lastQueryBody = { ...payload };

      this.loading = true;
      this.messageService.blockUi();

      this.TLS13040Service.queryTLS13040(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res: any) => {
            if (res.Status === '0000') {
              const rows = Array.isArray(res?.Data) ? res.Data : [];
              this.data = rows.map((r: any, i: number) => ({
                ...r,
                _key: this.buildRowKey(r) || `row_${i}`,
              }));

              this.totalRecords = res.TotalCount || this.data.length;

              // ✅ QueryState 建議存 raw（還原 UI 比較準）
              this.queryStateService.setQueryState(this.ProgNo, raw);

              // 同步目前排序狀態（UI/匯出用）
              this.sortMeta = Array.isArray(payload.SortBy)
                ? payload.SortBy.map((s: any) => ({ ...s }))
                : this.defaultSort.map((s: any) => ({ ...s }));
            }
          },
          error: () => { },
          complete: () => {
            this.loading = false;
            this.messageService.unblockUi();
          },
        });
    });
  }
  exportContext: ExportContext = {
  reportTitle: '專櫃契約抽成報表',
  customFileName: this.getExportFileName()
};

private getExportFileName(): string {
  const now = new Date();

  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  return `專櫃契約抽成報表_${yyyy}${MM}${dd}`;
}
}
