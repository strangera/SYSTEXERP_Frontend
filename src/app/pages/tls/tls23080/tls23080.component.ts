import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';

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
import { Subject, Subscription, of, firstValueFrom } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';
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

    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }])
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

    // ✅ 下拉資料：全部 takeUntil
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
moneyFormat(value: number): string {
  return value != null ? value.toLocaleString('en-US') : '0';
}
// formatDate：輸出 2024/05/27
 formatDate = (val: string | Date | number): string => {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};


onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;

    // 由 pageIndex/pageSize 推 Offset (0-based)
    const offset =
      Number.isFinite(val?.pageIndex) && Number.isFinite(val?.pageSize)
        ? Math.max(0, (val.pageIndex - 1) * val.pageSize)
        : undefined;

    // SortMeta[] -> "field ASC,DESC..."
    const orderBy =
      Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
        : undefined;

    // 組 payload（用 YYYY-MM-DD，避免 toISOString 少一天）
    const payload: any = {
      TXN_DateStart: formatDateToYYYY_MM_DD(val?.TXN_DateStart),
      TXN_DateEnd:   formatDateToYYYY_MM_DD(val?.TXN_DateEnd),
      tlt_openflag:  val?.tlt_openflag,
      ECR_No:        val?.ECR_No,
      tlt_building:  val?.tlt_building,
      tlt_floor:     val?.tlt_floor,
      org_id:        val?.org_id,
      pageSize:      val?.pageSize,
      pageIndex:     val?.pageIndex,
      SortBy:        val?.SortBy,
      ...(offset  !== undefined ? { Offset:  offset } : {}),
      ...(orderBy ? { OrderBy: orderBy } : {}),
    };

    // 去除空值/空陣列
    Object.keys(payload).forEach(k => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23080Service.queryTLS23080(payload).subscribe({
      next: (res: any) => {
        // res.Data 可能是單筆或多筆彙總，每筆都有 tLS23080_Details:[...]
        const groups = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);

        // 合併所有細項並處理日期顯示
        const details = groups.flatMap((g: any)=>
          Array.isArray(g?.tLS23080_Details) ? g.tLS23080_Details : []
        ).map((d: any) => ({
          ...d,
          // 若要在表格顯示 YYYY-MM-DD，可轉一下；不需要就拿掉這行
          TXN_Date: d?.TXN_Date ? formatDateToYYYY_MM_DD(d.TXN_Date) : d?.TXN_Date
        }));

        // 只顯示細項
        this.data = details;

        // 總筆數：優先用 API 回傳，否則用細項長度
        this.totalRecords =
          typeof res?.TotalCount === 'number' ? res.TotalCount : details.length;

        // 若你同時需要在頁面顯示彙總(總金額們)，可留存第一筆彙總資料(不影響表格顯示)
        // this.headerTotals = groups[0]; // 之後自行在畫面讀用
      },
      error: (err) => {
        console.error('TLS23080 查詢失敗', err);
        this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
        this.loading = false;
        this.messageService?.unblockUi();
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      }
    });
  });
}


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
