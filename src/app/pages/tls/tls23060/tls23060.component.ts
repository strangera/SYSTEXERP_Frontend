import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { TLS23060Service } from '../../../service/api/tls/tls23060.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TypeService } from '../../../service/basic/type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23060',
  templateUrl: './tls23060.component.html',
  styleUrls: ['./tls23060.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    RadiobuttonComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23060Component extends BasicQueryPageComponent<any> {
  
  data: any[] = [];
  totalRecords = 0;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列型欄位改用 control<any[]>([])，避免 never[] 型別
  queryForm = this.formBuilder.group({
  
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    ECR_No: [],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }])
  });

  WhetherOptions: any[] = [];
  typeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23060Service: TLS23060Service,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private whetherService: WhetherService,
    private columnLabelService: ColumnLabelService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23060', 'tls/tls23060', this.queryForm, (form) => this.onSubmit(form));

    // ✅ 下拉資料加 takeUntil，避免 memory leak
    this.whetherService.getWhetherOptions().subscribe(data => (this.WhetherOptions = data));

    this.typeService.getTypeOptions().subscribe(data => (this.typeOptions = data));

    this.floorService.getFloors().subscribe(data => (this.floorOptions = data));

    this.tls11010Service.getBuildingOptions().subscribe(data => (this.BUILDING_NO_Options = data));

    this.tls11010Service.getOrgOptions().subscribe(data => {
        this.OrganizationCodeOptions =
          data?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.ECRNoService.getECRNo().subscribe(data => {
        this.ECRNoOptions =
          data?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.counterNameService.getCounters().subscribe(data => {
        this.CounterOptions =
          data?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
  }

  
  // 送出查詢
// 送出查詢
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const formValue = this.queryForm.value;

    // 直接組 payload
    const payload: any = { ...formValue };

    if (payload.TXN_DateStart instanceof Date) {
      payload.TXN_DateStart = payload.TXN_DateStart.toISOString().slice(0, 10);
    }
    if (payload.TXN_DateEnd instanceof Date) {
      payload.TXN_DateEnd = payload.TXN_DateEnd.toISOString().slice(0, 10);
    }

   

    // 呼叫 API
    this.loading = true;
    this.messageService?.blockUi();

    this.tls23060Service.queryTLS23060(payload).subscribe({
      next: (res) => {
        const raw = res?.Data ?? [];
        this.data = Array.isArray(raw) ? raw : [];
        this.totalRecords = typeof res?.TotalCount === 'number'
          ? res.TotalCount
          : this.data.length;
      },
      error: (err) => {
        console.error('TLS23060 查詢失敗', err);
        this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      }
    });
  });
}


  
/** 與 CRU 頁一致的金額格式化 */
private moneyFormat(value: number): string {
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
