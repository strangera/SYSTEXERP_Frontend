import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { applyDisplayStatusVisibility } from '@pages/tls/TLS30000/common/report-display-status.util';
import { TLS32020Data, TLS32020QueryRequest, TLS32020Service } from '@service/api/tls/tls32020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { auditTime, merge, shareReplay, take } from 'rxjs';
import { CategorySelectComponent } from 'src/app/shared/biz-components/category-select/category-select.component';

// 交易筆數/客單價/月坪效/月坪貢獻類欄位：千分位、四捨五入到整數位。
// Intl.NumberFormat 僅建立一次，避免表格每個儲存格都重新建立 locale formatter。
const INTEGER_FORMATTER = new Intl.NumberFormat('zh-TW', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const formatInt = (val: number | string): string => {
  const num = Number(val);
  if (!Number.isFinite(num)) return '0';
  return INTEGER_FORMATTER.format(Math.round(num));
};

// 週次固定為 1~53，不需每次年份變動都重新建立陣列。
const WEEK_OPTIONS = Array.from({ length: 53 }, (_, i) => ({
  value: i + 1,
  label: `第 ${i + 1} 週`
}));

@Component({
  selector: 'app-tls32020',
  templateUrl: './tls32020.component.html',
  styles: [`
    :host ::ng-deep {
      .bg-group-base {
        background-color: #e3edf4 !important;
      }
      .bg-group-compare {
        background-color: #e2f2e5 !important;
      }
      .bg-group-diff {
        background-color: #fff1e0 !important;
      }
      .p-datatable-tbody > tr:hover > td.bg-group-base {
        background-color: #d4e3ee !important;
      }
      .p-datatable-tbody > tr:hover > td.bg-group-compare {
        background-color: #d3e9d8 !important;
      }
      .p-datatable-tbody > tr:hover > td.bg-group-diff {
        background-color: #ffe6c7 !important;
      }
    }
  `],
  standalone: true,
  imports: [
    DropdownRangeComponent, CalendarComponent, DropdownComponent,
    ButtonModule, TableReportComponent, AsyncPipe, MenubarComponent,
    ButtonComponent, AccordionModule, ReactiveFormsModule, TranslateModule, RadiobuttonComponent,
    MultiSelectComponent, CalendarRangeComponent, CategorySelectComponent, CheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TLS32020Component extends BasicQueryPageComponent<TLS32020Data> implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dropdown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  private readonly fileExportService = inject(FileExportService);
  public readonly tls32020Service = inject(TLS32020Service);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  queryForm = this.fb.group({// **變更**：預設為 '3' (月營業報表)
    DayType: ['3'],
    // 日期計算輔助欄位 (基準期 Base)
    year: [new Date()],
    week: [null as number | null],
    yearTo: [new Date()], // 週/月/半年/年 區間查詢共用：迄年度
    weekTo: [null as number | null], // 週次區間查詢：迄週次
    month: [null as Date | null], // 月報表基準期：年月合一區間 picker 起
    monthTo: [null as Date | null], // 月報表基準期：年月合一區間 picker 迄
    halfYear: [null as number | null],
    halfYearTo: [null as number | null], // 半年別區間查詢：迄半年別

    // **新增**：日期計算輔助欄位 (比較期 Compare)
    CompareYear: [new Date()], // 預設與 BaseYear 相同
    CompareWeek: [null as number | null],
    CompareYearTo: [new Date()], // 週/月/半年/年 區間查詢共用：迄年度
    CompareWeekTo: [null as number | null], // 週次區間查詢：迄週次
    CompareMonth: [null as Date | null], // 月報表比較期：年月合一區間 picker 起
    CompareMonthTo: [null as Date | null], // 月報表比較期：年月合一區間 picker 迄
    CompareHalfYear: [null as number | null],
    CompareHalfYearTo: [null as number | null], // 半年別區間查詢：迄半年別

    BaseDateFrom: [null as Date | null, [Validators.required]],
    BaseDateTo: [null as Date | null, [Validators.required]],
    CompareDateFrom: [null as Date | null, [Validators.required]],
    CompareDateTo: [null as Date | null, [Validators.required]],

    // 合約查詢條件
    FloorList: [null],
    AreaList: [null],
    BuildingList: [null], // **新增**：館別
    category: [null],
    CounterKindList: [null],
    OrgList: [null],
    TalentNoList: [null],
    TermTypeList: [null],
    TaxMode: ['I'], // 是否含稅 (預設含稅)
    OwnerInvFlag: ['A'],

    PreSale: [false],
    ConsumerNum: [false],
    ShowBuilding: [false],
  });

  // 其餘屬性 (沿用 TLS32020)
  totalRecords = 0;
  historyRequestBody: TLS32020QueryRequest | null = null;
  data: TLS32020Data[] = [];
  footerData: TLS32020Data | null = null;
  subFooterData: TLS32020Data[] = []; // **新增**：用於存放期間小計資料
  pdfBtnLoading = false;
  excelBtnLoading = false;

  // 大量報表資料採漸進式掛載，避免 API 回傳後一次建立數萬個 table cell 而卡住主執行緒。
  private readonly RENDER_BATCH_SIZE = 100;
  private progressiveRenderToken = 0;
  isPreSale = this.queryForm.get('PreSale')?.value ?? false;
  isConsumerNum = this.queryForm.get('ConsumerNum')?.value ?? false;
  isShowBuilding = this.queryForm.get('ShowBuilding')?.value ?? true;

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
  auditoriumOptions = this.dropdown.querySys3800().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  organizationOptions = this.dropdown.querySys3100();
  regionOptions = this.dropdown.querySys3A00();
  floorOptions = this.dropdown.querySys3900();
  businessTypeCodeOptions = this.dropdown.queryTltBusType();
  BusClassListOptions = this.dropdown.queryTltBusType();
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  // 櫃別 (假設 querySYS1000_DropDownList("TLT_Kind") 是這個)
  operationsOptions = getSYS1000Options('TLT_Kind');
  counterCodeOptions = this.dropdown.queryTltTalent();
  taxOptions = [{ value: 'I', label: '含稅' }, { value: 'N', label: '未稅' }];

  // **新增**：是否開立業主發票
  ownerInvoiceOptions = [
    { value: 'A', label: '全部' },
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  weekOptions: { value: number, label: string }[] = WEEK_OPTIONS;
  halfYearOptions = [
    { value: 1, label: '上半年' }, // 1: 上半年 (1/1 ~ 6/30)
    { value: 2, label: '下半年' } // 2: 下半年 (7/1 ~ 12/31)
  ];

  // 總計列(footerData)的坪數/坪效/坪貢獻不顯示，與匯出一致；小計列與明細列照常格式化
  private readonly blankInGrandTotal = (fmt: (value: number) => string) =>
    (value: number, _rowIndex?: number, row?: unknown): string => row === this.footerData ? '' : fmt(value);

  // 報表欄位結構 (已補齊 BasePyeff/PyContrib, ComparePyeff/PyContrib)
  // 表頭三層群組：topGroupField (基準期/比較期/差異) > groupField (營業額/客單價/坪效/預售消費) > 個別欄位
  columns: ReportColumn[] = [
    { field: 'YM', header: '月份', align: 'left' }, // 描述性日期文字
    { field: 'BuildingName', header: '館別', align: 'left', visible: this.isShowBuilding },

    // ======================= 比較期 (Compare) 欄位 =======================
    { field: 'CompareTarget', header: '營業目標', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'compareRevenue', topGroupField: 'compare' },
    { field: 'CompareSale', header: '營業實績', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'compareRevenue', topGroupField: 'compare' },
    { field: 'CompareAchieveRate', header: '達成率', align: 'right', format: (value: number) => `${((value ?? 0) * 100).toFixed(1)}%`, isSubTotal: true, groupField: 'compareRevenue', topGroupField: 'compare' },
    { field: 'CompareTxnCnt', header: '交易筆數', align: 'right', format: formatInt, isSubTotal: true, groupField: 'compareATV', topGroupField: 'compare' },
    { field: 'CompareTicket', header: '客單價', align: 'right', format: formatInt, isSubTotal: true, groupField: 'compareATV', topGroupField: 'compare' },
    { field: 'CompareTltSpace', header: '坪數', align: 'right', format: this.blankInGrandTotal((value: number) => formatAmountWithDecimals(value, 2)), isSubTotal: true, groupField: 'compareSalesPerArea', topGroupField: 'compare' },
    { field: 'ComparePyeff', header: this.queryForm.controls.DayType.value === '1' ? '日坪效' : '月坪效', align: 'right', format: this.blankInGrandTotal(formatInt), isSubTotal: true, groupField: 'compareSalesPerArea', topGroupField: 'compare' },
    { field: 'ComparePyContrib', header: this.queryForm.controls.DayType.value === '1' ? '日坪貢獻' : '月坪貢獻', align: 'right', format: this.blankInGrandTotal(formatInt), isSubTotal: true, groupField: 'compareSalesPerArea', topGroupField: 'compare' },
    { field: 'Comp_PrePerformance', header: '預售實績', visible: this.isPreSale, align: 'right', format: formatAmount, isSubTotal: true, groupField: 'comparePreSaleConsumer', topGroupField: 'compare' },
    { field: 'Comp_ConsumerNum', header: '消費人數', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'comparePreSaleConsumer', topGroupField: 'compare' },
    { field: 'Comp_ConsumerOrder', header: '消費客單', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'comparePreSaleConsumer', topGroupField: 'compare' },
    { field: 'CompareMonthTarget', header: '月營業目標', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'compareMonth', topGroupField: 'compare' },
    { field: 'CompareMonthSale', header: '營業實績', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'compareMonth', topGroupField: 'compare' },
    { field: 'CompareMonthAchieveRate', header: '完成率', align: 'right', format: (value: number) => `${((value ?? 0) * 100).toFixed(1)}%`, isSubTotal: true, groupField: 'compareMonth', topGroupField: 'compare' },
    // ======================= 基準期 (Base) 欄位 =======================
    { field: 'BaseTarget', header: '營業目標', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'revenue', topGroupField: 'base' },
    { field: 'BaseSale', header: '營業實績', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'revenue', topGroupField: 'base' },
    { field: 'BaseAchieveRate', header: '達成率', align: 'right', format: (value: number) => `${((value ?? 0) * 100).toFixed(1)}%`, isSubTotal: true, groupField: 'revenue', topGroupField: 'base' },
    { field: 'BaseTxnCnt', header: '交易筆數', align: 'right', format: formatInt, isSubTotal: true, groupField: 'atv', topGroupField: 'base' },
    { field: 'BaseTicket', header: '客單價', align: 'right', format: formatInt, isSubTotal: true, groupField: 'atv', topGroupField: 'base' },
    { field: 'BaseTltSpace', header: '坪數', align: 'right', format: this.blankInGrandTotal((value: number) => formatAmountWithDecimals(value, 2)), isSubTotal: true, groupField: 'salesPerArea', topGroupField: 'base' },
    { field: 'BasePyeff', header: this.queryForm.controls.DayType.value === '1' ? '日坪效' : '月坪效', align: 'right', format: this.blankInGrandTotal(formatInt), isSubTotal: true, groupField: 'salesPerArea', topGroupField: 'base' },
    { field: 'BasePyContrib', header: this.queryForm.controls.DayType.value === '1' ? '日坪貢獻' : '月坪貢獻', align: 'right', format: this.blankInGrandTotal(formatInt), isSubTotal: true, groupField: 'salesPerArea', topGroupField: 'base' },
    { field: 'Base_PrePerformance', header: '預售實績', visible: this.isPreSale, align: 'right', format: formatAmount, isSubTotal: true, groupField: 'preSaleConsumer', topGroupField: 'base' },
    { field: 'Base_ConsumerNum', header: '消費人數', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'preSaleConsumer', topGroupField: 'base' },
    { field: 'Base_ConsumerOrder', header: '消費客單', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'preSaleConsumer', topGroupField: 'base' },

    // ======================= 差異 (Difference) 欄位 =======================
    { field: 'DiffAmt', header: '業績差異', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'diffRevenue', topGroupField: 'diff' },
    { field: 'GrowthRate', header: '成長率', align: 'right', format: (value: number) => `${((value ?? 0) * 100).toFixed(1)}%`, isSubTotal: true, groupField: 'diffRevenue', topGroupField: 'diff' },
    { field: 'DiffTxn', header: '交易筆數差異', align: 'right', format: formatInt, isSubTotal: true, groupField: 'diffATV', topGroupField: 'diff' },
    { field: 'DiffTicket', header: '客單價差異', align: 'right', format: formatInt, isSubTotal: true, groupField: 'diffATV', topGroupField: 'diff' },
    { field: 'DiffSquare', header: '坪數差異', align: 'right', format: this.blankInGrandTotal((value: number) => formatAmountWithDecimals(value, 2)), isSubTotal: true, groupField: 'diffSalesPerArea', topGroupField: 'diff' },
    { field: 'DiffPyeff', header: this.queryForm.controls.DayType.value === '1' ? '日坪效差異' : '月坪效差異', align: 'right', format: this.blankInGrandTotal(formatInt), isSubTotal: true, groupField: 'diffSalesPerArea', topGroupField: 'diff' },
    { field: 'DiffPyContrib', header: this.queryForm.controls.DayType.value === '1' ? '日坪貢獻差異' : '月坪貢獻差異', align: 'right', format: this.blankInGrandTotal(formatInt), isSubTotal: true, groupField: 'diffSalesPerArea', topGroupField: 'diff' },
    { field: 'Diff_PrePerformance', header: '預售實績差異', visible: this.isPreSale, align: 'right', format: formatAmount, isSubTotal: true, groupField: 'diffPreSaleConsumer', topGroupField: 'diff' },
    { field: 'Diff_ConsumerNum', header: '消費人數差異', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'diffPreSaleConsumer', topGroupField: 'diff' },
    { field: 'Diff_ConsumerOrder', header: '消費客單差異', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'diffPreSaleConsumer', topGroupField: 'diff' },

    //先拿掉 { field: 'BasePreOrderAmt', header: '預售業績', visible: this.isPreSale, format: formatAmount, align: 'right', isSubTotal: true },
  ];
  // 報表分組標頭 (第二層，配合新增的欄位進行調整)
  columnGroup = [
    { field: 'compareRevenue', header: 'XXXX 營業額' },
    { field: 'compareATV', header: 'XXXX 客單價' },
    { field: 'compareSalesPerArea', header: 'XXXX 營業坪效' },
    { field: 'compareMonth', header: '月累計' },
    { field: 'comparePreSaleConsumer', header: 'XXXX 預售/消費' }, // <--- 比較期群組
    { field: 'revenue', header: 'YYYY 營業額' },
    { field: 'atv', header: 'YYYY 客單價' },
    { field: 'salesPerArea', header: 'YYYY 營業坪效' },
    { field: 'preSaleConsumer', header: 'YYYY 預售/消費' }, // <--- 基準期群組
    { field: 'diffRevenue', header: '營業額差異' },
    { field: 'diffATV', header: '客單/交易差異' },
    { field: 'diffSalesPerArea', header: '營業坪效差異' },
    { field: 'diffPreSaleConsumer', header: '預售/消費差異' },
  ];
  // 報表最外層分組標頭 (第一層)：欄位呈現順序為 compare(比較期) > base(基準期) > diff(差異)，base 欄位群組顯示「基準期」、compare 欄位群組顯示「比較期」，語意對齊查詢區塊「基準/比較資料查詢條件」
  columnTopGroup = [
    { field: 'compare', header: '比較期' },
    { field: 'base', header: '基準期' },
    { field: 'diff', header: '差異' },
  ];

  ngOnInit(): void {
    this.initializePage('TLS32020');

    // 底色依「頂層分組」(基準期/比較期/差異) 套用。
    // 僅初始化一次 cellClass，避免後續重複建立函式。
    this.columns = this.columns.map((col): ReportColumn => ({
      ...col,
      cellClass: () => {
        switch (col.topGroupField) {
          case 'base': return 'bg-group-base';
          case 'compare': return 'bg-group-compare';
          case 'diff': return 'bg-group-diff';
          default: return '';
        }
      },
    }));

    // 初始化只執行一次，避免 startWith + calculateInitialRanges 造成重複計算。
    this.calculateInitialRanges('3');
    this.updateYMColumnHeader(this.queryForm.controls.DayType.value);
    this.updatePyeffContribColumnHeader(this.queryForm.controls.DayType.value);
    this.updateMonthCumulativeColumnVisibility(this.queryForm.controls.DayType.value);

    this.bindDayTypeChanges();
    this.bindDateRangeChanges();
    this.bindDisplayOptionChanges();
    this.bindActualDateHeaderChanges();
  }

  /**
   * 報表類型切換：重設該類型需要的輔助欄位，再重新計算日期。
   * 保留原本切換 DayType 時自動回到「今年 / 去年同期」的邏輯。
   */
  private bindDayTypeChanges(): void {
    this.queryForm.controls.DayType.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(type => this.resetRangeByDayType(type));
  }

  private resetRangeByDayType(type: string | null): void {
    if (!type) return;

    const today = new Date();
    const compareDefaultDate = new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate()
    );

    // 一次 patchValue 完成所有清除與年度預設，且不觸發其他 valueChanges。
    this.queryForm.patchValue({
      year: today,
      yearTo: today,
      week: null,
      weekTo: null,
      month: null,
      monthTo: null,
      halfYear: null,
      halfYearTo: null,

      CompareYear: compareDefaultDate,
      CompareYearTo: compareDefaultDate,
      CompareWeek: null,
      CompareWeekTo: null,
      CompareMonth: null,
      CompareMonthTo: null,
      CompareHalfYear: null,
      CompareHalfYearTo: null,
    }, { emitEvent: false });

    if (type === '2') {
      const currentWeek = this.getCurrentWeekNumber(today);
      const compareWeek = this.getCurrentWeekNumber(compareDefaultDate);

      this.queryForm.patchValue({
        week: currentWeek,
        weekTo: currentWeek,
        CompareWeek: compareWeek,
        CompareWeekTo: compareWeek,
      }, { emitEvent: false });
    } else if (type === '3') {
      this.queryForm.patchValue({
        month: today,
        monthTo: today,
        CompareMonth: compareDefaultDate,
        CompareMonthTo: compareDefaultDate,
      }, { emitEvent: false });
    } else if (type === '4') {
      const defaultHalfYear = today.getMonth() + 1 <= 6 ? 1 : 2;

      this.queryForm.patchValue({
        halfYear: defaultHalfYear,
        halfYearTo: defaultHalfYear,
        CompareHalfYear: defaultHalfYear,
        CompareHalfYearTo: defaultHalfYear,
      }, { emitEvent: false });
    }

    this.calculateDateRanges(type);
    this.updateYMColumnHeader(type);
    this.updatePyeffContribColumnHeader(type);
    this.updateMonthCumulativeColumnVisibility(type);
  }

  /**
   * 將原本十多個日期欄位 subscription 合併成單一日期重算入口。
   * auditTime(0) 可合併同一事件循環內的連續變更，避免重複計算。
   */
  private bindDateRangeChanges(): void {
    merge(
      this.queryForm.controls.year.valueChanges,
      this.queryForm.controls.week.valueChanges,
      this.queryForm.controls.yearTo.valueChanges,
      this.queryForm.controls.weekTo.valueChanges,
      this.queryForm.controls.month.valueChanges,
      this.queryForm.controls.monthTo.valueChanges,
      this.queryForm.controls.halfYear.valueChanges,
      this.queryForm.controls.halfYearTo.valueChanges,
      this.queryForm.controls.CompareYear.valueChanges,
      this.queryForm.controls.CompareWeek.valueChanges,
      this.queryForm.controls.CompareYearTo.valueChanges,
      this.queryForm.controls.CompareWeekTo.valueChanges,
      this.queryForm.controls.CompareMonth.valueChanges,
      this.queryForm.controls.CompareMonthTo.valueChanges,
      this.queryForm.controls.CompareHalfYear.valueChanges,
      this.queryForm.controls.CompareHalfYearTo.valueChanges,
    ).pipe(
      auditTime(0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.calculateDateRanges(this.queryForm.controls.DayType.value);
    });
  }

  /**
   * 顯示欄位相關 checkbox 共用同一個 subscription。
   */
  private bindDisplayOptionChanges(): void {
    merge(
      this.queryForm.controls.PreSale.valueChanges,
      this.queryForm.controls.ConsumerNum.valueChanges,
      this.queryForm.controls.ShowBuilding.valueChanges,
    ).pipe(
      auditTime(0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.setColumns();
      this.updateHistoryRequestBody();
    });
  }

  /**
   * 使用者直接操作實際 DatePicker（起日或迄日任一變動）時刷新年度群組 Header。
   */
  private bindActualDateHeaderChanges(): void {
    merge(
      this.queryForm.controls.BaseDateFrom.valueChanges,
      this.queryForm.controls.BaseDateTo.valueChanges,
      this.queryForm.controls.CompareDateFrom.valueChanges,
      this.queryForm.controls.CompareDateTo.valueChanges,
    ).pipe(
      auditTime(0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.refreshHeadersFromActualDates();
    });
  }

  /**
   * 直接從實際查詢的 DatePicker 欄位取出年份並刷新 Header
   */
  private refreshHeadersFromActualDates(): void {
    const baseFrom = this.queryForm.controls.BaseDateFrom.value;
    const baseTo = this.queryForm.controls.BaseDateTo.value;
    const compareFrom = this.queryForm.controls.CompareDateFrom.value;
    const compareTo = this.queryForm.controls.CompareDateTo.value;

    const parseYear = (val: any): number | undefined => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d.getFullYear();
    };

    const baseYear = parseYear(baseFrom) ?? new Date().getFullYear();
    const compareYear = parseYear(compareFrom) ?? (baseYear - 1);
    const baseYearTo = parseYear(baseTo) ?? baseYear;
    const compareYearTo = parseYear(compareTo) ?? compareYear;

    this.updateColumnGroupHeader(baseYear, compareYear, baseYearTo, compareYearTo);
  }
  /**
 * 根據實際選擇的起訖年度動態更新欄位群組標頭 (YYYY/XXXX)
 */
  private updateColumnGroupHeader(
    baseYearNum: number,
    compareYearNum: number,
    baseYearToNum?: number,
    compareYearToNum?: number
  ): void {
    const baseYearStr = (baseYearToNum && baseYearToNum !== baseYearNum)
      ? `${baseYearNum}~${baseYearToNum}年`
      : `${baseYearNum}年`;

    const compareYearStr = (compareYearToNum && compareYearToNum !== compareYearNum)
      ? `${compareYearNum}~${compareYearToNum}年`
      : `${compareYearNum}年`;

    // 重新指派 Array reference 以確保 OnPush 變更偵測生效
    this.columnGroup = this.columnGroup.map(group => {
      if (group.field.startsWith('diff')) {
        return group; // 差異群組標頭固定文字，不隨基準/比較年度變動
      }
      if (group.field === 'compareMonth') {
        return { ...group, header: `${compareYearStr} 月累計` };
      }
      const newHeader = this.getOriginHeader(group.field);
      if (group.field.startsWith('compare') || group.field.startsWith('Comp')) {
        return { ...group, header: `${compareYearStr} ${newHeader}` };
      }
      return { ...group, header: `${baseYearStr} ${newHeader}` };
    });
    this.cdr.markForCheck();
  }
  // 輔助方法：保持標頭後半段字串一致
  private getOriginHeader(field: string): string {
    const lowerField = field.toLowerCase();
    if (lowerField.includes('revenue')) return '營業額';
    if (lowerField.includes('atv')) return '客單價';
    if (lowerField.includes('salesperarea')) return '營業坪效';
    if (lowerField.includes('presaleconsumer')) return '預售/消費';
    return '';
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
    const baseYearTo = this.queryForm.controls.yearTo.value;
    const baseWeekTo = this.queryForm.controls.weekTo.value;
    const baseMonth = this.queryForm.controls.month.value;
    const baseMonthTo = this.queryForm.controls.monthTo.value;
    const baseHalfYear = this.queryForm.controls.halfYear.value;
    const baseHalfYearTo = this.queryForm.controls.halfYearTo.value;

    // 比較期參數
    const compareYear = this.queryForm.controls.CompareYear.value;
    const compareWeek = this.queryForm.controls.CompareWeek.value;
    const compareYearTo = this.queryForm.controls.CompareYearTo.value;
    const compareWeekTo = this.queryForm.controls.CompareWeekTo.value;
    const compareMonth = this.queryForm.controls.CompareMonth.value;
    const compareMonthTo = this.queryForm.controls.CompareMonthTo.value;
    const compareHalfYear = this.queryForm.controls.CompareHalfYear.value;
    const compareHalfYearTo = this.queryForm.controls.CompareHalfYearTo.value;

    if (!baseYear || !compareYear) return;

    const baseYearNum = baseYear.getFullYear();
    const compareYearNum = compareYear.getFullYear();
    const baseYearToNum = baseYearTo ? baseYearTo.getFullYear() : baseYearNum;
    const compareYearToNum = compareYearTo ? compareYearTo.getFullYear() : compareYearNum;

    // 週次/半年別是獨立的「年」+「期別」元件（非合一 picker），跨年度起訖比較要另外手動驗證。
    this.validateWeekRange();
    this.validateHalfYearRange();

    switch (type) {
      case '1': // 日營業報表 (預設當天 vs 昨天)
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
            const baseFromRange = this.getWeekRange(baseYearNum, baseWeek);
            const baseToRange = baseWeekTo ? this.getWeekRange(baseYearToNum, baseWeekTo) : baseFromRange;
            if (baseFromRange && baseToRange) baseRange = { from: baseFromRange.from, to: baseToRange.to };
          }
          if (compareWeek) {
            const compareFromRange = this.getWeekRange(compareYearNum, compareWeek);
            const compareToRange = compareWeekTo ? this.getWeekRange(compareYearToNum, compareWeekTo) : compareFromRange;
            if (compareFromRange && compareToRange) compareRange = { from: compareFromRange.from, to: compareToRange.to };
          }
          break;
        }
      case '3': // 月營業報表（年月合一區間 picker，起訖各自帶自己的年度，天生涵蓋跨年）
        {
          if (baseMonth) {
            const baseFromRange = this.getMonthRange(baseMonth.getFullYear(), baseMonth.getMonth() + 1);
            const baseToRange = baseMonthTo ? this.getMonthRange(baseMonthTo.getFullYear(), baseMonthTo.getMonth() + 1) : baseFromRange;
            if (baseFromRange && baseToRange) baseRange = { from: baseFromRange.from, to: baseToRange.to };
          }
          if (compareMonth) {
            const compareFromRange = this.getMonthRange(compareMonth.getFullYear(), compareMonth.getMonth() + 1);
            const compareToRange = compareMonthTo ? this.getMonthRange(compareMonthTo.getFullYear(), compareMonthTo.getMonth() + 1) : compareFromRange;
            if (compareFromRange && compareToRange) compareRange = { from: compareFromRange.from, to: compareToRange.to };
          }
          break;
        }
      case '4': // 半年營業報表
        {
          if (baseHalfYear) {
            const baseFromRange = this.getHalfYearRange(baseYearNum, baseHalfYear);
            const baseToRange = baseHalfYearTo ? this.getHalfYearRange(baseYearToNum, baseHalfYearTo) : baseFromRange;
            if (baseFromRange && baseToRange) baseRange = { from: baseFromRange.from, to: baseToRange.to };
          }
          if (compareHalfYear) {
            const compareFromRange = this.getHalfYearRange(compareYearNum, compareHalfYear);
            const compareToRange = compareHalfYearTo ? this.getHalfYearRange(compareYearToNum, compareHalfYearTo) : compareFromRange;
            if (compareFromRange && compareToRange) compareRange = { from: compareFromRange.from, to: compareToRange.to };
          }
          break;
        }
      case '5': // 年營業報表
        {
          const baseFromRange = this.getYearRange(baseYearNum);
          const baseToRange = this.getYearRange(baseYearToNum);
          if (baseFromRange && baseToRange) baseRange = { from: baseFromRange.from, to: baseToRange.to };

          const compareFromRange = this.getYearRange(compareYearNum);
          const compareToRange = this.getYearRange(compareYearToNum);
          if (compareFromRange && compareToRange) compareRange = { from: compareFromRange.from, to: compareToRange.to };
          break;
        }
      default:
        baseRange = null;
        compareRange = null;
        break;
    }

    this.queryForm.patchValue({
      BaseDateFrom: baseRange?.from || null,
      BaseDateTo: baseRange?.to || null,
      CompareDateFrom: compareRange?.from || null,
      CompareDateTo: compareRange?.to || null
    }, { emitEvent: false });

    // 傳入完整的起訖年度進行 Header 更新
    this.updateColumnGroupHeader(
      baseRange?.from ? baseRange.from.getFullYear() : baseYearNum,
      compareRange?.from ? compareRange.from.getFullYear() : compareYearNum,
      baseRange?.to ? baseRange.to.getFullYear() : baseYearToNum,
      compareRange?.to ? compareRange.to.getFullYear() : compareYearToNum
    );
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
    // 基準期 Base: 今年
    this.queryForm.controls.year.setValue(today, { emitEvent: false });
    this.queryForm.controls.yearTo.setValue(today, { emitEvent: false });

    // 比較期 Compare: 預設為去年同期
    const compareDefaultDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    this.queryForm.controls.CompareYear.setValue(compareDefaultDate, { emitEvent: false });
    this.queryForm.controls.CompareYearTo.setValue(compareDefaultDate, { emitEvent: false });

    if (defaultType === '2') {
      const currentWeek = this.getCurrentWeekNumber(today);
      const compareWeek = this.getCurrentWeekNumber(compareDefaultDate);
      this.queryForm.controls.week.setValue(currentWeek, { emitEvent: false });
      this.queryForm.controls.weekTo.setValue(currentWeek, { emitEvent: false });
      this.queryForm.controls.CompareWeek.setValue(compareWeek, { emitEvent: false }); // 去年同期週次
      this.queryForm.controls.CompareWeekTo.setValue(compareWeek, { emitEvent: false });
    } else if (defaultType === '3') {
      this.queryForm.controls.month.setValue(today, { emitEvent: false });
      this.queryForm.controls.monthTo.setValue(today, { emitEvent: false });
      this.queryForm.controls.CompareMonth.setValue(compareDefaultDate, { emitEvent: false }); // 去年同期
      this.queryForm.controls.CompareMonthTo.setValue(compareDefaultDate, { emitEvent: false });
    } else if (defaultType === '4') {
      const defaultHalfYear = today.getMonth() + 1 <= 6 ? 1 : 2;
      this.queryForm.controls.halfYear.setValue(defaultHalfYear, { emitEvent: false });
      this.queryForm.controls.halfYearTo.setValue(defaultHalfYear, { emitEvent: false });
      this.queryForm.controls.CompareHalfYear.setValue(defaultHalfYear, { emitEvent: false }); // 同樣半年別
      this.queryForm.controls.CompareHalfYearTo.setValue(defaultHalfYear, { emitEvent: false });
    }

    // calculateDateRanges 內部已同步更新 ColumnGroup Header，不再重複刷新。
    this.calculateDateRanges(defaultType);
  }

  // ====================================================================
  // 輔助函數：週次/半年別跨年度區間驗證
  // 週次、半年別是獨立的「年」元件 + 「期別」元件（非年月合一 picker），
  // 沒有共用元件可以直接比較日期物件，改成手動組「年度*倍數+期別」複合值比較，
  // 錯誤直接設在對應的期別 FormControl 上（沿用既有的 textRange 錯誤訊息）。
  // ====================================================================

  /**
   * 判斷「年+期別」起 > 迄 是否成立。任一邊缺值視為合法（必填由 Validators.required 負責）。
   */
  private isYearPeriodRangeInvalid(
    yearFrom: Date | null,
    periodFrom: number | null,
    yearTo: Date | null,
    periodTo: number | null,
    multiplier: number
  ): boolean {
    if (!yearFrom || periodFrom === null || periodFrom === undefined ||
      !yearTo || periodTo === null || periodTo === undefined) {
      return false;
    }
    const fromComposite = yearFrom.getFullYear() * multiplier + periodFrom;
    const toComposite = yearTo.getFullYear() * multiplier + periodTo;
    return fromComposite > toComposite;
  }

  /** 依驗證結果，在指定的期別 FormControl 上設定/清除 textRange 錯誤。 */
  private applyRangeError(control: FormControl<number | null>, isInvalid: boolean): void {
    const errors = control.errors || {};
    if (isInvalid) {
      control.setErrors({ ...errors, textRange: true });
      return;
    }
    if (errors['textRange']) {
      delete errors['textRange'];
    }
    control.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  /** 週次區間驗證：週次 1~53 遠小於 100，「年度*100+週次」複合值不會互相干擾排序。 */
  private validateWeekRange(): void {
    const c = this.queryForm.controls;
    this.applyRangeError(c.week, this.isYearPeriodRangeInvalid(c.year.value, c.week.value, c.yearTo.value, c.weekTo.value, 100));
    this.applyRangeError(c.CompareWeek, this.isYearPeriodRangeInvalid(c.CompareYear.value, c.CompareWeek.value, c.CompareYearTo.value, c.CompareWeekTo.value, 100));
  }

  /** 半年別區間驗證：半年別只有 1/2，「年度*10+半年別」複合值即可正確排序。 */
  private validateHalfYearRange(): void {
    const c = this.queryForm.controls;
    this.applyRangeError(c.halfYear, this.isYearPeriodRangeInvalid(c.year.value, c.halfYear.value, c.yearTo.value, c.halfYearTo.value, 10));
    this.applyRangeError(c.CompareHalfYear, this.isYearPeriodRangeInvalid(c.CompareYear.value, c.CompareHalfYear.value, c.CompareYearTo.value, c.CompareHalfYearTo.value, 10));
  }

  // ====================================================================
  // 輔助函數：日期區間計算
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
    * 獲取指定年度的日期區間 (1/1 ~ 12/31)
    */
  private getYearRange(yearNum: number): { from: Date, to: Date } | null {
    // 1. 起始日期 (該年 1 月 1 日)
    const dateFrom = new Date(yearNum, 0, 1);
    // 2. 結束日期 (次年 1 月 0 日，即該年 12 月 31 日)
    const dateTo = new Date(yearNum + 1, 0, 0);

    return { from: dateFrom, to: dateTo };
  }

  private updateYMColumnHeader(dayType: string | null): void {
    if (!dayType) return;
    const headerMap: Record<string, string> = {
      '1': '日期',
      '2': '週別',
      '3': '月份',
      '4': '半年度',
      '5': '年份'
    };

    const newHeader = headerMap[dayType] || '日期區間';

    // 產生新的陣列 Reference
    this.columns = this.columns.map(col =>
      col.field === 'YM' ? { ...col, header: newHeader } : col
    );
  }


  /**
   * 依 DayType 動態更新「坪效 / 坪貢獻」欄位 Header。
   * DayType = 1：顯示日坪效 / 日坪貢獻。
   * 其他 DayType：顯示月坪效 / 月坪貢獻。
   */
  private updatePyeffContribColumnHeader(dayType: string | null): void {
    if (!dayType) return;

    const isDaily = dayType === '1';

    this.columns = this.columns.map(col => {
      switch (col.field) {
        // 比較期
        case 'ComparePyeff':
          return { ...col, header: isDaily ? '日坪效' : '月坪效' };

        case 'ComparePyContrib':
          return { ...col, header: isDaily ? '日坪貢獻' : '月坪貢獻' };

        // 基準期
        case 'BasePyeff':
          return { ...col, header: isDaily ? '日坪效' : '月坪效' };

        case 'BasePyContrib':
          return { ...col, header: isDaily ? '日坪貢獻' : '月坪貢獻' };

        // 差異
        case 'DiffPyeff':
          return { ...col, header: isDaily ? '日坪效差異' : '月坪效差異' };

        case 'DiffPyContrib':
          return { ...col, header: isDaily ? '日坪貢獻差異' : '月坪貢獻差異' };

        default:
          return col;
      }
    });

    // OnPush 模式下通知畫面更新
    this.cdr.markForCheck();
  }


  /** 月累計三欄（月營業目標/營業實績/完成率）僅日營業報表(DayType=1)顯示，隨報表類型選項即時切換。 */
  private updateMonthCumulativeColumnVisibility(dayType: string | null): void {
    if (!dayType) return;

    const isDaily = dayType === '1';
    const monthFields = ['CompareMonthTarget', 'CompareMonthSale', 'CompareMonthAchieveRate'];

    this.columns = this.columns.map(col =>
      monthFields.includes(col.field) ? { ...col, visible: isDaily } : col
    );
    this.cdr.markForCheck();
  }

  // ====================================================================
  // 查詢與匯出
  // ====================================================================

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.auditoriumOptions.pipe(take(1)).subscribe(buildingOptions => {
        const formValue = frm.value;
        const cat = formValue.category || { bus_type: [], bus_class: [], bus_sclass: [] };
        const hasBuildingSelection = Array.isArray(formValue.BuildingList) && formValue.BuildingList.length > 0;
        const allBuildingNos = (buildingOptions ?? []).map(o => o.No);

        // 2. 組裝最終傳輸給後端的 Body
        const body: TLS32020QueryRequest = {
          ...formValue,
          BuildingList: formValue.ShowBuilding === false ? null : (hasBuildingSelection ? formValue.BuildingList : allBuildingNos),
          FloorList: formValue.FloorList || null,
          AreaList: formValue.AreaList || null,
          CounterKindList: formValue.CounterKindList || null,
          TermTypeList: formValue.TermTypeList || null,
          OrgList: formValue.OrgList || null,
          TalentNoList: formValue.TalentNoList || null,
          BusTypeList: cat.bus_type || null,
          BusClassList: cat.bus_class?.map((c: any) => [c.bus_type, c.No]) || null,
          BusSClassList: cat.bus_sclass?.map((s: any) => [s.bus_type, s.bus_class, s.No]) || null,
          BaseDateFrom: this.datePipe.transform(formValue.BaseDateFrom, 'yyyy-MM-dd'),
          BaseDateTo: this.datePipe.transform(formValue.BaseDateTo, 'yyyy-MM-dd'),
          CompareDateFrom: this.datePipe.transform(formValue.CompareDateFrom, 'yyyy-MM-dd'),
          CompareDateTo: this.datePipe.transform(formValue.CompareDateTo, 'yyyy-MM-dd'),
          year: undefined,
          week: undefined,
          yearTo: undefined,
          weekTo: undefined,
          month: undefined,
          monthTo: undefined,
          halfYear: undefined,
          halfYearTo: undefined,
          category: undefined
        } as TLS32020QueryRequest;

        this.tls32020Service.queryTLS32020(body).pipe(
          this.withLoading(),
          takeUntilDestroyed(this.destroyRef),
        ).subscribe(response => {
          this.historyRequestBody = body;
          const allData = response.Data;

          // --- 數據分離與處理 ---
          // 1. 取得總計 (最後一筆)
          const grandTotal = allData.length > 0 ? allData[allData.length - 1] : null;

          // 2. 依據 ShowBuilding 判斷是否需要處理「期間小計」
          const isShowBuilding = formValue.ShowBuilding !== false;

          // 先排除最後一筆總計；館別模式下再用單次迴圈分離明細與小計。
          const rows = grandTotal ? allData.slice(0, -1) : allData;

          let detailRows: TLS32020Data[];

          if (isShowBuilding) {
            detailRows = [];
            const subtotalRows: TLS32020Data[] = [];

            for (const item of rows) {
              if (item.BuildingName === '小計') {
                subtotalRows.push(item);
              } else {
                detailRows.push(item);
              }
            }

            this.subFooterData = subtotalRows;
          } else {
            this.subFooterData = [];
            detailRows = rows;
          }

          // totalRecords 必須使用完整明細筆數，不能使用目前已 render 的 data.length。
          this.totalRecords = detailRows.length;

          // API 資料已到齊後，避免一次把所有資料交給 TableReport。
          // 有館別時依 YM 完整群組逐批掛載，避免同一期間被拆開；
          // 無館別分組時則固定每批 100 筆。
          this.renderRowsProgressively(detailRows, isShowBuilding);

          // 3. 設置 Footer 數據 (使用總計數據)
          if (grandTotal) {
            this.footerData = {
              ...grandTotal,
              YM: '',
              BuildingName: '',
            };
          } else {
            this.footerData = null;
          }

        });
      });
    });
  }

  /**
   * 漸進式掛載大量報表資料。
   *
   * TableReport 欄位很多，若一次把數千筆資料指定給 [data]，Angular / PrimeNG
   * 會在同一個 rendering cycle 建立大量 DOM 與執行 formatter。
   * 這裡先掛第一批，後續利用 requestAnimationFrame 讓瀏覽器有機會先完成畫面更新。
   */
  private renderRowsProgressively(rows: TLS32020Data[], groupByYM: boolean): void {
    const token = ++this.progressiveRenderToken;
    this.data = [];

    if (rows.length === 0) {
      this.cdr.markForCheck();
      return;
    }

    const chunks = groupByYM
      ? this.createYMRenderChunks(rows)
      : this.createFixedRenderChunks(rows, this.RENDER_BATCH_SIZE);

    let chunkIndex = 0;
    const renderedRows: TLS32020Data[] = [];

    const appendNextChunk = () => {
      // 使用者已重新查詢時，停止上一輪尚未完成的 rendering。
      if (token !== this.progressiveRenderToken) return;

      const chunk = chunks[chunkIndex++];
      if (!chunk) return;

      renderedRows.push(...chunk);

      // OnPush 子元件需要新的 Array reference 才能穩定收到變更。
      this.data = renderedRows.slice();
      this.cdr.markForCheck();

      if (chunkIndex < chunks.length) {
        requestAnimationFrame(appendNextChunk);
      }
    };

    // 第一批同步掛上；Angular 在本次 callback 結束後即可先 render 第一批。
    appendNextChunk();
  }

  /**
   * 館別模式依「連續相同 YM」建立 render chunk。
   * 不使用 Map 重排資料，保留後端原始排序，也不會把同一個 YM 從中間切斷。
   */
  private createYMRenderChunks(rows: TLS32020Data[]): TLS32020Data[][] {
    const chunks: TLS32020Data[][] = [];
    let currentChunk: TLS32020Data[] = [];
    let currentYM: unknown = undefined;

    for (const row of rows) {
      if (currentChunk.length === 0 || row.YM === currentYM) {
        currentChunk.push(row);
      } else {
        chunks.push(currentChunk);
        currentChunk = [row];
      }

      currentYM = row.YM;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /** 無群組模式固定切批，控制每一個 rendering cycle 的 DOM 建立量。 */
  private createFixedRenderChunks(rows: TLS32020Data[], size: number): TLS32020Data[][] {
    const chunks: TLS32020Data[][] = [];

    for (let i = 0; i < rows.length; i += size) {
      chunks.push(rows.slice(i, i + size));
    }

    return chunks;
  }

  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }

    const export$ = this.tls32020Service.exportTLS32020PDF(this.historyRequestBody);

    // 呼叫 Service 執行匯出，並將直到銷毀的邏輯加入
    this.fileExportService.executeFileExport(
      export$.pipe(takeUntilDestroyed(this.destroyRef)), // 將 takeUntilDestroyed 加入 Service 回傳的 Observable
      '.pdf',
      (isLoading) => this.pdfBtnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }

    const export$ = this.tls32020Service.exportTLS32020Excel(this.historyRequestBody);

    this.fileExportService.executeFileExport(
      export$.pipe(takeUntilDestroyed(this.destroyRef)), // 將 takeUntilDestroyed 加入 Service 回傳的 Observable
      '.xlsx',
      (isLoading) => this.excelBtnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }

  setColumns() {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: this.queryForm.get('PreSale')?.value === true,
      consumerNum: this.queryForm.get('ConsumerNum')?.value === true,
      preSaleField: ['BasePreOrderAmt', 'Base_PrePerformance', 'Comp_PrePerformance', 'Diff_PrePerformance'],
      consumerNumFields: [
        'Base_ConsumerNum', 'Comp_ConsumerNum', 'Diff_ConsumerNum',
        'Base_ConsumerOrder', 'Comp_ConsumerOrder', 'Diff_ConsumerOrder',
      ],
    });
    const showBuilding = this.queryForm.get('ShowBuilding')?.value !== false;
    this.columns = this.columns.map(col =>
      col.field === 'BuildingName' ? { ...col, visible: showBuilding } : col
    );
  }

  private updateHistoryRequestBody(): void {
    if (this.historyRequestBody) {
      this.historyRequestBody = {
        ...this.historyRequestBody,
        PreSale: this.queryForm.get('PreSale')?.value ?? false,
        ConsumerNum: this.queryForm.get('ConsumerNum')?.value ?? false,
        ShowBuilding: this.queryForm.get('ShowBuilding')?.value ?? true,
      };
    }
  }
}