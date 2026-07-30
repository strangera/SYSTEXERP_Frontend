import { AsyncPipe, CommonModule, DatePipe, formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColumnGroup, formatAmount, formatPercentage } from '@others/component/table/table.model';
import {
  applyEventDateRange,
  applyReportDateTypeValidators,
  computeReportDateRange,
  disableComputedReportDateFields,
  REPORT_DATE_TYPE_OPTIONS,
  REPORT_HALFYEAR_OPTIONS,
  resetReportDateForm,
} from '@pages/tls/TLS30000/common/report-date-range.util';
import { applyDisplayStatusVisibility } from '@pages/tls/TLS30000/common/report-display-status.util';
import { TLS26050Service } from '@service/api/tls/tls26050.service';
import { footerShowTotal, TLS31020Total } from '@service/api/tls/tls31020.service';
import { TLS31030Item, TLS31030PrintRequest, TLS31030Request, Tls31030Service } from '@service/api/tls/tls31030.service';
import { getSYS1000Options$ } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CategorySelectComponent } from '@shared/biz-components/category-select/category-select.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '@shared/components/radiobutton-yn/radiobutton-yn.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { merge } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { formatAmountWithDecimals, ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';
import { Tls31030CRUComponent } from './tls31030-cru/tls31030-cru.component';

@Component({
  selector: 'app-tls31030',
  templateUrl: './tls31030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    CommonModule,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    RadiobuttonYNComponent,
    TranslateModule,
    MultiSelectComponent,
    ButtonModule,
    CheckboxModule,
    CategorySelectComponent,
    Tls31030CRUComponent,
  ],
})
export class TLS31030Component extends BasicQueryPageComponent<TLS31030Item> implements OnInit {
  public readonly tls31030Service = inject(Tls31030Service);
  private readonly tls26050Service = inject(TLS26050Service);
  private readonly datePipe = inject(DatePipe);
  private readonly dropdown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.nonNullable.group({
    TXN_DateS: [yesterday, [Validators.required]],
    TXN_DateE: [yesterday, [Validators.required]],
    TLT_NO: [[]],
    tlt_building: [[]],
    tlt_floor: [[]],
    area_no: [[]],
    category: [{ bus_type: [], bus_class: [], bus_sclass: [] }],
    tlt_kind: [[]],
    tlt_term_type: [[]],
    org_id: [[]],
    TaxType: ['0'],
    IsRece_Yn: [null],
    PreSale: [false],
    ConsumerNum: [false],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'bus_type', order: 1 }]],
  });

  dateForm = this.formBuilder.nonNullable.group({
    reportType: ['1'],
    onedatedd: [yesterday],
    onedateyy: [new Date()],
    weeks: [''],
    startdate: [null as Date | null],
    enddate: [null as Date | null],
    onedatemm: [null as Date | null],
    halfyear_onedateyy: [new Date()],
    halfyear: ['1'],
    year_onedateyy: [new Date()],
    sad_startdate: [null as Date | null],
    sad_enddate: [null as Date | null],
    eventID: [null],
    event_startdate: [null as Date | null],
    event_enddate: [null as Date | null],
  });

  halfyearOptions = REPORT_HALFYEAR_OPTIONS;

  EventIDOptions = [
    { value: '1', label: '活動1', TXN_DateS: null, TXN_DateE: null },
    { value: '2', label: '活動2', TXN_DateS: null, TXN_DateE: null },
  ];

  reportTypeOptions = REPORT_DATE_TYPE_OPTIONS;

  totalRecords = 0;
  data: TLS31030Item[] = [];
  footerTotal: TLS31020Total | null = null;
  footershowTotal: footerShowTotal | null = null;
  footershowPercent: footerShowTotal | null = null;
  historyRequestBody: TLS31030Request | null = null;

  dialogVisible = false;
  selectedRow: TLS31030Item | null = null;

  btnPDFLoading = false;
  btnExcelLoading = false;

  columns: ReportColumn[] = [
    { field: 'bus_type_name', header: '大分類名稱', align: 'left' },
    { field: 'budget', header: '營業目標', visible: true, groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AVN_TotSaleAmt', header: '營業實績', visible: true, groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AchievementRate', header: '達成率', visible: true, groupField: '營業額', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'BudgetRate', header: '營業目標佔比', visible: true, groupField: '營業佔比', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'PerformanceRate', header: '營業實績佔比', visible: true, groupField: '營業佔比', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'TxnCount', header: '交易筆數', visible: true, groupField: '客單價', format: formatAmount, align: 'right' },
    { field: 'AvgTicket', header: '客單價', visible: true, groupField: '客單價', format: formatAmount, align: 'right' },
    { field: 'tlt_space', header: '坪數', visible: true, groupField: '營業坪效', format: (v) => formatAmountWithDecimals(v, 2), align: 'right' },
    { field: 'MonthlyPSM', header: '坪效', visible: true, groupField: '營業坪效', format: formatAmount, align: 'right' },
    { field: 'TempCounterSaleAmt', header: '營業實績', visible: true, groupField: '臨時櫃', format: formatAmount, align: 'right' },
    { field: 'TempCounterSalesRate', header: '營業實績佔比', visible: true, groupField: '臨時櫃', format: formatAmount, align: 'right' },
    { field: 'TempCounterAmtRate', header: '臨時櫃業績佔比', visible: true, groupField: '臨時櫃', format: formatAmount, align: 'right' },
    { field: 'MonthlyBudgetTotal', header: '月營業目標', visible: true, groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'MonthlySalesTotal', header: '營業實績', visible: true, groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'CompletionRate', header: '完成率', visible: true, groupField: '月累計', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'PrePerformance', header: '預售業績', visible: false, format: formatAmount, align: 'right', isTotal: true },
    { field: 'ConsumerNum', header: '消費人數', visible: false, format: formatAmount, align: 'right', isTotal: true },
    { field: 'ConsumerOrder', header: '消費客單', visible: false, format: formatAmount, align: 'right', isTotal: true },
  ];

  columnGroup: ColumnGroup[] = [
    { field: '營業額', header: '營業額' },
    { field: '營業佔比', header: '營業佔比' },
    { field: '客單價', header: '客單價' },
    { field: '營業坪效', header: '營業坪效' },
    { field: '臨時櫃', header: '臨時櫃' },
    { field: '月累計', header: '月累計' },
  ];

  tlt_kind_Option$ = getSYS1000Options$(this.systemDataService, 'TLT_Kind');

  tlt_term_type = [
    { value: '1', label: '固定租金' },
    { value: '2', label: '底租抽成取高者' },
    { value: '3', label: '一般抽成' },
    { value: '4', label: '包底抽成' },
    { value: '5', label: '層級抽成' },
    { value: '6', label: '包底加層級' },
  ];

  TaxType_Option = [
    { value: '0', label: '是' },
    { value: '1', label: '否' },
  ];

  // 選項改為直接由 DropdownApiService 或 API 提供 Observable
  tlt_building_Option = this.dropdown.querySys3800();
  tlt_floor_Option = this.dropdown.querySys3900();
  area_no_Option = this.dropdown.querySys3A00();
  org_id_Option = this.dropdown.querySys3100();
  tlt_noListOption = this.dropdown.queryTltTalent();

  ngOnInit(): void {
    this.initializePage('TLS31030', '', this.queryForm, (frm) => this.onSubmit(frm));
    this.onReportTypeChange('1');
    this.setReadOnlyFields();
    this.setColumns();

    // 恢復歷史日期條件狀態
    const savedDateState = this.queryStateService.getQueryStateValue('tls31030_Date');
    if (savedDateState) {
      const stateValue = savedDateState.value ? savedDateState.value : savedDateState;
      this.dateForm.patchValue(stateValue, { emitEvent: false });
      this.syncDateToQueryForm();
    }

    this.dateForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncDateToQueryForm());

    // 監聽勾選顯示欄位切換
    const preSale$ = this.queryForm.get('PreSale')!.valueChanges;
    const consumerNum$ = this.queryForm.get('ConsumerNum')!.valueChanges;
    merge(preSale$, consumerNum$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setColumns();
        this.syncLastQueryBodyWithDisplayStatus();
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = this.buildRequestBody(frm.getRawValue());

      this.tls31030Service
        .queryTLS31030(formValue)
        .pipe(
          this.withLoading(),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((res) => {
          this.data = res.Data ?? [];
          this.footerTotal = res.TotalData ?? null;
          this.footershowTotal = this.footerTotal
            ? {
              budget: this.footerTotal.TotalBudget,
              AVN_TotSaleAmt: this.footerTotal.TotalSales,
              TxnCount: this.footerTotal.TotalTxnCount,
              AvgTicket: this.footerTotal.AvgTicket,
              tlt_space: this.footerTotal.TotalSpace,
              MonthlyPSM: this.footerTotal.AvgPSM,
              MonthlyPayment: this.footerTotal.AvgMonthlyPayment,
              TempCounterSaleAmt: this.footerTotal.TotalTempCounterSales,
              MonthlyBudgetTotal: this.footerTotal.TotalMonthlyBudget,
              MonthlySalesTotal: this.footerTotal.TotalMonthlySales,
              AchievementRate: this.footerTotal.AvgAchievementRate,
              CompletionRate: this.footerTotal.AvgCompletionRate,
              PrePerformance: this.footerTotal.TotalPrePerformance,
              ConsumerNum: this.footerTotal.TotalConsumerNum,
              ConsumerOrder: this.footerTotal.TotalConsumerOrder,
            }
            : null;

          this.footershowPercent = this.footerTotal
            ? {
              AchievementRate: this.footerTotal.AvgAchievementRate,
              BudgetRate: this.footerTotal.AvgBudgetRate,
              PerformanceRate: this.footerTotal.AvgPerformanceRate,
              CompletionRate: this.footerTotal.AvgCompletionRate,
            }
            : null;

          this.historyRequestBody = formValue;
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          this.queryStateService.setQueryState('tls31030_Date', this.dateForm);
        });
    });
  }

  onReport(isExcel: boolean) {
    if (!this.historyRequestBody) {
      this.messageService.errorBubble('請先進行查詢後再列印');
      return;
    }

    const printBody: TLS31030PrintRequest = {
      ...this.historyRequestBody,
      IsExcel: isExcel,
    };

    if (isExcel) {
      this.btnExcelLoading = true;
    } else {
      this.btnPDFLoading = true;
    }

    this.tls31030Service
      .printTLS31030(printBody)
      .pipe(
        this.withLoading(() => {
          this.btnExcelLoading = false;
          this.btnPDFLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.messageService.successBubble(res.Message);
        if (res.Data?.Print_URL) {
          const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
          globalThis.open(downloadUrl, '_blank');
        }
      });
  }

  // #region 日期選單事件
  queryWeek(event: string) {
    const control = this.dateForm.controls['onedateyy'];
    if (!control.value) return;
    const payload = {
      onedateyy: this.datePipe.transform(control.value, 'yyyy') ?? '',
      weeks: event,
    };
    this.tls26050Service
      .queryTLS26050Week(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.dateForm.controls['startdate'].setValue(
          response.Data[0].WeekStart ? new Date(response.Data[0].WeekStart) : null
        );
        this.dateForm.controls['enddate'].setValue(
          response.Data[0].WeekEnd ? new Date(response.Data[0].WeekEnd) : null
        );
      });
  }

  onReportTypeChange(event: any) {
    applyReportDateTypeValidators(this.dateForm, event);
  }

  setReadOnlyFields() {
    disableComputedReportDateFields(this.dateForm);
  }

  queryEvent(event: any) {
    applyEventDateRange(this.dateForm, this.EventIDOptions, event);
  }

  private syncDateToQueryForm() {
    const { start, end } = computeReportDateRange(this.dateForm);
    if (start) this.queryForm.get('TXN_DateS')?.setValue(start);
    if (end) this.queryForm.get('TXN_DateE')?.setValue(end);
  }

  onClearDate() {
    resetReportDateForm(this.dateForm);
    this.data = [];
    this.totalRecords = 0;
    this.footerTotal = null;
    this.footershowTotal = null;
    this.footershowPercent = null;
    this.setReadOnlyFields();
    this.syncDateToQueryForm();
  }

  onDetail1(event: TLS31030Item) {
    this.selectedRow = event;
    this.dialogVisible = true;
  }

  private setColumns() {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: !!this.queryForm.get('PreSale')?.value,
      consumerNum: !!this.queryForm.get('ConsumerNum')?.value,
      fallbackWhenUnset: true,
    });
  }

  private syncLastQueryBodyWithDisplayStatus() {
    if (!this.historyRequestBody) return;
    const { PreSale, ConsumerNum } = this.queryForm.getRawValue();
    this.historyRequestBody = { ...this.historyRequestBody, PreSale, ConsumerNum };
  }

  private buildRequestBody(rawValue: any): TLS31030Request {
    const cat = rawValue.category || {};
    return {
      ...rawValue,
      bus_type: cat.bus_type || [],
      bus_class: (cat.bus_class || []).map((x: any) => [x.bus_type, x.No]),
      bus_sclass: (cat.bus_sclass || []).map((x: any) => [x.bus_type, x.bus_class, x.No]),
      category: undefined,
      TXN_DateS: rawValue.TXN_DateS ? formatDate(rawValue.TXN_DateS, 'yyyy-MM-dd', 'en-US') : null,
      TXN_DateE: rawValue.TXN_DateE ? formatDate(rawValue.TXN_DateE, 'yyyy-MM-dd', 'en-US') : null,
    } as TLS31030Request;
  }
}