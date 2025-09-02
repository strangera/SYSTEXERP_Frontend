import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TLS23050Service } from '../../../service/api/tls/tls23050.service';
import { TypeService } from '../../../service/basic/type.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { catchError, timeout, debounceTime, takeUntil } from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';
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
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls23050',
  templateUrl: './tls23050.component.html',
  styleUrls: ['./tls23050.component.scss'],
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
    CalendarComponent
  ],
})
export class TLS23050Component extends BasicQueryPageComponent<any> {


  data: any[] = [];
  totalRecords = 0;
  showPageSizeDialog = false;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列欄位改用 control<any[]>([])，避免 never[] 型別錯誤
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ECR_No: [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  WhetherOptions: any[] = [];
  typeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  constructor(
    private tls23050Service: TLS23050Service,
    private whetherService: WhetherService,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23050', 'tls/tls23050', this.queryForm, (form) => this.onSubmit(form));





    // ✅ 下拉資料：全部加 takeUntil，避免 memory leak
    this.whetherService.getWhetherOptions()
      
      .subscribe(data => this.WhetherOptions = data);

    this.typeService.getTypeOptions()
      
      .subscribe(data => this.typeOptions = data);

    this.floorService.getFloors()
      
      .subscribe(data => this.floorOptions = data);

    this.tls11010Service.getBuildingOptions()
      
      .subscribe(data => this.BUILDING_NO_Options = data);

    this.tls11010Service.getOrgOptions()
      
      .subscribe(data => {
        this.OrganizationCodeOptions = (data ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.ECRNoService.getECRNo()
      
      .subscribe(data => {
        this.ECRNoOptions = (data ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });
  }

  // 送出查詢
// 送出查詢（無 doQuery / buildPayload）
// 送出查詢（顯示 tLS23050Details）
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.value as any;

    const payload: any = {
      ...val,
      TXN_DateStart: this.toIso(val?.TXN_DateStart),
      TXN_DateEnd:   this.toIso(val?.TXN_DateEnd),
      TXN_No_Start:  (val?.TXN_No_Start ?? '') !== '' ? Number(val.TXN_No_Start) : undefined,
      TXN_No_End:    (val?.TXN_No_End ?? '')   !== '' ? Number(val.TXN_No_End)   : undefined,
      pageSize:  val?.pageSize,
      pageIndex: val?.pageIndex,
      SortBy:    val?.SortBy,
      OrderBy:   val?.OrderBy,
      Offset:    val?.Offset,
    };

    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23050Service.queryTLS23050(payload).subscribe({
      next: (res) => {
        // 安全抓取 Data[0]，並把表格資料設為 tLS23050Details
        const first = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : null;
        const details = Array.isArray(first?.tLS23050Details) ? first.tLS23050Details : [];

        this.data = details;
        this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : details.length;

        // 如果之後要用總計可留著（不影響目前畫面顯示）
        // this.summary = first ?? null;
      },
      error: (err) => {
        console.error('TLS23050 查詢失敗', err);
       
        this.data = [];
        this.totalRecords = 0;
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      }
    });
  });
}



// 日期轉後端要的 yyyy-MM-ddTHH:mm:ss（以本地時間為準，去掉時區偏移）
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

 columns=
     [
      { field: 'ECR_No', header: '收銀機號', visible: true },
      { field: 'tlt_no', header: '專櫃編號', visible: true },
      { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
      { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt81', header: '[信用卡]中信停車場', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt82', header: '[一卡通]停車場', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt24', header: '禮券餘額代卡', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt83', header: '[LINE Pay]停車場', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt56', header: '一卡通錢包', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt22', header: '[外來提貨單]高夢', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_PayAmt23', header: '[外來禮券]高夢', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'PreSale_Received', header: '預售訂金', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'PreSale_Checkout', header: '預售實收結帳', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_ExchangeAmt', header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat }
    ];
}
