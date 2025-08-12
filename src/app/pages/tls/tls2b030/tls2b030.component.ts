import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
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
    MultiSelectComponent,
    DropdownComponent,
    CheckboxModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS2B030Component extends BasicQueryPageComponent<any> {
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 注意：只宣告，不先 new；避免 ngOnInit 再覆蓋掉預設值
  queryForm!: FormGroup;

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
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

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
    // 先建立表單（預設走「日報表」：昨天～昨天）
    this.queryForm = this.formBuilder.group(
      {
        TXN_YearMonth: [{ value: null, disabled: true }],     // 先停用月報表
        TXN_Date_Start: [this.yesterday],
        TXN_Date_End: [this.yesterday],
        ECR_No_List: [[]],
        TLT_No_List: [[]],
        ECR_Type: [],
        onlyShowOverflow: [false],
        tlt_building: [],
        tlt_floor: [[]],
        area_no: [[]],
        ...createPaginationConfig([{ field: 'TXN_YearMonth', order: 1 }]),
      },
      { validators: this.dateChoiceValidator.bind(this) }
    );

    this.initializePage('TLS2B030', '/TLS2000/TLS2B030CRU', this.queryForm);

    // 二擇一互斥：任一側有值就鎖住另一側
    this.queryForm.get('TXN_YearMonth')?.valueChanges.subscribe((val) => {
      const start = this.queryForm.get('TXN_Date_Start')!;
      const end = this.queryForm.get('TXN_Date_End')!;
      if (val) {
        // 選了月 -> 清空並停用日區間
        start.setValue(null, { emitEvent: false });
        end.setValue(null, { emitEvent: false });
        start.disable({ emitEvent: false });
        end.disable({ emitEvent: false });
      } else {
        // 沒選月 -> 啟用日區間（若都沒值，回填昨天~昨天）
        start.enable({ emitEvent: false });
        end.enable({ emitEvent: false });
        if (!start.value && !end.value) {
          start.setValue(this.yesterday, { emitEvent: false });
          end.setValue(this.yesterday, { emitEvent: false });
        }
      }
      this.queryForm.updateValueAndValidity({ emitEvent: false });
    });

    const handleRangeChanged = () => {
      const ym = this.queryForm.get('TXN_YearMonth')!;
      const s = this.queryForm.get('TXN_Date_Start')!.value;
      const e = this.queryForm.get('TXN_Date_End')!.value;
      if (s || e) {
        // 只要日區間有動作 -> 清空並停用月
        ym.setValue(null, { emitEvent: false });
        ym.disable({ emitEvent: false });
      } else {
        // 都清掉 -> 開放月
        ym.enable({ emitEvent: false });
      }
      this.queryForm.updateValueAndValidity({ emitEvent: false });
    };

    this.queryForm.get('TXN_Date_Start')?.valueChanges.subscribe(handleRangeChanged);
    this.queryForm.get('TXN_Date_End')?.valueChanges.subscribe(handleRangeChanged);

    // 下拉資料
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.cahserTypeService.getSystemTypes().subscribe((res) => (this.cahserTypeOptions = res));
    this.regionService.getRegionOptions().subscribe((data) => (this.regionOptions = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));

    // 小計欄位（非文字）
    const textFields = ['ECR_No', 'tlt_no', 'tlt_name'];
    this.subtotalFields = this.columns
      .filter((col) => !textFields.includes(col.field))
      .map((col) => col.field);
  }

  /** 群組驗證器：兩種日期擇一必填；若選「日」，起訖都要有；不可同時選兩種 */
  private dateChoiceValidator(group: FormGroup): ValidationErrors | null {
    const start: Date | null = group.get('TXN_Date_Start')?.value ?? null;
    const end: Date | null = group.get('TXN_Date_End')?.value ?? null;
    const ym: Date | null = group.get('TXN_YearMonth')?.value ?? null;

    const hasRange = start instanceof Date && !isNaN(start.getTime()) && end instanceof Date && !isNaN(end.getTime());
    const hasAnyRange = (start instanceof Date && !isNaN(start.getTime())) || (end instanceof Date && !isNaN(end.getTime()));
    const hasMonth = ym instanceof Date && !isNaN(ym.getTime());

    if (hasMonth && (hasAnyRange || hasRange)) {
      return { onlyOneDateAllowed: true };      // 不能同時填
    }
    if (!hasMonth && !hasAnyRange) {
      return { atLeastOneDateRequired: true };  // 兩邊都沒填
    }
    if (!hasMonth && hasAnyRange && !hasRange) {
      return { dateRangeIncomplete: true };     // 選日但沒同時填起+訖
    }
    return null;
  }

  onSubmit(form: FormGroup): void {
    if (form.invalid) {
      this.submitted = true;
      this.messageService.errorBubble('請完成日期條件（擇一且必填）');
      return;
    }

    this.handleSubmit(form, () => {
      const payload: any = { ...form.getRawValue() }; // 取含 disabled 欄位處理後的值

      // 轉換字串欄位
      Object.keys(payload).forEach((k) => {
        if (typeof payload[k] === 'string') payload[k] = payload[k].trim() || null;
      });

      // checkbox 對應 API 欄位
      payload['OnlyShowOverAmount'] = payload['onlyShowOverflow'];
      delete payload['onlyShowOverflow'];

      // 月份轉 yyyyMM
      const month = payload['TXN_YearMonth'];
      if (month instanceof Date && !isNaN(month.getTime())) {
        const yyyy = month.getFullYear();
        const mm = String(month.getMonth() + 1).padStart(2, '0');
        payload['TXN_YearMonth'] = `${yyyy}${mm}`;
      } else {
        payload['TXN_YearMonth'] = null;
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
        error: () => this.messageService.errorBubble('查詢失敗'),
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  onClearForm(): void {
    // 清空並回到預設「日報表：昨天~昨天」
    this.queryForm.reset({}, { emitEvent: false });
    this.queryForm.get('TXN_Date_Start')?.enable({ emitEvent: false });
    this.queryForm.get('TXN_Date_End')?.enable({ emitEvent: false });
    this.queryForm.get('TXN_YearMonth')?.disable({ emitEvent: false });

    this.queryForm.patchValue(
      {
        TXN_YearMonth: null,
        TXN_Date_Start: this.yesterday,
        TXN_Date_End: this.yesterday,
        onlyShowOverflow: false,
        ECR_No_List: [],
        TLT_No_List: [],
        tlt_building: null,
        tlt_floor: [],
        area_no: [],
      },
      { emitEvent: false }
    );

    this.queryForm.updateValueAndValidity({ emitEvent: false });
    this.submitted = false;
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }
  switchDateMode(mode: 'range' | 'month') {
  const s = this.queryForm.get('TXN_Date_Start')!;
  const e = this.queryForm.get('TXN_Date_End')!;
  const ym = this.queryForm.get('TXN_YearMonth')!;

  if (mode === 'range') {
    // 清空月、停用月；啟用日（必要時回填昨天～昨天）
    ym.setValue(null, { emitEvent: false });
    ym.disable({ emitEvent: false });

    s.enable({ emitEvent: false });
    e.enable({ emitEvent: false });
    if (!s.value && !e.value) {
      s.setValue(this.yesterday, { emitEvent: false });
      e.setValue(this.yesterday, { emitEvent: false });
    }
  } else {
    // 清空日、停用日；啟用月
    s.setValue(null, { emitEvent: false });
    e.setValue(null, { emitEvent: false });
    s.disable({ emitEvent: false });
    e.disable({ emitEvent: false });

    ym.enable({ emitEvent: false });
    // 也可選擇預設 ym：例如設定為昨天所屬月份
    // const d = this.yesterday; ym.setValue(new Date(d.getFullYear(), d.getMonth(), 1), { emitEvent: false });
  }

  this.queryForm.updateValueAndValidity({ emitEvent: false });
}


  // const textFields = ['ECR_No', 'tlt_no', 'tlt_name'];
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
      isTotal: true,
    },
    {
      field: 'Pay_Dif_41',
      header: '聯信連線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_42',
      header: '聯信離線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_12',
      header: '聯信紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_81',
      header: '中信-停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_43',
      header: '中信連線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_44',
      header: '中信離線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_14',
      header: '中信紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_82',
      header: '一卡通-停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_52',
      header: '一卡通',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_20',
      header: '禮券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_62',
      header: '商品提貨單',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_77',
      header: '感熱紙抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_71',
      header: '商品抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_30',
      header: '貴賓提貨單(應收帳款)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_73',
      header: '外來禮券(抵用券)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_72',
      header: '外來提貨單(抵用券)',
      isTotal: true,
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
      isTotal: true,
    },
    {
      field: 'Pay_Dif_75',
      header: '折價券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_76',
      header: '現抵',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_24',
      header: '禮券餘代卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_25',
      header: '提貨單餘代卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_07',
      header: '會員折抵',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_83',
      header: 'LINE Pay-停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_55',
      header: 'LINE Pay',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_78',
      header: 'APP抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_79',
      header: 'APP提貨單',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_22',
      header: '外來提貨單-高夢',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_23',
      header: '外來禮券-高夢',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_53',
      header: '悠遊卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_56',
      header: 'iPASS MONEY',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_57',
      header: '台灣Pay',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_58',
      header: '南紡錢包',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_59',
      header: '即享券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'Pay_Dif_60',
      header: '喜客券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
    {
      field: 'PPay_Dif_sum',
      header: '總金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
      isTotal: true,
    },
  ];
}
