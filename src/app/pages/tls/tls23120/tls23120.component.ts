import { Component, OnDestroy } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23120Service } from '../../../service/api/tls/tls23120.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';

type FilterMode = 'location' | 'busType' | 'org' | 'counter';

@Component({
  selector: 'app-tls23120',
  templateUrl: './tls23120.component.html',
  styleUrls: ['./tls23120.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    DropdownComponent,
    RadiobuttonComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
    CalendarComponent,
  ],
})
export class TLS23120Component extends BasicQueryPageComponent<any> implements OnDestroy {
  private destroy$ = new Subject<void>();

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  data: any[] = [];
  totalRecords = 0;

  // ---- 表單 ----
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],

    // 只控制 UI 顯示/啟用（預設用專櫃編號）
    filterMode: ['counter' as FilterMode],

    // 四組查詢條件（值可為空；僅 counter 模式才驗證 TLT_No 必填）
    TLT_No: [[] as string[]],     // 專櫃編號（多選）
    bus_type: [],                 // 大分類
    ShowBusType: true,
    tlt_building: [],             // 館別
    area_no: [[] as string[]],    // 區域（多選）
    tlt_floor: [[] as string[]],  // 樓層（多選）
    org_id: [],                   // 組織

    // 分頁/排序
    ...createPaginationConfig([{ field: 'TLT_No', order: 1 }]),
  });

  // ---- 下拉選項 ----
  organizationOptions: any[] = [];
  bus_typeOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  whetherOptions: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions = [
    { label: '是', value: true },
    { label: '否', value: false },
  ];

  constructor(
    private tls23120Service: TLS23120Service,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private whetherService: WhetherService,
    private counterNameService: CounterNameService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23120', 'tls/tls23120', this.queryForm, (form) => this.onSubmit(form));

    // 選項載入
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => this.businessTypeCodeOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    // 顯示大分類 → 控制欄位顯示
    this.syncBusTypeColumns(!!this.queryForm.controls.ShowBusType.value);
    this.queryForm.controls.ShowBusType.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.syncBusTypeColumns(!!v));

    // Radio 切換：僅在 counter 模式套 required；其他模式移除驗證與錯誤
    const modeCtrl = this.queryForm.controls['filterMode'];
    this.applyFilterMode((modeCtrl.value as FilterMode) ?? 'counter');
    modeCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.applyFilterMode(((value ?? 'counter') as FilterMode)));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== 提交 =====
// ===== 提交 =====
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;

    const pageSize  = Number.isFinite(val?.pageSize)  ? val.pageSize  : 10;
    const pageIndex = Number.isFinite(val?.pageIndex) ? val.pageIndex : 1;
    const offset    = Math.max(0, (pageIndex - 1) * pageSize);

    const orderBy =
      Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
        : undefined;

    const toIsoOrNull = (x: any) => {
      if (!x) return null;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return null;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);
    };

    const fm = this.queryForm.controls.filterMode.value as FilterMode;

    const payload: any = {
      TXN_Date: toIsoOrNull(val?.TXN_Date),

      TLT_No:       (fm === 'counter')  ? (Array.isArray(val?.TLT_No) ? val.TLT_No : null) : null,
      tlt_building: (fm === 'location') ? (val?.tlt_building ?? null) : null,
      area_no:      (fm === 'location') ? (Array.isArray(val?.area_no) ? val.area_no : null) : null,
      tlt_floor:    (fm === 'location') ? (Array.isArray(val?.tlt_floor) ? val.tlt_floor : null) : null,
      bus_type:     (fm === 'busType')  ? (val?.bus_type ?? null) : null,
      org_id:       (fm === 'org')      ? (val?.org_id ?? null) : null,

      ShowBusType:  val?.ShowBusType ?? null,

      pageSize,
      pageIndex,
      SortBy: val?.SortBy ?? [],
      ...(orderBy ? { OrderBy: orderBy } : {}),
      Offset: offset,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === '') delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23120Service.queryTLS23120(payload).subscribe({
      next: (res: any) => {
        const dataArr = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
        let details: any[] = [];
        for (const item of dataArr) {
          const totals = item?.Totals ?? item?.totals ?? {};
          const subTotals = totals?.SubTotals ?? totals?.subTotals ?? totals?.subtotals ?? [];
          if (Array.isArray(subTotals)) {
            for (const sub of subTotals) {
              const list =
                sub?.tLS23120Details ??
                sub?.TLS23120Details ??
                sub?.tls23120Details ??
                [];
              if (Array.isArray(list)) details = details.concat(list);
            }
          }
        }

        this.data = details;
        this.totalRecords =
          typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
      },
      error: () => {
        this.loading = false;
        this.messageService?.unblockUi();
        this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      }
    });
  });
}


  // 顯示/隱藏欄位（僅影響 UI）
  private syncBusTypeColumns(show: boolean): void {
    const target = new Set(['bus_type', 'bus_type_name']);
    this.columns = this.columns.map(col =>
      target.has(col.field) ? { ...col, visible: !!show } : col
    );
  }

  // 依 Radio 模式啟用/停用欄位 + 動態驗證
  private applyFilterMode(mode: FilterMode): void {
    const setGroup = (names: string[], enabled: boolean) => {
      names.forEach(n => {
        const c = this.queryForm.get(n);
        if (!c) return;
        if (enabled) {
          c.enable({ emitEvent: false });
        } else {
          // 關閉時清空值（多選→[]；單值→undefined）
          const next = Array.isArray(c.value) ? [] : undefined;
          c.reset(next, { emitEvent: false });
          c.disable({ emitEvent: false });
        }
      });
    };

    const location = ['tlt_building', 'area_no', 'tlt_floor'];
    const busType  = ['bus_type'];
    const org      = ['org_id'];
    const counter  = ['TLT_No'];

    setGroup(location, mode === 'location');
    setGroup(busType,  mode === 'busType');
    setGroup(org,      mode === 'org');
    setGroup(counter,  mode === 'counter');

    // 僅在 counter 模式時讓 TLT_No 有 required 驗證
    const tlt = this.queryForm.get('TLT_No');
    if (tlt) {
      if (mode === 'counter') {
        tlt.addValidators(Validators.required);
      } else {
        tlt.removeValidators(Validators.required);
        tlt.setErrors(null);
      }
      tlt.updateValueAndValidity({ emitEvent: false });
    }

    this.queryForm.updateValueAndValidity({ emitEvent: false });
  }

  // 顯示格式工具
  formatDateTimeYMDHM(val: string | Date): string {
    if (!val) return '';
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return String(val ?? '');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  }
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  columns = [
    { field: 'TXN_DATE', header: '銷售日期', visible: true , format: this.formatDateTimeYMDHM.bind(this) },
    { field: 'TLT_NO', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'bus_type', header: '大分類編號', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'TLT_ID', header: '抽成類別', visible: true },
    { field: 'total_count', header: '總交易筆數', visible: true },
    { field: 'return_qty', header: '退貨件數', visible: true },
    { field: 'return_amt', header: '退貨金額', visible: true },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'SYS_Name', header: '區分', visible: true },
    { field: 'sad_sale_qty', header: '銷貨筆數', visible: true },
    { field: 'sad_sale_namt', header: '淨銷貨', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'sad_sale_tax', header: '營業稅', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'sad_sale_amt', header: '銷貨金額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
    { field: 'sad_preorder_amt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
    { field: 'sad_settle_amt', header: '結帳金額', visible: true, style: 'text-right', format: this.moneyFormat },
  ];
}
