import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, LazyLoadEvent, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';

import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23080Service } from '../../../service/api/tls/tls23080.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ColumnLabelService } from '../../../service/basic/column-label.service';

@Component({
  selector: 'app-tls23080',
  templateUrl: './tls23080.component.html',
  styleUrls: ['./tls23080.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
  ]
})
export class TLS23080Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  WhetherOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  // --- 排序狀態 ---
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: 'TXN_Date', order: -1 }, // 近到遠

  ];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;
  private readonly includePagingAndSorting = true;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_openflag: ['Y'],
    ECR_No: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    // ✅ 帶入預設排序
    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private whetherService: WhetherService,
    private tls23080Service: TLS23080Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private columnLabelService: ColumnLabelService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', 'tls/tls23080', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    // 下拉選單
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.WhetherOptions = (data || []).filter((opt: any) => opt.value !== null);
    });
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.ECRNoService.getECRNo().subscribe(res => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  /** 表格 lazy 事件（分頁/排序） */
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? []);
    const nextPageIndex = currSort !== nextSort ? 1 : (event.pageIndex ?? form.value.pageIndex ?? 1);

    form.patchValue({
      pageIndex: nextPageIndex,
      pageSize : event.pageSize ?? form.value.pageSize,
      SortBy   : event.SortBy ?? form.value.SortBy,
    }, { emitEvent: false });

    this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

    const sig = JSON.stringify({
      pageIndex: form.value.pageIndex,
      pageSize : form.value.pageSize,
      SortBy   : form.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = this.buildPayload(this.queryForm.getRawValue());
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23080Service.queryTLS23080(payload).subscribe({
        next: (res: any) => {
          const groups = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
          const details = groups.flatMap((g: any)=>
            Array.isArray(g?.tLS23080_Details) ? g.tLS23080_Details : []
          ).map((d: any) => ({
            ...d,
            TXN_Date: d?.TXN_Date ? formatDateToYYYY_MM_DD(d.TXN_Date) : d?.TXN_Date
          }));
          this.data = details;
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : details.length;
        },
        error: (err) => {
          this.loading = false;

        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        }
      });
    });
  }

  /** 組查詢 payload（含排序＆分頁鍵） */
  private buildPayload(val: any) {
    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 19);
    };

    const pageSize  = Number.isFinite(val?.pageSize) ? Number(val.pageSize) : 10;
    const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;
    const offset    = Math.max(0, (pageIndex - 1) * pageSize);

    const sortByArr = Array.isArray(val?.SortBy) && val.SortBy.length
      ? val.SortBy
      : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

    const orderBy = sortByArr.length
      ? sortByArr.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
      : undefined;

    const o: any = {
      TXN_DateStart: toIso(val?.TXN_DateStart),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd),
      tlt_openflag:  val?.tlt_openflag,
      ECR_No:        val?.ECR_No,
      tlt_building:  val?.tlt_building,
      tlt_floor:     val?.tlt_floor,
      org_id:        val?.org_id,
    };

    if (this.includePagingAndSorting) {
      Object.assign(o, {
        PageSize: pageSize,
        PageIndex: pageIndex,
        Offset: offset,
        SortBy: sortByArr,
        ...(orderBy ? { OrderBy: orderBy } : {}),
      });
    }

    Object.keys(o).forEach(k => {
      const v = o[k];
      if (v === undefined || v === '') delete o[k];
      if (Array.isArray(v) && v.length === 0) delete o[k];
    });

    return o;
  }

  // ===== 工具 =====
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  formatDate = (val: string | Date | number): string => {
    if (!val) return '';
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };


// 建議也把 formatDate 引進來：
// import { formatDate } from '@shared/componentkit/table/table.model';

columns = [
  { field: 'TXN_Date', header: '日期', visible: true, style: 'text-left', format: this.formatDate },

  { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

  // 聯信（41/42/12）
  { field: 'UnionGeneral', header: '聯信(一般)',  visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'UnionAE',      header: '聯信(AE)',    visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'UnionDiner',   header: '聯信(Diners)',visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

  // 中信（43/44/14）
  { field: 'CTBCGeneral', header: '中信(一般)',  visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'CTBCAE',      header: '中信(AE)',    visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'CTBCDiner',   header: '中信(Diners)',visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

  // 中信-停車場（81）
  { field: 'CTBCParkingGeneral', header: '中信-停車場(一般)',  visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'CTBCParkingAE',      header: '中信-停車場(AE)',    visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'CTBCParkingDiner',   header: '中信-停車場(Diners)',visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

  // 其他付款別（與 Swagger 一致）
  { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

  { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
];


}
