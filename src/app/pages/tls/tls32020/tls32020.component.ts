import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { applyDisplayStatusVisibility } from '@pages/tls/TLS30000/common/report-display-status.util';
import { TLS32020Data, TLS32020QueryRequest, TLS32020Service } from '@service/api/tls/tls32020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { startWith, take } from 'rxjs';
import { CategorySelectComponent } from 'src/app/shared/biz-components/category-select/category-select.component';

// 交易筆數/客單價/月坪效/月坪貢獻類欄位：千分位、四捨五入到整數位 (eg. 4335615.16 -> "4,335,615")
const formatInt = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString();
};

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
    DropdownRangeComponent,
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
    month: [null as number | null],
    monthTo: [null as number | null], // 月份區間查詢：迄月份
    halfYear: [null as number | null],
    halfYearTo: [null as number | null], // 半年別區間查詢：迄半年別

    // **新增**：日期計算輔助欄位 (比較期 Compare)
    CompareYear: [new Date()], // 預設與 BaseYear 相同
    CompareWeek: [null as number | null],
    CompareYearTo: [new Date()], // 週/月/半年/年 區間查詢共用：迄年度
    CompareWeekTo: [null as number | null], // 週次區間查詢：迄週次
    CompareMonth: [null as number | null],
    CompareMonthTo: [null as number | null], // 月份區間查詢：迄月份
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
  auditoriumOptions = this.dropdown.querySys3800();
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

  monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1, // 1 到 12
    label: `${i + 1} 月`
  }));
  weekOptions: { value: number, label: string }[] = [];
  halfYearOptions = [
    { value: 1, label: '上半年' }, // 1: 上半年 (1/1 ~ 6/30)
    { value: 2, label: '下半年' } // 2: 下半年 (7/1 ~ 12/31)
  ];

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
    { field: 'CompareTltSpace', header: '坪數', align: 'right', format: (value: number) => formatAmountWithDecimals(value, 2), isSubTotal: true, groupField: 'compareSalesPerArea', topGroupField: 'compare' },
    { field: 'ComparePyeff', header: '月坪效', align: 'right', format: formatInt, isSubTotal: true, groupField: 'compareSalesPerArea', topGroupField: 'compare' },
    { field: 'ComparePyContrib', header: '月坪貢獻(未稅)', align: 'right', format: formatInt, isSubTotal: true, groupField: 'compareSalesPerArea', topGroupField: 'compare' },
    { field: 'Comp_PrePerformance', header: '預售實績', visible: this.isPreSale, align: 'right', format: formatAmount, isSubTotal: true, groupField: 'comparePreSaleConsumer', topGroupField: 'compare' },
    { field: 'Comp_ConsumerNum', header: '消費人數', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'comparePreSaleConsumer', topGroupField: 'compare' },
    { field: 'Comp_ConsumerOrder', header: '消費客單', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'comparePreSaleConsumer', topGroupField: 'compare' },
    // ======================= 基準期 (Base) 欄位 =======================
    { field: 'BaseTarget', header: '營業目標', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'revenue', topGroupField: 'base' },
    { field: 'BaseSale', header: '營業實績', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'revenue', topGroupField: 'base' },
    { field: 'BaseAchieveRate', header: '達成率', align: 'right', format: (value: number) => `${((value ?? 0) * 100).toFixed(1)}%`, isSubTotal: true, groupField: 'revenue', topGroupField: 'base' },
    { field: 'BaseTxnCnt', header: '交易筆數', align: 'right', format: formatInt, isSubTotal: true, groupField: 'atv', topGroupField: 'base' },
    { field: 'BaseTicket', header: '客單價', align: 'right', format: formatInt, isSubTotal: true, groupField: 'atv', topGroupField: 'base' },
    { field: 'BaseTltSpace', header: '坪數', align: 'right', format: (value: number) => formatAmountWithDecimals(value, 2), isSubTotal: true, groupField: 'salesPerArea', topGroupField: 'base' },
    { field: 'BasePyeff', header: '月坪效', align: 'right', format: formatInt, isSubTotal: true, groupField: 'salesPerArea', topGroupField: 'base' },
    { field: 'BasePyContrib', header: '月坪貢獻(未稅)', align: 'right', format: formatInt, isSubTotal: true, groupField: 'salesPerArea', topGroupField: 'base' },
    { field: 'Base_PrePerformance', header: '預售實績', visible: this.isPreSale, align: 'right', format: formatAmount, isSubTotal: true, groupField: 'preSaleConsumer', topGroupField: 'base' },
    { field: 'Base_ConsumerNum', header: '消費人數', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'preSaleConsumer', topGroupField: 'base' },
    { field: 'Base_ConsumerOrder', header: '消費客單', visible: this.isConsumerNum, align: 'right', format: formatInt, isSubTotal: true, groupField: 'preSaleConsumer', topGroupField: 'base' },

    // ======================= 差異 (Difference) 欄位 =======================
    { field: 'DiffAmt', header: '業績差異', align: 'right', format: formatAmount, isSubTotal: true, groupField: 'diffRevenue', topGroupField: 'diff' },
    { field: 'GrowthRate', header: '成長率', align: 'right', format: (value: number) => `${((value ?? 0) * 100).toFixed(1)}%`, isSubTotal: true, groupField: 'diffRevenue', topGroupField: 'diff' },
    { field: 'DiffTxn', header: '交易筆數差異', align: 'right', format: formatInt, isSubTotal: true, groupField: 'diffATV', topGroupField: 'diff' },
    { field: 'DiffTicket', header: '客單價差異', align: 'right', format: formatInt, isSubTotal: true, groupField: 'diffATV', topGroupField: 'diff' },
    { field: 'DiffSquare', header: '坪數差異', align: 'right', format: (value: number) => formatAmountWithDecimals(value, 2), isSubTotal: true, groupField: 'diffSalesPerArea', topGroupField: 'diff' },
    { field: 'DiffPyeff', header: '月坪效差異', align: 'right', format: formatInt, isSubTotal: true, groupField: 'diffSalesPerArea', topGroupField: 'diff' },
    { field: 'DiffPyContrib', header: '月坪貢獻差異(未稅)', align: 'right', format: formatInt, isSubTotal: true, groupField: 'diffSalesPerArea', topGroupField: 'diff' },
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
    // 底色依「頂層分組」(基準期/比較期/差異) 套用，子分組(營業額/客單價/坪效/預售消費)只影響表頭文字分層、不影響底色
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
    this.setWeekOptions(this.queryForm.controls.year.value);// 初始化週次選項
    this.calculateInitialRanges('3');// 【保留】只在頁面初始化時執行一次完整的初始化
    this.queryForm.controls.DayType.valueChanges.pipe(startWith(this.queryForm.controls.DayType.value), takeUntilDestroyed(this.destroyRef)).subscribe(type => {
      const today = new Date();
      const compareDefaultDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      // 1-1. 清除/設定輔助欄位（僅在初始化時會被覆蓋，後續手動切換 DayType 時會被清除）
      // 先清除不相關的輔助欄位
      this.queryForm.controls.week.setValue(null, { emitEvent: false });
      this.queryForm.controls.weekTo.setValue(null, { emitEvent: false });
      this.queryForm.controls.month.setValue(null, { emitEvent: false });
      this.queryForm.controls.monthTo.setValue(null, { emitEvent: false });
      this.queryForm.controls.halfYear.setValue(null, { emitEvent: false });
      this.queryForm.controls.halfYearTo.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareWeek.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareWeekTo.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareMonth.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareMonthTo.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareHalfYear.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareHalfYearTo.setValue(null, { emitEvent: false });

      // 重新設定 Base / Compare 預設值（同時處理 DayType 切換和首次初始化）
      if (type === '2') {
        const currentWeek = this.getCurrentWeekNumber(today);
        const compareWeek = this.getCurrentWeekNumber(compareDefaultDate);
        this.queryForm.controls.week.setValue(currentWeek, { emitEvent: false });
        this.queryForm.controls.weekTo.setValue(currentWeek, { emitEvent: false });
        this.queryForm.controls.CompareWeek.setValue(compareWeek, { emitEvent: false }); // 去年同期週次
        this.queryForm.controls.CompareWeekTo.setValue(compareWeek, { emitEvent: false });
        this.setWeekOptions(today);
      } else if (type === '3') {
        this.queryForm.controls.month.setValue(today.getMonth() + 1, { emitEvent: false });
        this.queryForm.controls.monthTo.setValue(today.getMonth() + 1, { emitEvent: false });
        this.queryForm.controls.CompareMonth.setValue(today.getMonth() + 1, { emitEvent: false }); // 同樣月份
        this.queryForm.controls.CompareMonthTo.setValue(today.getMonth() + 1, { emitEvent: false });
      } else if (type === '4') {
        const defaultHalfYear = today.getMonth() + 1 <= 6 ? 1 : 2;
        this.queryForm.controls.halfYear.setValue(defaultHalfYear, { emitEvent: false });
        this.queryForm.controls.halfYearTo.setValue(defaultHalfYear, { emitEvent: false });
        this.queryForm.controls.CompareHalfYear.setValue(defaultHalfYear, { emitEvent: false }); // 同樣半年別
        this.queryForm.controls.CompareHalfYearTo.setValue(defaultHalfYear, { emitEvent: false });
      }

      // 1-2. 設定年份（確保首次初始化時設定正確的年份）
      this.queryForm.controls.year.setValue(today, { emitEvent: false });
      this.queryForm.controls.yearTo.setValue(today, { emitEvent: false });
      this.queryForm.controls.CompareYear.setValue(compareDefaultDate, { emitEvent: false });
      this.queryForm.controls.CompareYearTo.setValue(compareDefaultDate, { emitEvent: false });

      // 1-3. 重新計算日期和標頭
      this.calculateDateRanges(type);
      this.updateYMColumnHeader(type);
    });
    // 2. 訂閱 Base 輔助欄位變化 (不變)
    this.queryForm.controls.year.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setWeekOptions(this.queryForm.controls.year.value); // 年份變動時，更新週次選項
      this.calculateDateRanges(this.queryForm.controls.DayType.value)
    });
    this.calculateDateRanges(this.queryForm.controls.DayType.value);
    this.queryForm.controls.week.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.weekTo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.yearTo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setWeekOptions(this.queryForm.controls.year.value); // yearTo 變動時，同步檢查週次選項上限
      this.calculateDateRanges(this.queryForm.controls.DayType.value);
    });
    this.queryForm.controls.month.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.monthTo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.halfYear.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.halfYearTo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));

    // 3. 訂閱 Compare 輔助欄位變化 (不變)
    this.queryForm.controls.CompareYear.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareWeek.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareYearTo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareWeekTo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareMonth.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareMonthTo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareHalfYear.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareHalfYearTo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));

    this.updateYMColumnHeader(this.queryForm.controls.DayType.value);// 初始化時先設定一次正確的欄位標頭

    this.queryForm.get('PreSale')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setColumns();
      this.updateHistoryRequestBody();
    });
    this.queryForm.get('ConsumerNum')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setColumns();
      this.updateHistoryRequestBody();
    });
    this.queryForm.get('ShowBuilding')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setColumns();
      this.updateHistoryRequestBody();
    });
    // 監聽實際 DatePicker 的變更，確保 Header 年份 100% 同步
    this.queryForm.controls.BaseDateFrom.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.refreshHeadersFromActualDates();
    });

    this.queryForm.controls.CompareDateFrom.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
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
      case '3': // 月營業報表
        {
          if (baseMonth) {
            const baseFromRange = this.getMonthRange(baseYearNum, baseMonth);
            const baseToRange = baseMonthTo ? this.getMonthRange(baseYearToNum, baseMonthTo) : baseFromRange;
            if (baseFromRange && baseToRange) baseRange = { from: baseFromRange.from, to: baseToRange.to };
          }
          if (compareMonth) {
            const compareFromRange = this.getMonthRange(compareYearNum, compareMonth);
            const compareToRange = compareMonthTo ? this.getMonthRange(compareYearToNum, compareMonthTo) : compareFromRange;
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
      this.queryForm.controls.month.setValue(today.getMonth() + 1, { emitEvent: false });
      this.queryForm.controls.monthTo.setValue(today.getMonth() + 1, { emitEvent: false });
      this.queryForm.controls.CompareMonth.setValue(today.getMonth() + 1, { emitEvent: false }); // 同樣月份
      this.queryForm.controls.CompareMonthTo.setValue(today.getMonth() + 1, { emitEvent: false });
    } else if (defaultType === '4') {
      const defaultHalfYear = today.getMonth() + 1 <= 6 ? 1 : 2;
      this.queryForm.controls.halfYear.setValue(defaultHalfYear, { emitEvent: false });
      this.queryForm.controls.halfYearTo.setValue(defaultHalfYear, { emitEvent: false });
      this.queryForm.controls.CompareHalfYear.setValue(defaultHalfYear, { emitEvent: false }); // 同樣半年別
      this.queryForm.controls.CompareHalfYearTo.setValue(defaultHalfYear, { emitEvent: false });
    }

    this.calculateDateRanges(defaultType);
    // 初始化時也應該更新一次 ColumnGroup Header
    this.updateColumnGroupHeader(today.getFullYear(), compareDefaultDate.getFullYear());
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
    if (this.queryForm.controls.weekTo.value && this.queryForm.controls.weekTo.value > maxWeeks) {
      this.queryForm.controls.weekTo.setValue(null, { emitEvent: false });
    }
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

          if (isShowBuilding) {
            // 有勾選館別：篩選出小計列，並排除小計與總計
            this.subFooterData = allData.filter(item => item.BuildingName === '小計');
            this.data = allData
              .slice(0, allData.length - 1) // 移除總計
              .filter(item => item.BuildingName !== '小計'); // 移除期間小計
          } else {
            // 不勾選館別：不顯示小計列，明細只需排除最後一筆總計
            this.subFooterData = [];
            this.data = allData.slice(0, allData.length - 1);
          }

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

          this.totalRecords = this.data.length;
        });
      });
    });
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
