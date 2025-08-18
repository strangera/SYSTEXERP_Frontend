import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { CahserTypeService } from '../../../service/basic/cahser-type.service';
import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { TLS2B030Service } from '../../../service/api/tls/tls2-b030.service';

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

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  // 金額格式化（用箭頭函式確保 this）
  moneyFormat = (value: number): string => (value != null ? value.toLocaleString('en-US') : '0');

  // 查詢表單
  queryForm = this.formBuilder.group({
    TXN_Date_Start: [this.yesterday as Date | null],   // Date
    TXN_Date_End: [this.yesterday as Date | null],     // Date
    TXN_YearMonth: [null as Date | null],              // 用 Date，送出轉 yyyyMM
    // 多選
    TLT_No_List: this.formBuilder.control([] as string[]),
    ECR_No_List: this.formBuilder.control([] as string[]),
    tlt_floor: this.formBuilder.control([] as string[]),
    area_no: this.formBuilder.control([] as string[]),
    // 單值
    ECR_Type: ['' as string],
    tlt_building: ['' as string],
    OnlyShowOverAmount: [false as boolean],
    ...createPaginationConfig([{ field: 'TLT_Name', order: 1 }]), 
  });

  // 下拉選項
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  cahserTypeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  // 表格欄位（修正 TLT_No / TLT_Name 大小寫）
  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'Pay_Dif_10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_41', header: '聯信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_42', header: '聯信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_12', header: '聯信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_56', header: 'iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Pay_Dif_60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'PPay_Dif_sum', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
  ];

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
    this.initializePage('TLS2B030', 'tls/tls2B030cru', this.queryForm, (form) => this.onSubmit(form));
    // 下拉資料
    this.ECRNoService.getECRNo().subscribe((res) => { this.ECRNoOptions = res?.map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || []; });
    this.counterNameService.getCounters().subscribe((res) => { this.CounterOptions = res?.map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || []; });
    this.cahserTypeService.getSystemTypes().subscribe((res) => (this.cahserTypeOptions = res));
    this.regionService.getRegionOptions().subscribe((data) => (this.regionOptions = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
  }

  /** 工具：Date -> yyyyMM */
  private toYYYYMM(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${y}${m}`;
  }

  /** 工具：把某日設為當天 23:59:59.999（含當日） */
  private asEndOfDay(d: Date): Date {
    const e = new Date(d);
    e.setHours(23, 59, 59, 999);
    return e;
  }

  onSubmit(frm: FormGroup) {
    // 清理、互斥、預設，與簡單驗證
    const val = { ...frm.value };

    // 互斥處理：若有選月份，清空起訖日
    if (val.TXN_YearMonth instanceof Date) {
      val.TXN_YearMonth = this.toYYYYMM(val.TXN_YearMonth);
      val.TXN_Date_Start = null;
      val.TXN_Date_End = null;
    } else if (val.TXN_YearMonth == null || val.TXN_YearMonth === '') {
      // 沒選月份，使用日期區間；若只有其一就補另一個
      const start = val.TXN_Date_Start ? new Date(val.TXN_Date_Start) : null;
      const end = val.TXN_Date_End ? new Date(val.TXN_Date_End) : null;

      if (!start && !end) {
        // 都沒填 → 預設昨天~昨天
        val.TXN_Date_Start = this.yesterday;
        val.TXN_Date_End = this.asEndOfDay(this.yesterday);
      } else {
        const s = start ?? end;
        const e = end ?? start;
        if (s && e && s > e) {
          this.messageService.errorBubble('起日不可大於迄日', '日期區間錯誤');
          return;
        }
        val.TXN_Date_Start = s;
        val.TXN_Date_End = this.asEndOfDay(e!);
      }
      // 保證月份欄位為 null（給後端擇一判斷）
      val.TXN_YearMonth = null;
    }

    // 送出查詢
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.tls2b030Service.queryTLS2B030(val).subscribe({
        next: (response) => {
          if (response?.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || this.data.length || 0;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response?.Status, response?.Message);
            
          }
          this.loading = false;
        },
        error: (err: any) => {
          console.error('API error:', err);
         
          this.loading = false;
        },
      });
    });
  }
}
