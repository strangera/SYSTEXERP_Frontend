import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FloorService } from '@service/basic/querySYS3900.service';
import { RegionService } from '@service/basic/querySYS3A00.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { startWith } from 'rxjs';
import { TLS32030Data, TLS32030Service } from '../../../service/api/tls/tls32030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls32030',
  templateUrl: './tls32030.component.html',
  standalone: true,
  imports: [
    AsyncPipe, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, AccordionModule,
    MenubarComponent, ButtonComponent, CalendarComponent, CalendarRangeComponent, DividerModule,
    CalendarRangeQuickComponent, InputNumberComponent, InputTextComponent, DropdownComponent,
    MultiSelectComponent, RadiobuttonComponent, TableComponent
  ]
})
export class TLS32030Component extends BasicQueryPageComponent<TLS32030Data> implements OnInit {

  queryForm = this.formBuilder.group({
    DayType: ['3'],
    BaseDateFrom: [null as Date | null, [Validators.required]],
    BaseDateTo: [null as Date | null, [Validators.required]],

    year: [new Date()],
    week: [null as number | null],
    month: [null as number | null],
    halfYear: [null as number | null],
    // 日報表

    CompareDateFrom: [null as Date | null, [Validators.required]],
    CompareDateTo: [null as Date | null, [Validators.required]],
    CompareYear: [new Date()], // 預設與 BaseYear 相同
    CompareWeek: [null as number | null],
    CompareMonth: [null as number | null],
    CompareHalfYear: [null as number | null],

    FloorList: [""],
    AreaList: [""],
    BuildingList: [""],
    BusTypeList: [""],
    BusClassList: [""],
    TltKindList: [""],
    OrgList: [""],
    TltNoList: [""],
    TermTypeList: [null],
    AmtTaxMode: ['G'], // 是否含稅 (預設含稅)
    ReceFilter: ['A'],
    ...createPaginationConfig([{ field: 'TltNo', order: -1 }])
  });

  data: TLS32030Data[] = [];
  totalRecords = 0;
  selectedItems: TLS32030Data[] = [];

  DayTypeOptions = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
  ];
  taxOptions = [{ value: 'G', label: '含稅' }, { value: 'N', label: '未稅' }];

  auditoriumOptions = this.dropdown.querySys3800();
  organizationOptions = this.dropdown.querySys3100();
  regionOptions = this.dropdown.querySys3A00();
  floorOptions = this.dropdown.querySys3900();
  businessTypeCodeOptions = this.dropdown.queryTltBusType();
  BusClassListOptions = this.dropdown.queryTltBusType();
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  operationsOptions = getSYS1000Options('store_way');
  counterCodeOptions = this.dropdown.queryTltTalent();
  ReceFilterOptions = [
    { value: 'A', label: '全部' },
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1, // 1 到 12
    label: `${i + 1} 月`
  }));
  weekOptions: { value: number, label: string }[] = [];
  halfYearOptions = [
    { value: 1, label: '上半年' }, // 1: 上半年 (1/1 ~ 6/30)
    { value: 2, label: '下半年' } // 2: 下半年 (7/1 ~ 12/31)
  ];

  columns: Column[] = [
    { field: 'building_desc', header: '館別' },
    { field: 'Org_Name', header: '組織' },
    { field: 'SYS_Name', header: '櫃別' },
    { field: 'counterNumber', header: '櫃別' },
    { field: 'TltNo', header: '專櫃編號' },
    { field: 'TltName', header: '專櫃名稱' },

    { field: 'Base_LocationNo', header: '位置編號', groupField: 'Base' },
    { field: 'Base_Space', header: '坪數', groupField: 'Base' },
    { field: 'Base_SaleAmt', header: '銷售金額', groupField: 'Base' },
    { field: 'Base_TxnCnt', header: '交易筆數', groupField: 'Base' },
    { field: 'Base_Target', header: '目標', groupField: 'Base' },
    { field: 'Base_DaySpaceEff', header: '日坪效', groupField: 'Base' },
    { field: 'Base_AchieveRate', header: '達成率', groupField: 'Base' },
    { field: 'Base_AvgTicket', header: '客單價', groupField: 'Base' },

    { field: 'Comp_LocationNo', header: '位置編號', groupField: 'Comp' },
    { field: 'Comp_Space', header: '坪數', groupField: 'Comp' },
    { field: 'Comp_SaleAmt', header: '銷售金額', groupField: 'Comp' },
    { field: 'Comp_TxnCnt', header: '交易筆數', groupField: 'Comp' },
    { field: 'Comp_Target', header: '目標', groupField: 'Comp' },
    { field: 'Comp_DaySpaceEff', header: '日坪效', groupField: 'Comp' },
    { field: 'Comp_AchieveRate', header: '達成率', groupField: 'Comp' },
    { field: 'Comp_AvgTicket', header: '客單價', groupField: 'Comp' },

    { field: 'Diff_SaleAmt', header: '銷售金額差異', groupField: 'Diff' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', groupField: 'Diff' },
    { field: 'Diff_Target', header: '目標差異', groupField: 'Diff' },
    { field: 'Diff_DaySpaceEff', header: '日坪效差異', groupField: 'Diff' },
    { field: 'Diff_AchieveRate', header: '達成率差異', groupField: 'Diff' },
    { field: 'Diff_AvgTicket', header: '客單價差異', groupField: 'Diff' },

    { field: 'Diff_SaleAmt', header: '銷售金額差異', groupField: 'Diff' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', groupField: 'Diff' },
    { field: 'Diff_Target', header: '目標差異', groupField: 'Diff' },
    { field: 'Diff_DaySpaceEff', header: '日坪效差異', groupField: 'Diff' },
    { field: 'Diff_AchieveRate', header: '達成率差異', groupField: 'Diff' },
    { field: 'Diff_AvgTicket', header: '客單價差異', groupField: 'Diff' },

  ];
  columnGroup = [
    { header: '基準', field: 'Base' },
    { header: '比較', field: 'Comp' },
    { header: '差異', field: 'Diff' },
    { header: '成長率', field: 'Growth' }
  ];

  constructor(
    private tls32030Service: TLS32030Service,
    private dropdown: DropdownApiService,
    private floorService: FloorService,
    private regionService: RegionService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32030', 'tls/tls32030', this.queryForm, f => this.onSubmit(f));
    this.setWeekOptions(this.queryForm.controls.year.value);// 初始化週次選項
    this.calculateInitialRanges('3');// 【保留】只在頁面初始化時執行一次完整的初始化
    this.queryForm.controls.DayType.valueChanges.pipe(
      startWith(this.queryForm.controls.DayType.value),
      untilDestroyed(this)
    ).subscribe(type => {

      const today = new Date();
      const compareDefaultDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

      // 1-1. 清除/設定輔助欄位（僅在初始化時會被覆蓋，後續手動切換 DayType 時會被清除）

      // 先清除不相關的輔助欄位
      this.queryForm.controls.week.setValue(null, { emitEvent: false });
      this.queryForm.controls.month.setValue(null, { emitEvent: false });
      this.queryForm.controls.halfYear.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareWeek.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareMonth.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareHalfYear.setValue(null, { emitEvent: false });

      // 重新設定 Base / Compare 預設值（同時處理 DayType 切換和首次初始化）
      if (type === '2') {
        const currentWeek = this.getCurrentWeekNumber(today);
        this.queryForm.controls.week.setValue(currentWeek, { emitEvent: false });
        this.queryForm.controls.CompareWeek.setValue(this.getCurrentWeekNumber(compareDefaultDate), { emitEvent: false }); // 去年同期週次
        this.setWeekOptions(today);
      } else if (type === '3') {
        this.queryForm.controls.month.setValue(today.getMonth() + 1, { emitEvent: false });
        this.queryForm.controls.CompareMonth.setValue(today.getMonth() + 1, { emitEvent: false }); // 同樣月份
      } else if (type === '4') {
        const defaultHalfYear = today.getMonth() + 1 <= 6 ? 1 : 2;
        this.queryForm.controls.halfYear.setValue(defaultHalfYear, { emitEvent: false });
        this.queryForm.controls.CompareHalfYear.setValue(defaultHalfYear, { emitEvent: false }); // 同樣半年別
      }

      // 1-2. 設定年份（確保首次初始化時設定正確的年份）
      this.queryForm.controls.year.setValue(today, { emitEvent: false });
      this.queryForm.controls.CompareYear.setValue(compareDefaultDate, { emitEvent: false });

      // 1-3. 重新計算日期（欄位標頭維持固定，不需要動態更新）
      this.calculateDateRanges(type);
    });
    // 2. 訂閱 Base 輔助欄位變化 (不變)
    this.queryForm.controls.year.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.setWeekOptions(this.queryForm.controls.year.value); // 年份變動時，更新週次選項
      this.calculateDateRanges(this.queryForm.controls.DayType.value)
    });
    this.queryForm.controls.week.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.month.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.halfYear.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));

    // 3. 訂閱 Compare 輔助欄位變化 (不變)
    this.queryForm.controls.CompareYear.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareWeek.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareMonth.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareHalfYear.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));

    // 已移除：初始化時不再自動更新 YM 欄位標頭
  }
  /**
  * 獲取當前日期是當年的第幾週 (基於 ISO 8601: 星期一為一週開始)
  */
  private getCurrentWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // 設置為星期四 (週中) 以確保計算正確的週數
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // 該年 1 月 4 日所在的星期的開始日
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // 計算週數
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  }
  /**
   * 根據年份設定週次選項 (1~53)
   * @param year Date object
   */
  setWeekOptions(year: Date | null): void {
    if (!year) return;

    // 簡化處理：這裡假設一年最大週數為 53 (實際應根據 ISO 8601 計算)
    const maxWeeks = 53;

    this.weekOptions = Array.from({ length: maxWeeks }, (_, i) => ({
      value: i + 1,
      label: `第 ${i + 1} 週`
    }));

    if (this.queryForm.controls.week.value && this.queryForm.controls.week.value > maxWeeks) {
      this.queryForm.controls.week.setValue(null, { emitEvent: false });
    }
  }
  /**
   * 根據報表類型計算基準日期和比較日期區間，並更新表單欄位。
   * 這是新的核心日期邏輯。
   * @param type 報表類型 (1:日, 2:週, 3:月, 4:半年, 5:年)
   */
  calculateDateRanges(type: string | null): void {
    if (!type) return;

    let baseRange: { from: Date, to: Date } | null = null;
    let compareRange: { from: Date, to: Date } | null = null;

    // 基準期參數
    const baseYear = this.queryForm.controls.year.value;
    const baseWeek = this.queryForm.controls.week.value;
    const baseMonth = this.queryForm.controls.month.value;
    const baseHalfYear = this.queryForm.controls.halfYear.value;

    // 比較期參數 (使用新的控制項)
    const compareYear = this.queryForm.controls.CompareYear.value;
    const compareWeek = this.queryForm.controls.CompareWeek.value;
    const compareMonth = this.queryForm.controls.CompareMonth.value;
    const compareHalfYear = this.queryForm.controls.CompareHalfYear.value;

    if (!baseYear || !compareYear) return;

    const baseYearNum = baseYear.getFullYear();
    const compareYearNum = compareYear.getFullYear();


    switch (type) {
      case '1': // 日營業報表 (固定為今日 vs 昨日，不需輔助欄位)
        {
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          baseRange = { from: today, to: today };
          compareRange = { from: yesterday, to: yesterday };
          break;
        }

      case '2': // 週營業報表
        {
          if (baseWeek) {
            baseRange = this.getWeekRange(baseYearNum, baseWeek);
          }
          // 比較期使用 CompareYear 和 CompareWeek
          if (compareWeek) {
            compareRange = this.getWeekRange(compareYearNum, compareWeek);
          }
          break;
        }

      case '3': // 月營業報表
        {
          if (baseMonth) {
            baseRange = this.getMonthRange(baseYearNum, baseMonth);
          }
          // 比較期使用 CompareYear 和 CompareMonth
          if (compareMonth) {
            compareRange = this.getMonthRange(compareYearNum, compareMonth);
          }
          break;
        }

      case '4': // 半年營業報表
        {
          if (baseHalfYear) {
            baseRange = this.getHalfYearRange(baseYearNum, baseHalfYear);
          }
          // 比較期使用 CompareYear 和 CompareHalfYear
          if (compareHalfYear) {
            compareRange = this.getHalfYearRange(compareYearNum, compareHalfYear);
          }
          break;
        }

      case '5': // 年營業報表
        baseRange = this.getYearRange(baseYearNum);
        // 比較期使用 CompareYear
        compareRange = this.getYearRange(compareYearNum);
        break;

      default:
        baseRange = null;
        compareRange = null;
        break;
    }

    // 更新表單欄位
    this.queryForm.controls.BaseDateFrom.setValue(baseRange?.from || null, { emitEvent: false });
    this.queryForm.controls.BaseDateTo.setValue(baseRange?.to || null, { emitEvent: false });
    this.queryForm.controls.CompareDateFrom.setValue(compareRange?.from || null, { emitEvent: false });
    this.queryForm.controls.CompareDateTo.setValue(compareRange?.to || null, { emitEvent: false });
  }
  /**
   * 獲取指定年、月份的日期區間
   */
  private getMonthRange(yearNum: number, month: number): { from: Date, to: Date } | null {
    if (month < 1) {
      // 獲取前一年的 12 月份
      return this.getMonthRange(yearNum - 1, 12);
    } else if (month > 12) {
      // 獲取後一年的 1 月份
      return this.getMonthRange(yearNum + 1, 1);
    }

    // 1. 起始日期 (該月 1 日) - JS Date 的月份是 0-11
    const dateFrom = new Date(yearNum, month - 1, 1);

    // 2. 結束日期 (下個月 0 日，即該月的最後一天)
    const dateTo = new Date(yearNum, month, 0);

    return { from: dateFrom, to: dateTo };
  }

  /**
    * 獲取指定年、半年別的日期區間
    */
  private getHalfYearRange(yearNum: number, halfYear: number): { from: Date, to: Date } | null {
    let dateFrom: Date;
    let dateTo: Date;

    if (halfYear === 1) {
      // 上半年 (1月1日 到 6月30日)
      dateFrom = new Date(yearNum, 0, 1); // 1月 (索引 0) 1日
      dateTo = new Date(yearNum, 6, 0); // 7月 (索引 6) 的第 0 天，即 6月30日
    } else if (halfYear === 2) {
      // 下半年 (7月1日 到 12月31日)
      dateFrom = new Date(yearNum, 6, 1); // 7月 (索引 6) 1日
      dateTo = new Date(yearNum, 12, 0); // 次年 1月 (索引 12) 的第 0 天，即 12月31日
    } else {
      return null;
    }
    return { from: dateFrom, to: dateTo };
  }

  /**
    * 獲取指定年度的日期區間 (1/1 ~ 12/31)
    */
  private getYearRange(yearNum: number): { from: Date, to: Date } | null {
    // 1. 起始日期 (該年 1 月 1 日)
    const dateFrom = new Date(yearNum, 0, 1);
    // 2. 結束日期 (次年 1 月 0 日，即該年 12 月 31 日)
    const dateTo = new Date(yearNum + 1, 0, 0);

    return { from: dateFrom, to: dateTo };
  }


  private getWeekRange(yearNum: number, week: number): { from: Date, to: Date } | null {
    if (week < 1) {
      // 若週次為 0 或負數，計算前一年的最後一週
      return this.getPreviousYearLastWeekRange(yearNum - 1);
    }

    // 1. 獲取該年 1 月 4 日，這天肯定在 ISO 週曆的第一週
    const jan4 = new Date(yearNum, 0, 4);

    // 2. 找到 Jan 4 所在的星期一 (ISO: 1=一 ~ 7=日)
    const dayOfWeek = jan4.getDay() === 0 ? 7 : jan4.getDay(); // 調整為 1=一 ~ 7=日

    // 計算該年第一週的星期一
    const firstMonday = new Date(jan4);
    firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);

    // 3. 計算目標週的起始日期 (DateFrom): 從第一週的星期一開始，加上 (week - 1) 週
    const dateFrom = new Date(firstMonday);
    dateFrom.setDate(firstMonday.getDate() + (week - 1) * 7);

    // 4. 計算目標週的結束日期 (DateTo): 在起始日期的基礎上加上 6 天
    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateFrom.getDate() + 6);

    return { from: dateFrom, to: dateTo };
  }
  /**
     * 獲取前一年最後一週的日期區間
     */
  private getPreviousYearLastWeekRange(yearNum: number): { from: Date, to: Date } | null {
    // 取得次年 1 月 4 日
    const jan4NextYear = new Date(yearNum + 1, 0, 4);
    // 找到它所在的星期一
    const dayOfWeekNextYear = jan4NextYear.getDay() === 0 ? 7 : jan4NextYear.getDay();
    const firstMondayNextYear = new Date(jan4NextYear);
    firstMondayNextYear.setDate(jan4NextYear.getDate() - dayOfWeekNextYear + 1);

    // 該年最後一週的起始日期 (前一週的星期一)
    const dateFrom = new Date(firstMondayNextYear);
    dateFrom.setDate(firstMondayNextYear.getDate() - 7);

    // 該年最後一週的結束日期 (當前年 12/31 或次年 1/1~1/3)
    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateFrom.getDate() + 6);

    return { from: dateFrom, to: dateTo };
  }
  /**
    * 初始化時設定預設月份和計算日期範圍
    * @param defaultType 預設的報表類型
    */
  calculateInitialRanges(defaultType: string): void {
    const today = new Date();
    // 基準期 Base: 今年
    this.queryForm.controls.year.setValue(today, { emitEvent: false });

    // 比較期 Compare: 預設為去年同期
    const compareDefaultDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    this.queryForm.controls.CompareYear.setValue(compareDefaultDate, { emitEvent: false });

    if (defaultType === '2') {
      const currentWeek = this.getCurrentWeekNumber(today);
      this.queryForm.controls.week.setValue(currentWeek, { emitEvent: false });
      this.queryForm.controls.CompareWeek.setValue(this.getCurrentWeekNumber(compareDefaultDate), { emitEvent: false }); // 去年同期週次
    } else if (defaultType === '3') {
      this.queryForm.controls.month.setValue(today.getMonth() + 1, { emitEvent: false });
      this.queryForm.controls.CompareMonth.setValue(today.getMonth() + 1, { emitEvent: false }); // 同樣月份
    } else if (defaultType === '4') {
      const defaultHalfYear = today.getMonth() + 1 <= 6 ? 1 : 2;
      this.queryForm.controls.halfYear.setValue(defaultHalfYear, { emitEvent: false });
      this.queryForm.controls.CompareHalfYear.setValue(defaultHalfYear, { emitEvent: false }); // 同樣半年別
    }

    this.calculateDateRanges(defaultType);
    // 初始化時：已移除欄位群組標頭自動更新的邏輯
  }
  // 已移除：updateColumnGroupHeader 方法 (不再需要)

  onSubmit(form: any): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatDate = (value: any): string | null => {
        if (!value) return null;
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      };

      const body = {
        PageSize: formValue.PageSize ?? formValue.pageSize ?? 0,
        PageIndex: formValue.PageIndex ?? formValue.pageIndex ?? 0,
        OrderBy: formValue.OrderBy ?? formValue.orderBy ?? 'ID',
        Offset: formValue.Offset ?? formValue.offset ?? 0,
        SortBy: formValue.SortBy ?? [{ field: formValue.OrderBy ?? formValue.orderBy ?? 'ID', order: 0 }],

        BaseDateFrom: formatDate(formValue.BaseDateFrom),
        BaseDateTo: formatDate(formValue.BaseDateTo),
        CompareDateFrom: formatDate(formValue.CompareDateFrom),
        CompareDateTo: formatDate(formValue.CompareDateTo),
        AmtTaxMode: formValue.AmtTaxMode ?? null,
        ReceFilter: formValue.ReceFilter ?? null,

        FloorList: formValue.FloorList ?? '',
        AreaList: formValue.AreaList ?? '',
        BusTypeList: formValue.BusTypeList ?? '',
        BusClassList: formValue.BusClassList ?? '',
        TltKindList: formValue.TltKindList ?? '',
        OrgList: formValue.OrgList ?? '',
        TltNoList: formValue.TltNoList ?? '',
        TermTypeList: formValue.TermTypeList ?? '',
        BuildingList: formValue.BuildingList ?? ''
      };

      console.log('送出的查詢 body (TLS32030)', body);

      this.tls32030Service.queryTLS32030(body).pipe(untilDestroyed(this)).subscribe({
        next: (res) => {
          this.data = res.Data || [];
          this.totalRecords = (res as any).TotalCount ?? this.data.length;
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

}
