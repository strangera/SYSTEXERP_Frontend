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
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

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
    // InputNumberRangeComponent,
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
    TXN_YearMonth: [],
    TXN_Date_Start: [],
    TXN_Date_End: [],
    ECR_No_List: [[]],
    TLT_No_List: [[]],
    ECR_Type: [],
    onlyShowOverflow: [],
    tlt_building: [],
    tlt_floor: [[]],
    area_no: [[]],
    ...createPaginationConfig([{ field: 'TXN_YearMonth', order: 1 }]),
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
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
   CounterOptions: any[] = []; // 專櫃選項

  constructor(
    private tls2b030Service: TLS2B030Service,
    private cahserTypeService: CahserTypeService,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
   
        private ECRNoService: ECRNoService,
        private counterNameService: CounterNameService,
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

    this.queryForm = this.formBuilder.group(
      {
        TXN_YearMonth: [],
        TXN_Date_Start: [],
        TXN_Date_End: [],
        ECR_No_List: [[]],
        TLT_No_List: [[]],
        ECR_Type: [],
        OnlyShowOverAmount: [],
        tlt_building: [],
        tlt_floor: [[]],
        area_no: [[]],
        ...createPaginationConfig([{ field: 'TXN_YearMonth', order: 1 }]),
      },
      {
        validators: this.atLeastOneDateValidator.bind(this),
      },
    );

     this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.queryForm.get('TXN_YearMonth')?.valueChanges.subscribe((val) => {
      const startControl = this.queryForm.get('TXN_Date_Start');
      const endControl = this.queryForm.get('TXN_Date_End');

      if (val) {
        if (startControl?.enabled) startControl.disable({ emitEvent: false });
        if (endControl?.enabled) endControl.disable({ emitEvent: false });
      } else {
        if (startControl?.disabled) startControl.enable({ emitEvent: false });
        if (endControl?.disabled) endControl.enable({ emitEvent: false });
      }
    });

    this.queryForm.get('TXN_Date_Start')?.valueChanges.subscribe((val) => {
      const onedateControl = this.queryForm.get('TXN_YearMonth');

      if (val) {
        if (onedateControl?.enabled)
          onedateControl.disable({ emitEvent: false });
      } else if (!this.queryForm.get('TXN_Date_End')?.value) {
        if (onedateControl?.disabled)
          onedateControl.enable({ emitEvent: false });
      }
    });

    this.queryForm.get('TXN_Date_End')?.valueChanges.subscribe((val) => {
      const onedateControl = this.queryForm.get('TXN_YearMonth');

      if (val) {
        if (onedateControl?.enabled)
          onedateControl.disable({ emitEvent: false });
      } else if (!this.queryForm.get('TXN_Date_Start')?.value) {
        if (onedateControl?.disabled)
          onedateControl.enable({ emitEvent: false });
      }
    });

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
      .filter((col) => !textFields.includes(col.field))
      .map((col) => col.field);
  }

 onSubmit(form: FormGroup): void {
  console.log('✅ 觸發 onSubmit', form.value);

  if (form.invalid) {
    console.warn('❌ 表單驗證失敗:', form.errors, form.value);
    this.messageService.errorBubble('日期必要欄位');
    return;
  }

  this.handleSubmit(form, () => {
    const payload = { ...form.value };

    // ✅ 字串欄位去除空白
    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim() || null;
      }
    });
    // ✅ checkbox 對應 API 欄位名稱
payload['OnlyShowOverAmount'] = payload['onlyShowOverflow'];
delete payload['onlyShowOverflow'];

    // ✅ TXN_YearMonth：轉換成 yyyyMM 格式
    const month = payload['TXN_YearMonth'];
    if (month instanceof Date && !isNaN(month.getTime())) {
      const yyyy = month.getFullYear();
      const mm = String(month.getMonth() + 1).padStart(2, '0');
      payload['TXN_YearMonth'] = `${yyyy}${mm}`;
    }

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
    this.queryForm.get('TXN_Date_Start')?.enable({ emitEvent: false });
    this.queryForm.get('TXN_Date_End')?.enable({ emitEvent: false });
    this.queryForm.get('TXN_YearMonth')?.enable({ emitEvent: false });
  }

  private atLeastOneDateValidator(
    group: FormGroup,
  ): { [key: string]: any } | null {
    const start = group.get('TXN_Date_Start')?.value;
    const end = group.get('TXN_Date_End')?.value;
    const month = group.get('TXN_YearMonth')?.value;

    const isDateRangeFilled = start instanceof Date && !isNaN(start.getTime()) &&
                          end instanceof Date && !isNaN(end.getTime());
    const isMonthFilled = !!month;

    if (!isDateRangeFilled && !isMonthFilled) {
      return { atLeastOneDateRequired: true };
    }

    if (isDateRangeFilled && isMonthFilled) {
      return { onlyOneDateAllowed: true };
    }

    return null;
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
      field: 'Pay_Dif_10',
      header: '現金',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_41',
      header: '聯信連線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_42',
      header: '聯信離線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_12',
      header: '聯信紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_81',
      header: '中信-停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_43',
      header: '中信連線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_44',
      header: '中信離線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_14',
      header: '中信紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_82',
      header: '一卡通-停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_52',
      header: '一卡通',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_20',
      header: '禮券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_62',
      header: '商品提貨單',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_77',
      header: '感熱紙抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_71',
      header: '商品抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_30',
      header: '貴賓提貨單(應收帳款)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_73',
      header: '外來禮券(抵用券)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_72',
      header: '外來提貨單(抵用券)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_74',
      header: '活動券(自營)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_75',
      header: '折價券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_76',
      header: '現抵',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_24',
      header: '禮券餘代卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_25',
      header: '提貨單餘代卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_07',
      header: '會員折抵',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_83',
      header: 'LINE Pay-停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_55',
      header: 'LINE Pay',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_78',
      header: 'APP抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_79',
      header: 'APP提貨單',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_22',
      header: '外來提貨單-高夢',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_23',
      header: '外來禮券-高夢',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_53',
      header: '悠遊卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_56',
      header: 'iPASS MONEY',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_57',
      header: '台灣Pay',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_58',
      header: '南紡錢包',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_59',
      header: '即享券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'Pay_Dif_60',
      header: '喜客券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'PPay_Dif_sum',
      header: '總金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];
}
