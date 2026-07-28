import { AsyncPipe, CommonModule, DatePipe, formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColumnGroup, formatAmount, formatPercentage } from '@others/component/table/table.model';
import { TLS26050Service } from '@service/api/tls/tls26050.service';
import { footerShowTotal, TLS31020Total } from '@service/api/tls/tls31020.service';
import { TLS31040Item, TLS31040PrintRequest, TLS31040Request, Tls31040Service } from '@service/api/tls/tls31040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem, ITLTBUSSCLASSInfo } from '@service/utility/dropDownList.service';
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
import { debounceTime, finalize, map, merge, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { formatAmountWithDecimals, ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';
import { Tls31040CRUComponent } from './tls31040-cru/tls31040-cru.component';

@Component({
  selector: 'app-tls31040',
  templateUrl: './tls31040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    InputTextComponent,
    DropdownComponent,
    CommonModule,
    CalendarComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    RadiobuttonYNComponent,
    TranslateModule,
    MultiSelectComponent,
    ButtonModule,
    CheckboxModule,
    Tls31040CRUComponent,
  ],
})
export class TLS31040Component extends BasicQueryPageComponent<TLS31040Item> implements OnInit {
  private readonly dropDownListService = inject(DropDownListService);
  public readonly tls31040Service = inject(Tls31040Service);
  private readonly tls26050Service = inject(TLS26050Service);
  private readonly datePipe = inject(DatePipe);
  private readonly dropdown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.nonNullable.group({
    TXN_DateS: [yesterday, Validators.required],
    TXN_DateE: [yesterday, Validators.required],
    TLT_NO: [[]],
    tlt_building: [[]],
    tlt_floor: [[]],
    area_no: [[]],
    bus_type: [[] as string[]],
    bus_class: [[] as IDropdownItem[]],
    bus_sclass: [[] as IDropdownItem[]],
    tlt_kind: [[]],
    tlt_term_type: [[]],
    org_id: [[]],
    TaxType: ['0'],
    IsRece_Yn: [null],
    PreSale: [false],
    ConsumerNum: [false],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_kind', order: 1 }]],
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

  halfyearOptions = [
    { value: '1', label: '上半年' },
    { value: '2', label: '下半年' },
  ];

  EventIDOptions = [
    { value: '1', label: '活動1', TXN_DateS: null, TXN_DateE: null },
    { value: '2', label: '活動2', TXN_DateS: null, TXN_DateE: null },
  ];

  reportTypeOptions = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
  ];

  totalRecords = 0;
  data: TLS31040Item[] = [];
  footerTotal: TLS31020Total | null = null;
  footershowTotal: footerShowTotal | null = null;
  footershowPercent: footerShowTotal | null = null;
  historyRequestBody: TLS31040Request | null = null;

  dialogVisible = false;
  selectedRow: TLS31040Item | null = null;

  btnPDFLoading = false;
  btnExcelLoading = false;

  columns: ReportColumn[] = [
    { field: 'tlt_kindName', header: '櫃別名稱', align: 'left' },
    { field: 'budget', header: '營業目標', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AVN_TotSaleAmt', header: '營業實績', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AchievementRate', header: '達成率', groupField: '營業額', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'BudgetRate', header: '營業目標佔比', groupField: '營業佔比', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'PerformanceRate', header: '營業實績佔比', groupField: '營業佔比', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'TxnCount', header: '交易筆數', groupField: '客單價', format: formatAmount, align: 'right' },
    { field: 'AvgTicket', header: '客單價', groupField: '客單價', format: formatAmount, align: 'right' },
    { field: 'tlt_space', header: '坪數', groupField: '營業坪效', format: (v) => formatAmountWithDecimals(v, 2), align: 'right' },
    { field: 'MonthlyPSM', header: '坪效', groupField: '營業坪效', format: formatAmount, align: 'right' },
    { field: 'TempCounterSaleAmt', header: '營業實績', groupField: '臨時櫃', format: formatAmount, align: 'right' },
    { field: 'TempCounterSalesRate', header: '營業實績佔比', groupField: '臨時櫃', format: formatAmount, align: 'right' },
    { field: 'TempCounterAmtRate', header: '臨時櫃業績佔比', groupField: '臨時櫃', format: formatAmount, align: 'right' },
    { field: 'MonthlyBudgetTotal', header: '月營業目標', groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'MonthlySalesTotal', header: '營業實績', groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'CompletionRate', header: '完成率', groupField: '月累計', format: (v) => formatPercentage(v, 2), align: 'right' },
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

  tlt_kind_Option = [
    { value: '1', label: '正櫃' },
    { value: '2', label: '臨時櫃' },
    { value: '3', label: '特賣會' },
    { value: '4', label: '虛擬櫃' },
  ];

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

  tlt_building_Option = this.dropdown.querySys3800();
  tlt_floor_Option = this.dropdown.querySys3900();
  area_no_Option = this.dropdown.querySys3A00();
  bus_type_Option = this.dropdown.queryTltBusType();
  bus_class_Option: IDropdownItem[] = [];
  bus_sclass_Option: IDropdownItem[] = [];
  org_id_Option = this.dropdown.querySys3100();
  tlt_noListOption = this.dropdown.queryTltTalent();

  ngOnInit(): void {
    this.initializePage('TLS31040', '', this.queryForm, (frm) => this.onSubmit(frm));
    this.onReportTypeChange('1');
    this.setReadOnlyFields();
    this.setColumns();

    // 恢復歷史日期條件狀態
    const savedDateState = this.queryStateService.getQueryStateValue('tls31040_Date');
    if (savedDateState) {
      const stateValue = savedDateState.value ? savedDateState.value : savedDateState;
      this.dateForm.patchValue(stateValue, { emitEvent: false });
      this.syncDateToQueryForm();
    }

    this.dateForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncDateToQueryForm());

    // 監聽顯示狀態變化
    const preSale$ = this.queryForm.get('PreSale')!.valueChanges;
    const consumerNum$ = this.queryForm.get('ConsumerNum')!.valueChanges;
    merge(preSale$, consumerNum$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setColumns();
        this.syncLastQueryBodyWithDisplayStatus();
      });

    // 監聽大分類變化更新中分類
    this.queryForm.controls.bus_type.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string[]) => {
        if (value && value.length > 0) {
          this.dropDownListService
            .queryTLTBUSCLASS_DropDownList({ bus_type: value })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
              const groupedData = response.Data.reduce((accumulator, currentItem) => {
                const groupKey = currentItem.bus_type || '';
                if (!accumulator[groupKey]) {
                  accumulator[groupKey] = { label: currentItem.bus_type_name, items: [] };
                }
                accumulator[groupKey].items.push({
                  ...currentItem,
                  label: `${currentItem.No} - ${currentItem.Name}`,
                });
                return accumulator;
              }, {} as Record<string, any>);
              this.bus_class_Option = Object.values(groupedData);
            });
        } else {
          this.bus_class_Option = [];
          this.bus_sclass_Option = [];
          this.queryForm.controls.bus_sclass.setValue([]);
          this.queryForm.controls.bus_class.setValue([]);
        }
      });

    // 監聽中分類變化更新小分類
    this.queryForm.controls.bus_class.valueChanges
      .pipe(
        debounceTime(300),
        map((selectedMValues) => selectedMValues || []),
        switchMap((selectedMValues: IDropdownItem[]) => {
          if (selectedMValues.length === 0) {
            this.bus_sclass_Option = [];
            this.queryForm.controls.bus_sclass.setValue([]);
            return of({ selectedMValues: [], data: [] });
          }
          const queryTLTBUSSCLASSInfos: ITLTBUSSCLASSInfo[] = selectedMValues
            .filter((v) => v && v.bus_type)
            .map((v) => ({ bus_type: v.bus_type!, bus_class: v.No }));

          return this.dropDownListService
            .queryTLTBUSSCLASS_DropDownList_new({ queryTLTBUSSCLASSInfos })
            .pipe(map((res) => ({ selectedMValues, data: res.Data })));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        const groupedData = result.selectedMValues.reduce((accumulator, mValue) => {
          const groupKey = `${mValue.bus_type}_${mValue.No}`;
          const groupLabel = `${mValue.bus_type_name} - ${mValue.Name}`;
          const items = result.data
            .filter((item) => item.bus_type === mValue.bus_type && item.bus_class === mValue.No)
            .map((item) => ({
              ...item,
              label: `${item.No} - ${item.Name}`,
              bus_type: mValue.bus_type,
              bus_type_name: mValue.bus_type_name,
              CAT_MNo: mValue.No,
              CAT_MName: mValue.Name,
            }));

          const uniqueItemsMap = new Map<string, (typeof items)[0]>();
          items.forEach((item) => {
            if (!uniqueItemsMap.has(item.No)) {
              uniqueItemsMap.set(item.No, item);
            }
          });
          accumulator[groupKey] = { label: groupLabel, items: Array.from(uniqueItemsMap.values()) };
          return accumulator;
        }, {} as Record<string, any>);
        this.bus_sclass_Option = Object.values(groupedData);
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = this.buildRequestBody(frm.getRawValue());

      this.tls31040Service
        .queryTLS31040(formValue)
        .pipe(
          finalize(() => (this.loading = false)),
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
              TempCounterSalesRate: this.footerTotal.AvgTempCounterSalesRate,
              TempCounterAmtRate: this.footerTotal.AvgTempCounterAmtRate,
              CompletionRate: this.footerTotal.AvgCompletionRate,
            }
            : null;

          this.historyRequestBody = formValue;
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          this.queryStateService.setQueryState('tls31040_Date', this.dateForm);
        });
    });
  }

  onReport(isExcel: boolean) {
    if (!this.historyRequestBody) {
      this.messageService.errorBubble('請先進行查詢後再列印');
      return;
    }

    const printBody: TLS31040PrintRequest = {
      ...this.historyRequestBody,
      IsMerge: true,
      IsExcel: isExcel,
    };

    if (isExcel) {
      this.btnExcelLoading = true;
    } else {
      this.btnPDFLoading = true;
    }

    this.tls31040Service
      .printTLS31040(printBody)
      .pipe(
        finalize(() => {
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
    const reportType = event;
    Object.keys(this.dateForm.controls).forEach((key) => {
      if (key !== 'reportType') {
        this.dateForm.get(key)?.clearValidators();
      }
    });

    switch (reportType) {
      case '1':
        this.dateForm.get('onedatedd')?.setValidators([Validators.required]);
        break;
      case '2':
        this.dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.dateForm.get('weeks')?.setValidators([Validators.required]);
        this.dateForm.get('startdate')?.setValidators([Validators.required]);
        this.dateForm.get('enddate')?.setValidators([Validators.required]);
        break;
      case '3':
        this.dateForm.get('onedatemm')?.setValidators([Validators.required]);
        break;
      case '4':
        this.dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        break;
      case '5':
        this.dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        break;
      case '6':
        this.dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('sad_enddate')?.setValidators([Validators.required]);
        break;
      case '7':
        this.dateForm.get('event_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('event_enddate')?.setValidators([Validators.required]);
        break;
    }

    Object.keys(this.dateForm.controls).forEach((key) => {
      this.dateForm.get(key)?.updateValueAndValidity();
    });
  }

  setReadOnlyFields() {
    this.dateForm.controls['startdate'].disable();
    this.dateForm.controls['enddate'].disable();
    this.dateForm.controls['event_startdate'].disable();
    this.dateForm.controls['event_enddate'].disable();
  }

  queryEvent(event: any) {
    this.dateForm.controls['event_startdate'].setValue(
      this.EventIDOptions.find((x) => x.value === event)?.TXN_DateS ?? null
    );
    this.dateForm.controls['event_enddate'].setValue(
      this.EventIDOptions.find((x) => x.value === event)?.TXN_DateE ?? null
    );
  }

  private syncDateToQueryForm() {
    const reportType = this.dateForm.get('reportType')?.value;
    let start: Date | null = null;
    let end: Date | null = null;

    switch (reportType) {
      case '1':
        start = this.dateForm.get('onedatedd')?.value ?? null;
        end = start;
        break;
      case '2':
        start = this.dateForm.get('startdate')?.value ?? null;
        end = this.dateForm.get('enddate')?.value ?? null;
        break;
      case '3': {
        const onedatemm = this.dateForm.get('onedatemm')?.value as Date | null;
        if (onedatemm) {
          start = new Date(onedatemm.getFullYear(), onedatemm.getMonth(), 1);
          end = new Date(onedatemm.getFullYear(), onedatemm.getMonth() + 1, 0);
        }
        break;
      }
      case '4': {
        const dateValue = this.dateForm.get('halfyear_onedateyy')?.value as Date | string;
        const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
        const half = String(this.dateForm.get('halfyear')?.value);
        if (year) {
          if (half === '1') {
            start = new Date(year, 0, 1);
            end = new Date(year, 5, 30);
          } else if (half === '2') {
            start = new Date(year, 6, 1);
            end = new Date(year, 11, 31);
          }
        }
        break;
      }
      case '5': {
        const dateValue = this.dateForm.get('year_onedateyy')?.value as Date | string;
        const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
        if (year) {
          start = new Date(year, 0, 1);
          end = new Date(year, 11, 31);
        }
        break;
      }
      case '6':
        start = this.dateForm.get('sad_startdate')?.value ?? null;
        end = this.dateForm.get('sad_enddate')?.value ?? null;
        break;
    }

    if (start) this.queryForm.get('TXN_DateS')?.setValue(start);
    if (end) this.queryForm.get('TXN_DateE')?.setValue(end);
  }

  onClearDate() {
    this.dateForm.reset({
      reportType: '1',
      onedatedd: yesterday,
    });
    this.data = [];
    this.totalRecords = 0;
    this.footerTotal = null;
    this.footershowTotal = null;
    this.footershowPercent = null;
    this.setReadOnlyFields();
    this.syncDateToQueryForm();
  }

  onDetail1(event: TLS31040Item) {
    this.selectedRow = event;
    this.dialogVisible = true;
  }

  private setColumns() {
    const isPreSale = !!this.queryForm.get('PreSale')?.value;
    const isConsumerNum = !!this.queryForm.get('ConsumerNum')?.value;

    const visibleMap: Record<string, boolean> = {
      PrePerformance: isPreSale,
      ConsumerNum: isConsumerNum,
      ConsumerOrder: isConsumerNum,
    };

    this.columns = this.columns.map((col) => ({
      ...col,
      visible: visibleMap[col.field] ?? col.visible ?? true,
    }));
  }

  private syncLastQueryBodyWithDisplayStatus() {
    if (!this.historyRequestBody) return;
    const { PreSale, ConsumerNum } = this.queryForm.getRawValue();
    this.historyRequestBody = { ...this.historyRequestBody, PreSale, ConsumerNum };
  }

  private buildRequestBody(rawValue: any): TLS31040Request {
    return {
      ...rawValue,
      bus_class: (rawValue.bus_class || []).map((x: any) => [x.bus_type, x.No]),
      bus_sclass: (rawValue.bus_sclass || []).map((x: any) => [x.bus_type, x.bus_class, x.No]),
      TXN_DateS: rawValue.TXN_DateS ? formatDate(rawValue.TXN_DateS, 'yyyy-MM-dd', 'en-US') : null,
      TXN_DateE: rawValue.TXN_DateE ? formatDate(rawValue.TXN_DateE, 'yyyy-MM-dd', 'en-US') : null,
    } as TLS31040Request;
  }
}