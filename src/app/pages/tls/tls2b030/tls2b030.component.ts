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
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { startWith, distinctUntilChanged } from 'rxjs/operators';

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

    // ✅ NEW: 群組驗證器：月份 XOR 日期，且日期要成對
  private oneOfMonthOrDateValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const ym = group.get('TXN_YearMonth')?.value;
    const s  = group.get('TXN_Date_Start')?.value;
    const e  = group.get('TXN_Date_End')?.value;

    const hasMonth = !!ym;
    const hasAnyDate = !!s || !!e;
    const hasBothDates = !!s && !!e;

    if (hasMonth && hasAnyDate) return { bothFilled: true };        // 兩組都填
    if (!hasMonth && !hasAnyDate) return { oneRequired: true };      // 皆未填
    if (hasAnyDate && !hasBothDates) return { rangeIncomplete: true }; // 日期不成對
    return null;
  };


  // 查詢表單
  // ... 你原本的 queryForm
  queryForm = this.formBuilder.group({
    TXN_Date_Start: [this.yesterday as Date | null],
    TXN_Date_End:   [this.yesterday as Date | null],
    TXN_YearMonth:  [null as Date | null],
    TLT_No_List: this.formBuilder.control([] as string[]),
    ECR_No_List: this.formBuilder.control([] as string[]),
    tlt_floor:   this.formBuilder.control([] as string[]),
    area_no:     this.formBuilder.control([] as string[]),
    ECR_Type: ['' as string],
    tlt_building: ['' as string],
    OnlyShowOverAmount: [false as boolean],
    ...createPaginationConfig([{ field: 'TLT_Name', order: 1 }]),
  }, { validators: [] as ValidatorFn[] }); // 先空，ngOnInit 裡面掛

  // ✅ NEW: 方便存取控制項
  private get c() {
    return {
      s:  this.queryForm.controls.TXN_Date_Start,
      e:  this.queryForm.controls.TXN_Date_End,
      ym: this.queryForm.controls.TXN_YearMonth,
    };
  }

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

    // 掛群組驗證器
    this.queryForm.addValidators(this.oneOfMonthOrDateValidator);

    // 互斥啟用/停用監聽
    this.setupMutualExclusiveInputs(); // ✅ NEW

    // 下拉資料（維持你原本邏輯）
    this.ECRNoService.getECRNo().subscribe((res) => { this.ECRNoOptions = res?.map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || []; });
    this.counterNameService.getCounters().subscribe((res) => { this.CounterOptions = res?.map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || []; });
    this.cahserTypeService.getSystemTypes().subscribe((res) => (this.cahserTypeOptions = res));
    this.regionService.getRegionOptions().subscribe((data) => (this.regionOptions = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
  }

  // ✅ NEW: 互斥邏輯
  private setupMutualExclusiveInputs(): void {
    // 初始同步一次
    this.applyExclusiveEnableDisable();

    // 監聽 月份
    this.c.ym.valueChanges
      .pipe(startWith(this.c.ym.value), distinctUntilChanged())
      .subscribe(() => this.applyExclusiveEnableDisable());

    // 監聽 日期（起/訖任一變更都觸發）
    this.c.s.valueChanges
      .pipe(startWith(this.c.s.value), distinctUntilChanged())
      .subscribe(() => this.applyExclusiveEnableDisable());
    this.c.e.valueChanges
      .pipe(startWith(this.c.e.value), distinctUntilChanged())
      .subscribe(() => this.applyExclusiveEnableDisable());
  }

  // ✅ NEW: 根據目前輸入情況，動態 disable/enable + 清空另一組
  private applyExclusiveEnableDisable(): void {
    const ymHas = !!this.c.ym.value;
    const sHas  = !!this.c.s.value;
    const eHas  = !!this.c.e.value;
    const anyDate = sHas || eHas;

    if (ymHas) {
      // 有選月份 → 停用日期，清掉日期值；啟用月份
      if (this.c.s.enabled) this.c.s.disable({ emitEvent: false });
      if (this.c.e.enabled) this.c.e.disable({ emitEvent: false });
      if (sHas) this.c.s.setValue(null, { emitEvent: false });
      if (eHas) this.c.e.setValue(null, { emitEvent: false });
      if (this.c.ym.disabled) this.c.ym.enable({ emitEvent: false });
    } else if (anyDate) {
      // 有輸入任一日期 → 停用月份，清掉月份值；啟用日期
      if (this.c.ym.enabled) this.c.ym.disable({ emitEvent: false });
      if (this.c.ym.value) this.c.ym.setValue(null, { emitEvent: false });
      if (this.c.s.disabled) this.c.s.enable({ emitEvent: false });
      if (this.c.e.disabled) this.c.e.enable({ emitEvent: false });
    } else {
      // 都沒輸入 → 都啟用，讓使用者擇一
      if (this.c.ym.disabled) this.c.ym.enable({ emitEvent: false });
      if (this.c.s.disabled) this.c.s.enable({ emitEvent: false });
      if (this.c.e.disabled) this.c.e.enable({ emitEvent: false });
    }

    // 重新驗證
    this.c.ym.updateValueAndValidity({ emitEvent: false });
    this.c.s.updateValueAndValidity({ emitEvent: false });
    this.c.e.updateValueAndValidity({ emitEvent: false });
    this.queryForm.updateValueAndValidity({ emitEvent: false });
  }

  // ✅ NEW: 提示錯誤用
private markAllAsTouchedAndShowError(): void {
  this.queryForm.markAllAsTouched();

  const err = this.queryForm.errors as Record<string, any> | null; // ← 型別縮小

  if (err?.['bothFilled']) {
    this.messageService?.errorBubble('請擇一輸入，勿同時填「年月」與「日期」', '條件錯誤');
  } else if (err?.['oneRequired']) {
    this.messageService?.errorBubble('請至少填「銷售年月」或「銷售日期區間」其一', '必填');
  } else if (err?.['rangeIncomplete']) {
    this.messageService?.errorBubble('請把「起日」與「迄日」都填寫完整', '日期不完整');
  }
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
    // ✅ NEW: 送出前先檢查 XOR 規則
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.markAllAsTouchedAndShowError();
      return;
    }

    const val = { ...frm.value };

    // 保留你原本送出前轉換，但因為互斥邏輯已清另一組，這裡就簡化：
    if (val.TXN_YearMonth instanceof Date) {
      val.TXN_YearMonth = this.toYYYYMM(val.TXN_YearMonth);
      val.TXN_Date_Start = null;
      val.TXN_Date_End = null;
    } else {
      // 使用日期區間（群組驗證已確保兩者都有）
      val.TXN_YearMonth = null;
      val.TXN_Date_End = this.asEndOfDay(new Date(val.TXN_Date_End));
    }

    // 送出查詢（沿用你原本邏輯）
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

