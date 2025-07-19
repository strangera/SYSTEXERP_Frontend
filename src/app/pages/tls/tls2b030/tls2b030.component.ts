import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2B030Service } from '../../../service/api/tls/tls2-b030.service';
import { CahserTypeService } from '../../../service/basic/cahser-type.service';
import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';

@Component({
  selector: 'app-tls2b030',
  templateUrl: './tls2b030.component.html',
  styleUrl: './tls2b030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    CalendarComponent,
    InputNumberRangeComponent,
    MultiSelectComponent,
    DropdownComponent,
    CheckboxModule,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS2B030Component extends BasicQueryPageComponent<any> {
 
  queryForm = this.formBuilder.group({
   
    onedatemm: [],
    startdate: [],
    enddate: [],
    cahserStart: [
      ,
      [Validators.max(999999), this.validationService.numberValidator],
    ],
    cahserEnd: [
      ,
      [Validators.max(999999), this.validationService.numberValidator],
    ],
    counterStart: [
      ,
      [Validators.max(999999), this.validationService.numberValidator],
    ],
    counterEnd: [
      ,
      [Validators.max(999999), this.validationService.numberValidator],
    ],
    regionCode: [[]],
    cahserType: [[]],

    onlyShowOverflow: [],
    tlt_building: [],
    tlt_floor: [],
    area_no: [],
    usagecount: [0, [Validators.required]],
    ...createPaginationConfig([{ field: 'onedatemm', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  subtotalFields: string[] = [];



  // 下拉選項
  cahserTypeOptions: any[] = [];
  areaCodeOptions: any[] = [];

  constructor(
    private tls2b030Service: TLS2B030Service,
    private cahserTypeService: CahserTypeService,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS2B030',
      '/TLS2000/TLS2B030CRU',
      this.queryForm,
      (form) => this.onSubmit(form),
    );

    this.cahserTypeService
      .getSystemTypes()
      .subscribe((res) => (this.cahserTypeOptions = res));
    this.regionService
      .getRegionOptions()
      .subscribe((data) => (this.regionOptions = data));
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));
        // 加入 subtotalFields 計算（只排除文字欄位）
  const textFields = ['ECR_No', 'tlt_no', 'tlt_name'];
  this.subtotalFields = this.columns
    .filter(col => !textFields.includes(col.field))
    .map(col => col.field);
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = { ...form.value };
      Object.keys(payload).forEach((key) => {
        if (typeof payload[key] === 'string') {
          payload[key] = payload[key].trim() || null;
        }
      });

      this.loading = true;
      this.messageService.blockUi();

      this.tls2b030Service.queryTLS2B030(payload).subscribe({
        next: (res) => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, payload);
          this.messageService.successBubble('查詢成功');
        },
        error: () => {
          this.messageService.errorBubble('查詢失敗');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0'; // ✅ 使用美式格式
  }
  onClearForm(): void {
    this.queryForm.reset();
  }
   columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    },
    {
      field: 'TXN_TotPayAmt',
      header: '總金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt10',
      header: '現金',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt41',
      header: '聯合連線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt42',
      header: '聯合離線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt12',
      header: '聯合紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt81',
      header: '[信用卡]中信停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt43',
      header: '中信連線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt44',
      header: '中信離線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt14',
      header: '中信紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt82',
      header: '[一卡通]停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt52',
      header: '一卡通',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt20',
      header: '禮券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt62',
      header: '商品提貨單',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt77',
      header: '感熱紙抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt71',
      header: '商品抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt30',
      header: '貴賓提貨單(應收帳款)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt73',
      header: '外來禮券(抵用券)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt72',
      header: '外來提貨單(抵用券)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt74',
      header: '活動券(自營)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt75',
      header: '折價券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt76',
      header: '現抵',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt24',
      header: '禮券餘額代卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt25',
      header: '提貨單餘代卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt07',
      header: '會員折抵',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt55',
      header: 'LINE Pay',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt83',
      header: '[LINE Pay]停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt78',
      header: 'APP抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt79',
      header: 'APP提貨單',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt21',
      header: 'APP禮券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt53',
      header: '悠遊卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt56',
      header: '一卡通錢包',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt57',
      header: '台灣Pay',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt58',
      header: '南紡錢包',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt59',
      header: '即享券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt60',
      header: '喜客券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt22',
      header: '[外來提貨單]高夢',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt23',
      header: '[外來禮券]高夢',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'PreSale_Received',
      header: '預售訂金',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'PreSale_Checkout',
      header: '預售實收結帳',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_OverAmt',
      header: '溢收金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_ReturnAmt',
      header: '退貨金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_ExchangeAmt',
      header: '換貨金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_CancelAmt',
      header: '作廢金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];
}
