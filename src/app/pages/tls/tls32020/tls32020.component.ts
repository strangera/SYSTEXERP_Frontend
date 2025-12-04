import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS32020Data, TLS32020QueryRequest, TLS32020Service } from '@service/api/tls/tls32020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls32020',
  templateUrl: './tls32020.component.html',
  standalone: true,
  imports: [
    ButtonModule, TableReportComponent, AsyncPipe, MenubarComponent,
    ButtonComponent, AccordionModule, ReactiveFormsModule, TranslateModule, RadiobuttonComponent,
    MultiSelectComponent, CalendarRangeQuickComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TLS32020Component extends BasicQueryPageComponent<TLS32020Data> implements OnInit {
  // 注入 Service
  private readonly dropdown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  private readonly fileExportService = inject(FileExportService);
  public readonly tls32020Service = inject(TLS32020Service);
  private readonly fb = inject(FormBuilder);
  queryForm = this.fb.group({
    // **變更**：預設為 '3' (月營業報表)
    DayType: ['3'],
    // 日期計算輔助欄位，用於週、月、半年、年報表
    year: [new Date()],
    week: [null as number | null],
    month: [null as number | null],
    halfYear: [null as number | null],

    BaseDateFrom: [null as Date | null, [Validators.required]],
    BaseDateTo: [null as Date | null, [Validators.required]],
    CompareDateFrom: [null as Date | null, [Validators.required]],
    CompareDateTo: [null as Date | null, [Validators.required]],

    // 合約查詢條件
    FloorList: [null],
    AreaList: [null],
    BuildingList: [null], // **新增**：館別
    BusTypeList: [null],
    BusClassList: [null],
    CounterKindList: [null],
    OrgList: [null],
    TalentNoList: [null],
    TermTypeList: [null],
    TaxMode: ['I'], // 是否含稅 (預設含稅)
    OwnerInvFlag: ['A'],
  });

  // 其餘屬性 (沿用 TLS32010)
  totalRecords = 0;
  historyRequestBody: TLS32020QueryRequest | null = null;
  data: TLS32020Data[] = [];
  footerData: TLS32020Data | null = null;
  subFooterData: TLS32020Data[] = []; // **新增**：用於存放期間小計資料
  btnLoading = false;

  // **變更**：移除類型 6/7，預設為 '3'
  DayTypeOptions = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' }, // 預設
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
  ];

  // 下拉選單/Radio Button 選項
  // **新增**：館別
  auditoriumOptions = this.dropdown.querySys3800();
  organizationOptions = this.dropdown.querySys3100();
  regionOptions = this.dropdown.querySys3A00();
  floorOptions = this.dropdown.querySys3900();
  businessTypeCodeOptions = this.dropdown.queryTltBusType();
  BusClassListOptions = this.dropdown.queryTltBusType();
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  // 櫃別 (假設 querySYS1000_DropDownList("TLT_Kind") 是這個)
  operationsOptions = getSYS1000Options('store_way');
  counterCodeOptions = this.dropdown.queryTltTalent();
  taxOptions = [{ value: 'I', label: '含稅' }, { value: 'N', label: '未稅' }];

  // **新增**：是否開立業主發票
  ownerInvoiceOptions = [
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

  // 報表欄位結構 (沿用 TLS32010)
  columns: ReportColumn[] = [
    {
      field: 'YM',
      header: '月份', // 預設為 '月份' (因為 DayType 預設為 3)
      format: (value) => this.formatYM(value) // **新增：動態格式化**
    },
    { field: 'BuildingName', header: '館別' },
    { field: 'BaseTarget', header: '營業目標', format: formatAmount, isSubTotal: true, groupField: 'revenue' },
    { field: 'BaseAchieveRate', header: '達成率', format: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '0%', isSubTotal: true, groupField: 'revenue' },
    { field: 'BaseSale', header: '營業實績', format: formatAmount, isSubTotal: true, groupField: 'revenue' },
    { field: 'BaseTxnCnt', header: '交易筆數', isSubTotal: true, groupField: 'atv' },
    { field: 'BaseTicket', header: '客單價', format: formatAmount, isSubTotal: true, groupField: 'atv' },
    { field: 'CompareSale', header: '營業實績', format: formatAmount, isSubTotal: true, groupField: 'popupCounter' },
    { field: 'CompareTxnCnt', header: '交易筆數', isSubTotal: true },
    { field: 'CompareTicket', header: '客單價', format: formatAmount, isSubTotal: true },
    { field: 'DiffAmt', header: '業績差異', format: formatAmount, isSubTotal: true },
    { field: 'DiffTxn', header: '交易筆數差異', isSubTotal: true },
    { field: 'DiffTicket', header: '客單價差異', format: formatAmount, isSubTotal: true },
    { field: 'GrowthRate', header: '成長率', format: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '0%', isSubTotal: true },
  ];
  columnGroup = [
    { field: 'revenue', header: '營業額' },
    { field: 'revenueRatio', header: '營業佔比' },
    { field: 'atv', header: '客單價' },
    { field: 'salesPerArea', header: '營業坪效' },
    { field: 'popupCounter', header: '臨時櫃' }
  ];


  constructor() {
    super();
  }

  ngOnInit(): void {
    // **變更**：初始化頁面 ProgNo
    this.initializePage('TLS32020');

    // 初始化週次選項
    this.setWeekOptions(this.queryForm.controls.year.value);

    // 依據預設報表類型 (月報表) 帶入日期
    this.calculateInitialRanges('3');

    // 訂閱 DayType 變化，切換時重設 year/week/month/halfYear 避免髒數據，並重新計算日期
    this.queryForm.controls.DayType.valueChanges.pipe(untilDestroyed(this)).subscribe(type => {
      // 重設日期輔助欄位，不發出事件 (emitEvent: false)
      this.queryForm.controls.week.setValue(null, { emitEvent: false });
      this.queryForm.controls.month.setValue(null, { emitEvent: false });
      this.queryForm.controls.halfYear.setValue(null, { emitEvent: false });

      // 1. 設定 year/week/month/halfYear 的預設值
      const today = new Date();
      this.queryForm.controls.year.setValue(today, { emitEvent: false }); // 總是設定當前年份

      if (type === '2') {
        const currentWeek = this.getCurrentWeekNumber(today);
        this.queryForm.controls.week.setValue(currentWeek, { emitEvent: false });
        this.setWeekOptions(today); // 確保週次選項是最新的
      } else if (type === '3') {
        this.queryForm.controls.month.setValue(today.getMonth() + 1, { emitEvent: false });
      } else if (type === '4') {
        const currentMonth = today.getMonth() + 1;
        const defaultHalfYear = currentMonth <= 6 ? 1 : 2;
        this.queryForm.controls.halfYear.setValue(defaultHalfYear, { emitEvent: false });
      }

      // 2. 觸發日期計算
      this.calculateDateRanges(type);

      // 3. 切換 DayType 時也更新欄位標頭，讓使用者在查詢前就知道標頭會變
      this.updateYMColumnHeader(type);
    });

    // 訂閱日期輔助欄位變化 (year/week/month/halfYear)
    this.queryForm.controls.year.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.calculateDateRanges(this.queryForm.controls.DayType.value);
    });
    this.queryForm.controls.week.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.calculateDateRanges(this.queryForm.controls.DayType.value);
    });
    this.queryForm.controls.month.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.calculateDateRanges(this.queryForm.controls.DayType.value);
    });
    this.queryForm.controls.halfYear.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.calculateDateRanges(this.queryForm.controls.DayType.value);
    });

    // 初始化時先設定一次正確的欄位標頭
    this.updateYMColumnHeader(this.queryForm.controls.DayType.value);
  }

  // ====================================================================
  // 新增：YM 欄位格式化相關邏輯
  // ====================================================================

  /**
   * 根據 Date 物件取得中文星期幾
   */
  private getDayOfWeekInChinese(date: Date): string {
    const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays[day];
  }

  /**
   * 根據 DayType 動態格式化 YM 欄位的內容
   * @param value 後端回傳的 YM 原始值
   */
  formatYM(value: any): string {
    if (!value) return '';
    const dayType = this.queryForm.controls.DayType.value;
    const rawValue = String(value);

    switch (dayType) {
      case '1': // 日營業報表 (YYYY-MM-DD -> YYYY/MM/DD (DayOfWeek))
        {
          // 確保日期解析正確，使用 DatePipe 轉換格式並加上中文星期
          const date = new Date(rawValue);
          if (isNaN(date.getTime())) return rawValue; // 無效日期則返回原始值

          // 格式化日期部分
          const datePart = this.datePipe.transform(date, 'yyyy/MM/dd');
          // 取得中文星期
          const dayOfWeek = this.getDayOfWeekInChinese(date);

          return `${datePart} (${dayOfWeek})`;
        }

      case '2': // 週營業報表 (YYYYWww -> YYYY 第ww週)
        // 匹配 YYYYWww
        {
          const weekMatch = rawValue.match(/^(\d{4})W(\d{1,2})$/);
          if (weekMatch) {
            return `${weekMatch[1]} 第${weekMatch[2]}週`;
          }
          return rawValue;
        }

      case '3': // 月營業報表 (YYYY-MM -> YYYY/MM)
        // 匹配 YYYY-MM 並替換分隔符
        return rawValue.replace(/-/g, '/');

      case '4': // 半年營業報表 (YYYYHh -> YYYY 上/下半年)
        // 匹配 YYYY H1 或 H2
        {
          const halfYearMatch = rawValue.match(/^(\d{4})H([12])$/);
          if (halfYearMatch) {
            const year = halfYearMatch[1];
            const half = halfYearMatch[2] === '1' ? '上半年' : '下半年';
            return `${year} ${half}`;
          }
          return rawValue;
        }

      case '5': // 年營業報表 (YYYY) - 不變
      default:
        return rawValue;
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
    const currentYear = this.queryForm.controls.year.value;

    if (!currentYear) return;

    switch (type) {
      case '1': // 日營業報表
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
          const week = this.queryForm.controls.week.value;
          if (week) {
            baseRange = this.getWeekRange(currentYear.getFullYear(), week);
            compareRange = this.getWeekRange(currentYear.getFullYear(), week - 1);
          }
          break;
        }

      case '3': // 月營業報表 (預設)
        {
          const month = this.queryForm.controls.month.value;
          if (month) {
            baseRange = this.getMonthRange(currentYear.getFullYear(), month);
            // 比較日期：上個月
            compareRange = this.getMonthRange(currentYear.getFullYear(), month - 1);
          }
          break;
        }

      case '4': // 半年營業報表
        {
          const halfYear = this.queryForm.controls.halfYear.value;
          if (halfYear) {
            baseRange = this.getHalfYearRange(currentYear.getFullYear(), halfYear);
            // 比較日期：上一個半年 (若基準是 H1，比較是前一年的 H2)
            compareRange = this.getPreviousHalfYearRange(currentYear.getFullYear(), halfYear);
          }
          break;
        }

      case '5': // 年營業報表
        baseRange = this.getYearRange(currentYear.getFullYear());
        // 比較日期：去年
        compareRange = this.getYearRange(currentYear.getFullYear() - 1);
        break;

      default:
        // 清除日期
        baseRange = null;
        compareRange = null;
        break;
    }

    // **更新表單欄位，設置 { emitEvent: false } 避免循環觸發**
    this.queryForm.controls.BaseDateFrom.setValue(baseRange?.from || null, { emitEvent: false });
    this.queryForm.controls.BaseDateTo.setValue(baseRange?.to || null, { emitEvent: false });
    this.queryForm.controls.CompareDateFrom.setValue(compareRange?.from || null, { emitEvent: false });
    this.queryForm.controls.CompareDateTo.setValue(compareRange?.to || null, { emitEvent: false });
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
   * 初始化時設定預設月份和計算日期範圍
   * @param defaultType 預設的報表類型
   */
  calculateInitialRanges(defaultType: string): void {
    const today = new Date();
    this.queryForm.controls.year.setValue(today, { emitEvent: false });

    if (defaultType === '2') {
      const currentWeek = this.getCurrentWeekNumber(today);
      this.queryForm.controls.week.setValue(currentWeek, { emitEvent: false });
    } else if (defaultType === '3') {
      this.queryForm.controls.month.setValue(today.getMonth() + 1, { emitEvent: false });
    } else if (defaultType === '4') {
      const defaultHalfYear = today.getMonth() + 1 <= 6 ? 1 : 2;
      this.queryForm.controls.halfYear.setValue(defaultHalfYear, { emitEvent: false });
    }

    this.calculateDateRanges(defaultType);
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

  // ====================================================================
  // 輔助函數：日期區間計算 (返回 { from: Date, to: Date })
  // [此區塊與前次相同，為節省篇幅省略詳細實作]
  // ====================================================================

  /**
   * 獲取指定年、週次的日期區間 (ISO: 星期一為第一天)
   */
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
   * 獲取指定年、半年別的**上一個**半年區間
   */
  private getPreviousHalfYearRange(yearNum: number, halfYear: number): { from: Date, to: Date } | null {
    let previousYearNum: number;
    let previousHalfYear: number;

    if (halfYear === 1) {
      // 基準是上半年 (H1)，比較是前一年的下半年 (H2)
      previousYearNum = yearNum - 1;
      previousHalfYear = 2;
    } else if (halfYear === 2) {
      // 基準是下半年 (H2)，比較是當年的上半年 (H1)
      previousYearNum = yearNum;
      previousHalfYear = 1;
    } else {
      return null;
    }

    return this.getHalfYearRange(previousYearNum, previousHalfYear);
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

  /**
   * 根據 DayType 動態更新 YM (日期/週別/月份/半年度/年份) 欄位標頭
   */
  private updateYMColumnHeader(dayType: string | null): void {
    if (!dayType) return;

    let newHeader = '日期區間'; // 預設值

    switch (dayType) {
      case '1': // 日營業報表
        newHeader = '日期';
        break;
      case '2': // 週營業報表
        newHeader = '週別';
        break;
      case '3': // 月營業報表
        newHeader = '月份';
        break;
      case '4': // 半年營業報表
        newHeader = '半年度';
        break;
      case '5': // 年營業報表
        newHeader = '年份';
        break;
    }

    // 找到 YM 欄位並更新標頭
    const ymColumn = this.columns.find(col => col.field === 'YM');
    if (ymColumn) {
      ymColumn.header = newHeader;
    }
  }


  // ====================================================================
  // 查詢與匯出
  // ====================================================================

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;

      // 1. 轉換多選 List 欄位為逗號分隔字串
      const convertedListBody = {
        BuildingList: this.formatListForBackend(formValue.BuildingList), // 這裡 BuildingList
        FloorList: this.formatListForBackend(formValue.FloorList),
        AreaList: this.formatListForBackend(formValue.AreaList),
        BusTypeList: this.formatListForBackend(formValue.BusTypeList),
        BusClassList: this.formatListForBackend(formValue.BusClassList),
        CounterKindList: this.formatListForBackend(formValue.CounterKindList),
        TermTypeList: this.formatListForBackend(formValue.TermTypeList),
        OrgList: this.formatListForBackend(formValue.OrgList),
        TalentNoList: this.formatListForBackend(formValue.TalentNoList),
      };

      // 2. 組裝最終傳輸給後端的 Body
      const body: TLS32020QueryRequest = {
        ...formValue,
        ...convertedListBody,
        // **變更**：覆蓋四個日期欄位格式化
        BaseDateFrom: this.datePipe.transform(formValue.BaseDateFrom, 'yyyy-MM-dd'),
        BaseDateTo: this.datePipe.transform(formValue.BaseDateTo, 'yyyy-MM-dd'),
        CompareDateFrom: this.datePipe.transform(formValue.CompareDateFrom, 'yyyy-MM-dd'),
        CompareDateTo: this.datePipe.transform(formValue.CompareDateTo, 'yyyy-MM-dd'),
        // 移除前端專用的日期計算控制項
        year: undefined,
        week: undefined,
        month: undefined,
        halfYear: undefined,
      } as TLS32020QueryRequest;

      this.tls32020Service.queryTLS32020(body).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        this.historyRequestBody = body;
        const allData = response.Data;

        // --- 數據分離與處理 (保留前次的修改) ---

        // 1. 取得總計 (假設為最後一筆)
        const grandTotal = allData.length > 0 ? allData[allData.length - 1] : null;

        // 2. 篩選出所有期間小計 (BuildingName === '小計')
        this.subFooterData = allData.filter(item => item.BuildingName === '小計');

        // 3. 取得明細數據 (排除總計和所有期間小計)
        this.data = allData
          .slice(0, allData.length - 1) // 移除最後一筆總計
          .filter(item => item.BuildingName !== '小計'); // 移除期間小計

        // 4. 設置 Footer 數據 (使用總計數據)
        if (grandTotal) {
          this.footerData = {
            ...grandTotal,
            YM: '總計',
            BuildingName: '',
          };
        } else {
          this.footerData = null;
        }

        this.totalRecords = this.data.length;

        // --- 動態更新欄位標頭 (確保提交成功後更新標頭) ---
        this.updateYMColumnHeader(formValue.DayType);

      });
    });
  }

  /**
   * 輔助函數：將陣列轉換為逗號分隔的字串
   */
  private formatListForBackend(list: any[] | null): string | null {
    if (Array.isArray(list) && list.length > 0) {
      return list.map(item => String(item)).join(',');
    }
    return null;
  }

  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    // **變更**：呼叫新的 Service 方法
    const export$ = this.tls32020Service.exportTLS32020PDF(this.historyRequestBody);

    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)),
      '.pdf',
      (isLoading) => this.btnLoading = isLoading
    );
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    // **變更**：呼叫新的 Service 方法
    const export$ = this.tls32020Service.exportTLS32020Excel(this.historyRequestBody);

    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)),
      '.xlsx',
      (isLoading) => this.btnLoading = isLoading
    );
  }
}
