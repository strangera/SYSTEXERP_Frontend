import { AsyncPipe, DatePipe, formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26050Service } from '@service/api/tls/tls26050.service';
import { TLS32070Request, TLS32070Response, TLS32070Service } from '@service/api/tls/tls32070.service';
import { getSYS1000Options$ } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CategorySelectComponent } from '@shared/biz-components/category-select/category-select.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatAmountWithDecimals, formatPercentage, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-tls32070',
  templateUrl: './tls32070.component.html',
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
      .bg-group-growth {
        background-color: #f3e9f7 !important;
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
      .p-datatable-tbody > tr:hover > td.bg-group-growth {
        background-color: #ebd9f2 !important;
      }
    }
  `],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    RadiobuttonComponent,
    MultiSelectComponent,
    CategorySelectComponent,
    ButtonComponent,
    ButtonModule,
    CheckboxModule,
    TableReportComponent,
  ],
})
export class TLS32070Component extends BasicQueryPageComponent<TLS32070Response> implements OnInit {
  readonly service = inject(TLS32070Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly tls26050Service = inject(TLS26050Service);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.nonNullable.group({
    BaseDateFrom: [today],
    BaseDateTo: [today],
    CompareDateFrom: [yesterday as Date | null],
    CompareDateTo: [yesterday as Date | null],
    BuildingList: [[] as string[]],
    FloorList: [[] as string[]],
    AreaList: [[] as string[]],
    category: [{ bus_type: [] as string[], bus_class: [] as any[], bus_sclass: [] as any[] }],
    TltKindList: [[] as string[]],
    OrgList: [[] as string[]],
    TltNoList: [[] as string[]],
    TermTypeList: [[] as string[]],
    TltIdList: [[] as string[]],
    AmtTaxMode: ['G'],
    ReceFilter: ['A'],
    PreSale: [false],           // 顯示預售欄位開關
    ConsumerNum: [false],       // 顯示消費人數/客單開關
    pageSize: [1000],
    pageIndex: [1],
  });

  dateForm = this.formBuilder.nonNullable.group({
    reportType: ['DAY'],
    onedatedd: [today],
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
  });

  c_dateForm = this.formBuilder.nonNullable.group({
    onedatedd: [yesterday as Date | null],
    onedateyy: [new Date()],
    weeks: [''],
    startdate: [null as Date | null],
    enddate: [null as Date | null],
    onedatemm: [null as Date | null],
    halfyear_onedateyy: [new Date()],
    halfyear: ['2' as string | null],
    year_onedateyy: [new Date()],
    sad_startdate: [null as Date | null],
    sad_enddate: [null as Date | null],
  });

  reportTypeOptions = [
    { value: 'DAY', label: '日營業報表' },
    { value: 'WEEK', label: '週營業報表' },
    { value: 'MONTH', label: '月營業報表' },
    { value: 'HALFYEAR', label: '半年營業報表' },
    { value: 'YEAR', label: '年營業報表' },
    { value: 'SAD', label: '自訂區間營業報表' },
  ];

  halfyearOptions = [
    { value: '1', label: '上半年' },
    { value: '2', label: '下半年' },
  ];

  totalRecords = 0;
  data: TLS32070Response[] = [];
  footerTotal: TLS32070Response | null = null;
  lastQueryBody: TLS32070Request | null = null;
  btnPDFLoading = false;
  btnExcelLoading = false;

  TaxType_Option = [
    { value: 'G', label: '是' },
    { value: 'N', label: '否' },
  ];
  ReceFilter_Option = [
    { value: 'A', label: '全部' },
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  isPreSale = this.queryForm.get('PreSale')?.value ?? false;
  isConsumerNum = this.queryForm.get('ConsumerNum')?.value ?? false;

  // 對照 PM 截圖設定報表欄位
  columns: ReportColumn[] = [
    // 基本資訊
    { field: 'BuildingName', header: '館別', align: 'left' },
    { field: 'OrgName', header: '組織名稱', align: 'left' },
    { field: 'TltKind', header: '櫃別', align: 'left', format: (v) => this.tlt_kind_Option.find(o => o.value === v)?.label ?? v },
    { field: 'TltNo', header: '專櫃編號', align: 'left' },
    { field: 'TltName', header: '櫃位名稱', align: 'left' },
    { field: 'TltId', header: '抽成類別代號', align: 'left' },
    { field: 'TltIdDesc', header: '抽成類別名稱', align: 'left' },

    // 比較期 (依 PM 截圖，比較期放在前)
    { field: 'Comp_LocationNo', header: '位置編號', align: 'left', groupField: '比較期' },
    { field: 'Comp_Space', header: '坪數', align: 'right', format: (v) => formatAmountWithDecimals(v, 2), groupField: '比較期' },
    { field: 'Comp_SaleAmt', header: '銷售金額', align: 'right', format: formatAmount, groupField: '比較期' },
    { field: 'Comp_TxnCnt', header: '交易筆數', align: 'right', format: formatAmount, groupField: '比較期' },
    { field: 'Comp_AvgTicket', header: '客單價', align: 'right', format: formatAmount, groupField: '比較期' },
    { field: 'Comp_PreOrderAmt', header: '預售金額', align: 'right', format: formatAmount, groupField: '比較期', visible: this.isPreSale },
    { field: 'Comp_ConsumerNum', header: '消費人數', align: 'right', format: formatAmount, groupField: '比較期', visible: this.isConsumerNum },
    { field: 'Comp_ConsumerOrder', header: '消費客單', align: 'right', format: formatAmount, groupField: '比較期', visible: this.isConsumerNum },

    // 基準期 (本期)
    { field: 'Base_LocationNo', header: '位置編號', align: 'left', groupField: '基準期' },
    { field: 'Base_Space', header: '坪數', align: 'right', format: (v) => formatAmountWithDecimals(v, 2), groupField: '基準期' },
    { field: 'Base_SaleAmt', header: '銷售金額', align: 'right', format: formatAmount, groupField: '基準期' },
    { field: 'Base_TxnCnt', header: '交易筆數', align: 'right', format: formatAmount, groupField: '基準期' },
    { field: 'Base_AvgTicket', header: '客單價', align: 'right', format: formatAmount, groupField: '基準期' },
    { field: 'Base_PreOrderAmt', header: '預售金額', align: 'right', format: formatAmount, groupField: '基準期', visible: this.isPreSale },
    { field: 'Base_ConsumerNum', header: '消費人數', align: 'right', format: formatAmount, groupField: '基準期', visible: this.isConsumerNum },
    { field: 'Base_ConsumerOrder', header: '消費客單', align: 'right', format: formatAmount, groupField: '基準期', visible: this.isConsumerNum },

    // 成長率 Group
    { field: 'Growth_SaleAmtPct', header: '銷售金額', align: 'right', format: (v) => formatPercentage(v), groupField: '成長率' },
    { field: 'Growth_TxnCntPct', header: '交易筆數', align: 'right', format: (v) => formatPercentage(v), groupField: '成長率' },
    { field: 'Growth_AvgTicketPct', header: '客單價', align: 'right', format: (v) => formatPercentage(v), groupField: '成長率' },

    // 差異 Group
    { field: 'Diff_SaleAmt', header: '銷售金額', align: 'right', format: formatAmount, groupField: '差異' },
    { field: 'Diff_TxnCnt', header: '交易筆數', align: 'right', format: formatAmount, groupField: '差異' },
    { field: 'Diff_AvgTicket', header: '客單價', align: 'right', format: formatAmount, groupField: '差異' },
    { field: 'Diff_PreOrderAmt', header: '預售金額', align: 'right', format: formatAmount, groupField: '差異', visible: this.isPreSale },
    { field: 'Diff_ConsumerNum', header: '消費人數', align: 'right', format: formatAmount, groupField: '差異', visible: this.isConsumerNum },
    { field: 'Diff_ConsumerOrder', header: '消費客單', align: 'right', format: formatAmount, groupField: '差異', visible: this.isConsumerNum },
  ];

  // 跨欄 Group 表頭
  columnGroup = [
    { field: '比較期', header: '比較期' },
    { field: '基準期', header: '基準期' },
    { field: '成長率', header: '成長率' },
    { field: '差異', header: '差異' },
  ];

  tlt_kind_Option$ = getSYS1000Options$(this.systemDataService, 'TLT_Kind');
  tlt_kind_Option: { value: string; label: string }[] = [];
  tlt_term_type_Option = [
    { value: '1', label: '固定租金' },
    { value: '2', label: '底租抽成取高者' },
    { value: '3', label: '一般抽成' },
    { value: '4', label: '包底抽成' },
    { value: '5', label: '階梯式抽成' },
    { value: '6', label: '包底加階梯' },
  ];

  tlt_building_Option = this.dropdown.querySys3800();
  tlt_floor_Option = this.dropdown.querySys3900();
  area_no_Option = this.dropdown.querySys3A00();
  org_id_Option = this.dropdown.querySys3100();
  tlt_no_Option = this.dropdown.queryTltTalent();
  tlt_id_Option = this.dropdown.queryTltTalentChargeM();

  ngOnInit(): void {
    this.initializePage('TLS32070', '', this.queryForm, (frm) => this.onSubmit(frm));
    this.columns = this.columns.map((col): ReportColumn => ({
      ...col,
      cellClass: () => {
        switch (col.groupField) {
          case '基準期': return 'bg-group-base';
          case '比較期': return 'bg-group-compare';
          case '差異': return 'bg-group-diff';
          case '成長率': return 'bg-group-growth';
          default: return '';
        }
      },
      format: col.format ? col.format : undefined
    }));
    this.tlt_kind_Option$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((options) => {
      this.tlt_kind_Option = options;
    });
    this.onReportTypeChange('DAY');
    this.setReadOnlyFields();
    this.syncDateToQueryForm();
    this.dateForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncDateToQueryForm());
    this.c_dateForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncCDateToQueryForm());
    this.queryForm.get('PreSale')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.setColumns(); });
    this.queryForm.get('ConsumerNum')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.setColumns(); });
  }

  setColumns(): void {
    const isPreSale = this.queryForm.get('PreSale')?.value === true;
    const isConsumerNum = this.queryForm.get('ConsumerNum')?.value === true;

    const visibleMap: Record<string, boolean> = {
      Base_PreOrderAmt: isPreSale,
      Comp_PreOrderAmt: isPreSale,
      Diff_PreOrderAmt: isPreSale,

      Base_ConsumerNum: isConsumerNum,
      Comp_ConsumerNum: isConsumerNum,
      Diff_ConsumerNum: isConsumerNum,

      Base_ConsumerOrder: isConsumerNum,
      Comp_ConsumerOrder: isConsumerNum,
      Diff_ConsumerOrder: isConsumerNum,
    };

    this.columns = this.columns.map((col) => ({
      ...col,
      visible: visibleMap[col.field] ?? col.visible,
    }));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = this.buildRequestBody(frm.getRawValue());
      this.service.queryTLS32070(body).pipe(
        this.withLoading(),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe((res) => {
        const rows = res.Data ?? [];
        this.data = rows.filter((r) => r.RowType === 'DETAIL');
        this.footerTotal = rows.find((r) => r.RowType === 'TOTAL') ?? null;
        this.totalRecords = this.data.length;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
        this.queryStateService.setQueryState('tls32070_Date', this.dateForm);
        this.queryStateService.setQueryState('tls32070_CDate', this.c_dateForm);
      });
    });
  }

  onReport(isExcel: boolean): void {
    if (!this.lastQueryBody || this.data.length === 0) {
      this.messageService.errorBubble('查詢結果為空，請先查詢後再匯出');
      return;
    }
    if (isExcel) {
      this.btnExcelLoading = true;
      this.service.exportTLS32070Excel(this.lastQueryBody).pipe(
        this.withLoading(() => {
          this.btnExcelLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = '抽成類別分析報表.xlsx';
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
    } else {
      this.btnPDFLoading = true;
      this.service.exportTLS32070PDF(this.lastQueryBody).pipe(
        this.withLoading(() => {
          this.btnPDFLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        globalThis.open(blobUrl, '_blank');
      });
    }
  }

  private buildRequestBody(rawValue: any): TLS32070Request {
    const cat = rawValue.category || {};
    return {
      ReportType: this.dateForm.get('reportType')?.value,
      BaseDateFrom: formatDate(rawValue.BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
      BaseDateTo: formatDate(rawValue.BaseDateTo, 'yyyy-MM-dd', 'en-US'),
      CompareDateFrom: formatDate(rawValue.CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
      CompareDateTo: formatDate(rawValue.CompareDateTo, 'yyyy-MM-dd', 'en-US'),
      BuildingList: (rawValue.BuildingList || []).join(','),
      FloorList: (rawValue.FloorList || []).join(','),
      AreaList: (rawValue.AreaList || []).join(','),
      BusTypeList: cat.bus_type || [],
      BusClassList: (cat.bus_class || []).map((x: any) => ({ BusType: x.bus_type, BusClass: x.No })),
      BusSClassList: (cat.bus_sclass || []).map((x: any) => ({ BusType: x.bus_type, BusClass: x.bus_class, BusSClass: x.No })),
      TltKindList: (rawValue.TltKindList || []).join(','),
      OrgList: (rawValue.OrgList || []).join(','),
      TltNoList: (rawValue.TltNoList || []).join(','),
      TermTypeList: (rawValue.TermTypeList || []).join(','),
      TltIdList: (rawValue.TltIdList || []).join(','),
      AmtTaxMode: rawValue.AmtTaxMode,
      ReceFilter: rawValue.ReceFilter,
      PreSale: rawValue.PreSale,
      ConsumerNum: rawValue.ConsumerNum,
    } as TLS32070Request;
  }

  onReportTypeChange(reportType: string): void {
    Object.keys(this.dateForm.controls).forEach((key) => {
      if (key !== 'reportType') this.dateForm.get(key)?.clearValidators();
    });
    switch (reportType) {
      case 'DAY':
        this.dateForm.get('onedatedd')?.setValidators([Validators.required]);
        break;
      case 'WEEK':
        this.dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.dateForm.get('weeks')?.setValidators([Validators.required]);
        this.dateForm.get('startdate')?.setValidators([Validators.required]);
        this.dateForm.get('enddate')?.setValidators([Validators.required]);
        break;
      case 'MONTH':
        this.dateForm.get('onedatemm')?.setValidators([Validators.required]);
        break;
      case 'HALFYEAR':
        this.dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        break;
      case 'YEAR':
        this.dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        break;
      case 'SAD':
        this.dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('sad_enddate')?.setValidators([Validators.required]);
        break;
    }
    Object.keys(this.dateForm.controls).forEach((key) => {
      this.dateForm.get(key)?.updateValueAndValidity();
    });
  }

  setReadOnlyFields(): void {
    this.dateForm.controls.startdate.disable();
    this.dateForm.controls.enddate.disable();
  }

  queryWeek(weeks: string): void {
    const control = this.dateForm.controls.onedateyy;
    if (!control.value) return;
    const payload = {
      onedateyy: this.datePipe.transform(control.value, 'yyyy') ?? '',
      weeks,
    };
    this.tls26050Service.queryTLS26050Week(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.dateForm.controls.startdate.setValue(response.Data[0].WeekStart ? new Date(response.Data[0].WeekStart) : null);
      this.dateForm.controls.enddate.setValue(response.Data[0].WeekEnd ? new Date(response.Data[0].WeekEnd) : null);
    });
  }

  private syncDateToQueryForm(): void {
    const reportType = this.dateForm.get('reportType')?.value;
    let start: Date | null = null;
    let end: Date | null = null;
    let compareStart: Date | null = null;
    let compareEnd: Date | null = null;

    switch (reportType) {
      case 'DAY': {
        start = this.dateForm.get('onedatedd')?.value ?? null;
        end = start;
        if (start) {
          const prevDay = new Date(start);
          prevDay.setDate(prevDay.getDate() - 1);
          compareStart = prevDay;
          compareEnd = prevDay;
          this.c_dateForm.controls.onedatedd.setValue(compareStart, { emitEvent: false });
        }
        break;
      }
      case 'WEEK': {
        start = this.dateForm.get('startdate')?.value ?? null;
        end = this.dateForm.get('enddate')?.value ?? null;
        if (start) {
          compareStart = new Date(start);
          compareStart.setDate(compareStart.getDate() - 7);
          compareEnd = new Date(compareStart);
          compareEnd.setDate(compareStart.getDate() + 6);
          const compareYearDate = new Date(compareEnd.getFullYear(), 0, 1);
          const compareWeek = this.getWeekNumber(compareEnd);
          this.c_dateForm.controls.onedateyy.setValue(compareYearDate, { emitEvent: false });
          this.c_dateForm.controls.weeks.setValue(compareWeek, { emitEvent: false });
          this.c_dateForm.controls.startdate.setValue(compareStart, { emitEvent: false });
          this.c_dateForm.controls.enddate.setValue(compareEnd, { emitEvent: false });
        }
        break;
      }
      case 'MONTH': {
        const onedatemm = this.dateForm.get('onedatemm')?.value as Date | null;
        if (onedatemm) {
          start = new Date(onedatemm.getFullYear(), onedatemm.getMonth(), 1);
          end = new Date(onedatemm.getFullYear(), onedatemm.getMonth() + 1, 0);
          const compareMonth = new Date(onedatemm.getFullYear(), onedatemm.getMonth() - 1, 1);
          compareStart = new Date(compareMonth.getFullYear(), compareMonth.getMonth(), 1);
          compareEnd = new Date(compareMonth.getFullYear(), compareMonth.getMonth() + 1, 0);
          this.c_dateForm.controls.onedatemm.setValue(compareStart, { emitEvent: false });
        }
        break;
      }
      case 'HALFYEAR': {
        const dateValue = this.dateForm.get('halfyear_onedateyy')?.value as Date | string;
        const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
        const half = String(this.dateForm.get('halfyear')?.value);
        if (year) {
          if (half === '1') {
            start = new Date(year, 0, 1);
            end = new Date(year, 5, 30);
            compareStart = new Date(year - 1, 6, 1);
            compareEnd = new Date(year - 1, 11, 31);
            this.c_dateForm.controls.halfyear_onedateyy.setValue(compareStart, { emitEvent: false });
            this.c_dateForm.controls.halfyear.setValue('2', { emitEvent: false });
          } else if (half === '2') {
            start = new Date(year, 6, 1);
            end = new Date(year, 11, 31);
            compareStart = new Date(year, 0, 1);
            compareEnd = new Date(year, 5, 30);
            this.c_dateForm.controls.halfyear_onedateyy.setValue(compareStart, { emitEvent: false });
            this.c_dateForm.controls.halfyear.setValue('1', { emitEvent: false });
          }
        }
        break;
      }
      case 'YEAR': {
        const dateValue = this.dateForm.get('year_onedateyy')?.value as Date | string;
        const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
        if (year) {
          start = new Date(year, 0, 1);
          end = new Date(year, 11, 31);
          compareStart = new Date(year - 1, 0, 1);
          compareEnd = new Date(year - 1, 11, 31);
          this.c_dateForm.controls.year_onedateyy.setValue(compareStart, { emitEvent: false });
        }
        break;
      }
      case 'SAD':
        start = this.dateForm.get('sad_startdate')?.value as Date | null;
        end = this.dateForm.get('sad_enddate')?.value as Date | null;
        compareStart = this.c_dateForm.get('sad_startdate')?.value as Date | null;
        compareEnd = this.c_dateForm.get('sad_enddate')?.value as Date | null;
        break;
    }
    if (start) this.queryForm.controls.BaseDateFrom.setValue(start);
    if (end) this.queryForm.controls.BaseDateTo.setValue(end);
    this.queryForm.controls.CompareDateFrom.setValue(compareStart);
    this.queryForm.controls.CompareDateTo.setValue(compareEnd);
  }

  private syncCDateToQueryForm(): void {
    const reportType = this.dateForm.get('reportType')?.value;
    let compareStart: Date | null = null;
    let compareEnd: Date | null = null;

    switch (reportType) {
      case 'DAY': {
        const d = this.c_dateForm.controls.onedatedd.value;
        compareStart = d;
        compareEnd = d;
        break;
      }
      case 'WEEK': {
        const chooseYear = this.c_dateForm.get('onedateyy')?.value ?? null;
        const chooseWeeks = this.c_dateForm.get('weeks')?.value ?? null;
        if (chooseYear && chooseWeeks) {
          const yearNumber = chooseYear.getFullYear();
          const { weekStart, weekEnd } = this.getDateRangeByYearWeek(yearNumber, Number(chooseWeeks));
          compareStart = weekStart;
          compareEnd = weekEnd;
        }
        break;
      }
      case 'MONTH': {
        const m = this.c_dateForm.controls.onedatemm.value;
        if (m) {
          const monthDate = new Date(m);
          compareStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          compareEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        }
        break;
      }
      case 'HALFYEAR': {
        const yearValue = this.c_dateForm.controls.halfyear_onedateyy.value;
        const year = yearValue instanceof Date ? yearValue.getFullYear() : Number(yearValue);
        const half = String(this.c_dateForm.controls.halfyear.value);
        if (year && half) {
          if (half === '1') {
            compareStart = new Date(year, 0, 1);
            compareEnd = new Date(year, 5, 30);
          } else if (half === '2') {
            compareStart = new Date(year, 6, 1);
            compareEnd = new Date(year, 11, 31);
          }
        }
        break;
      }
      case 'YEAR': {
        const yearValue = this.c_dateForm.controls.year_onedateyy.value;
        const year = yearValue instanceof Date ? yearValue.getFullYear() : Number(yearValue);
        if (year) {
          compareStart = new Date(year, 0, 1);
          compareEnd = new Date(year, 11, 31);
        }
        break;
      }
      case 'SAD': {
        compareStart = this.c_dateForm.controls.sad_startdate.value;
        compareEnd = this.c_dateForm.controls.sad_enddate.value;
        break;
      }
    }
    this.queryForm.controls.CompareDateFrom.setValue(compareStart);
    this.queryForm.controls.CompareDateTo.setValue(compareEnd);
  }

  onClearDate(): void {
    this.dateForm.reset({ reportType: 'DAY', onedatedd: today });
    this.c_dateForm.reset({ onedatedd: yesterday });
    this.onReportTypeChange('DAY');
    this.setReadOnlyFields();
    this.syncDateToQueryForm();
    this.data = [];
    this.totalRecords = 0;
    this.footerTotal = null;
  }

  private getWeekNumber(d: Date): string {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayNum = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - dayNum);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return String(weekNo);
  }

  private getDateRangeByYearWeek(year: number, week: number): { weekStart: Date; weekEnd: Date } {
    const simple = new Date(year, 0, 4);
    const dayOfWeek = simple.getDay() || 7;
    const firstWeekMonday = new Date(simple);
    firstWeekMonday.setDate(simple.getDate() - dayOfWeek + 1);
    const weekStart = new Date(firstWeekMonday);
    weekStart.setDate(firstWeekMonday.getDate() + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { weekStart, weekEnd };
  }
}