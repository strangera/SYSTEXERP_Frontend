import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23070Service } from '../../../service/api/tls/tls23070.service';
import { createPaginationConfig, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';

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
import { TableComponent } from '@shared/componentkit/table/table.component';


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
    TableComponent,
  ],
})
export class TLS23070Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;
  totalSummary: any | null = null;    // 總計區（Data[0].totalSummary）
subsTotals: any[] = [];             // 每日小計（Data[0].subsTotals）

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列欄位用 control<any[]>([])，避免 never[] 型別問題
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]),
  });

  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  WhetherOptions: any[] = [];
  OrganizationCodeOptions: any[] = []; // ✅ 不要 ['']

  constructor(
    private tls23070Service: TLS23070Service,
    private counterNameService: CounterNameService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service,
    
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23070', 'tls/tls23070', this.queryForm, (form) =>
      this.onSubmit(form),
    );

    // ✅ 下拉資料全加 takeUntil，避免 memory leak
    this.counterNameService
      .getCounters()

      .subscribe((res) => {
        this.CounterOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.floorService
      .getFloors()

      .subscribe((data) => (this.floorOptions = data));

    this.tls11010Service
      .getBuildingOptions()

      .subscribe((data) => (this.BUILDING_NO_Options = data));

    this.tls11010Service
      .getOrgOptions()

      .subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
  }

onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;

    // 分頁 Offset：0-based
    const offset =
      Number.isFinite(val?.pageIndex) && Number.isFinite(val?.pageSize)
        ? Math.max(0, (val.pageIndex - 1) * val.pageSize)
        : undefined;

    // 多欄排序 -> "field ASC,DESC..."
    const orderBy =
      Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy
            .map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`)
            .join(',')
        : undefined;

    // 組 payload（使用 YYYY-MM-DD，避免 toISOString 時區造成少一天）
    const payload: any = {
      TXN_DateStart: formatDateToYYYY_MM_DD(val?.TXN_DateStart),
      TXN_DateEnd:   formatDateToYYYY_MM_DD(val?.TXN_DateEnd),
      tlt_no:        val?.tlt_no,
      tlt_building:  val?.tlt_building,
      tlt_floor:     val?.tlt_floor,
      org_id:        val?.org_id,
      pageSize:      val?.pageSize,
      pageIndex:     val?.pageIndex,
      SortBy:        val?.SortBy,
      ...(offset  !== undefined ? { Offset:  offset } : {}),
      ...(orderBy ? { OrderBy: orderBy } : {}),
    };

    // 移除空值/空陣列，避免後端模型繫結混亂
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23070Service.queryTLS23070(payload).subscribe({
      next: (res: any) => {
        // 期待格式：
        // Data: [{
        //   totalSummary: {...},
        //   subsTotals: [{ TXN_Date, ..., tLS23070Details: [...] }],
        //   LineAttach?: string
        // }]
        const data = res?.Data;
        const wrapper = Array.isArray(data) ? data[0] : data;

        this.totalSummary = wrapper?.totalSummary ?? null;
        this.subsTotals   = Array.isArray(wrapper?.subsTotals) ? wrapper.subsTotals : [];

        // 攤平所有 subsTotals[i].tLS23070Details
        const detailsFromSubs = this.subsTotals.flatMap((s: any) =>
          (s?.tLS23070Details ??
           s?.TLS23070Details ??
           s?.tls23070Details ??
           []) as any[]
        );

        // 若少數情況放在頂層，也一併相容
        const topLevelDetails =
          (wrapper?.tLS23070Details ??
           wrapper?.TLS23070Details ??
           wrapper?.tls23070Details ??
           []) as any[];

        const details = detailsFromSubs.length ? detailsFromSubs : topLevelDetails;

        this.data = Array.isArray(details) ? details : [];
        this.totalRecords =
          typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
      },
      error: (err) => {
        console.error('TLS23070 查詢失敗', err);
        this.loading = false;
        this.messageService?.unblockUi();           // ⬅ 確保錯誤時解除 block
        this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      },
    });
  });
}



  // 轉本地 ISO 字串 yyyy-MM-ddTHH:mm:ss（去掉時區偏移）
  private toIso(val: any): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  columns = [
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'tlt_no', header: '專櫃編號', visible: true },
  { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

  { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
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
  { field: 'TXN_CancelAmt', header: '作廢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
];
}
