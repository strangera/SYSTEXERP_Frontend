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
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23120',
  templateUrl: './tls23120.component.html',
  styleUrls: ['./tls23120.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    RadiobuttonComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
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

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    TLT_No: [[]],
    bus_type: [],
    ShowBusType: true,
    tlt_building: [],
     area_no: [[]],
    tlt_floor: [[]],
    org_id: [],
   
    
   ...createPaginationConfig([{ field: 'TLT_No', order: 1 }])
  });

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
    this.organizationNumberService
      .getOrganizationNumbers().subscribe((data) => (this.organizationOptions = data));
    this.regionService
      .getRegionOptions().subscribe((data) => (this.regionOptions = data));
    this.floorService
      .getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service
      .getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.businessTypeCodeService
      .getBusinessTypeCodes().subscribe((data) => (this.businessTypeCodeOptions = data));
    this.whetherService
      .getWhetherOptions().subscribe((data) => (this.whetherOptions = data));
    this.bigCategoryCodeService
      .getSystemTypes().subscribe((data) => (this.bus_typeOptions = data));
    this.tls11010Service
      .getOrgOptions().subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
    this.counterNameService
      .getCounters().subscribe((res) => {
        this.CounterOptions =
          res?.map((x) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    // 依目前值初始化欄位可見性
    this.syncBusTypeColumns(!!this.queryForm.controls.ShowBusType.value);

    // 監聽切換，動態更新欄位
    this.queryForm.controls.ShowBusType.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.syncBusTypeColumns(!!v));
  }
   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
  }
  // 送出查詢（無 doQuery / buildPayload）
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;

    // ✅ 沒有就給預設
    const pageSize  = Number.isFinite(val?.pageSize)  ? val.pageSize  : 10;
    const pageIndex = Number.isFinite(val?.pageIndex) ? val.pageIndex : 1;

    const offset = Math.max(0, (pageIndex - 1) * pageSize);
    const orderBy =
      Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
        : undefined;

    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    };

    const payload: any = {
      TXN_DateStart: toIso(val?.TXN_DateStart),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd),
      bus_type:      val?.bus_type,
      ShowBusType:   val?.ShowBusType,
      tlt_building:  val?.tlt_building,
      tlt_floor:     val?.tlt_floor,
      org_id:        val?.org_id,
      area_no:       val?.area_no,
      TLT_No:        val?.TLT_No,
      pageSize,
      pageIndex,
      SortBy:        val?.SortBy ?? [],
      ...(orderBy ? { OrderBy: orderBy } : {}),
      Offset:        offset,
    };

    Object.keys(payload).forEach(k => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();
    this.tls23120Service.queryTLS23120(payload).subscribe({
      next: (res: any) => {
        const data = res?.Data;
        const wrapper = Array.isArray(data) ? data[0] : data;
        const details =
          wrapper?.tLS23120Details ?? wrapper?.TLS23120Details ?? wrapper?.tls23120Details ?? [];
        this.data = Array.isArray(details) ? details : [];
        this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
      },
      error: (err) => {
        console.error('TLS23120 查詢失敗', err);
        this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      }
    });
  });
}
  private syncBusTypeColumns(show: boolean): void {
    const target = new Set(['bus_type', 'bus_type_name']);
    this.columns = this.columns.map(col =>
      target.has(col.field) ? { ...col, visible: !!show } : col
    );
  }


  formatDateTimeYMDHM(val: string | Date): string {
    if (!val) return '';
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return String(val ?? '');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  }
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }
  columns = [

     { field: 'TXN_DATE', header: '銷售日期', visible: true , format: this.formatDateTimeYMDHM.bind(this),},
     
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
    {
      field: 'sad_sale_namt',
      header: '淨銷貨',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'sad_sale_tax',
      header: '營業稅',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'sad_sale_amt',
      header: '銷貨金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
    {
      field: 'sad_preorder_amt',
      header: '預售金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
    {
      field: 'sad_settle_amt',
      header: '結帳金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];
}
