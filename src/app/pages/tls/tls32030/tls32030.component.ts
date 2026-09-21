import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { formatPercentage } from '@others/component/table/table.model';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BusClassItem, BusSClassItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { formatAmount, formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, map, startWith } from 'rxjs';
import { CategorySelectComponent } from 'src/app/shared/biz-components/category-select/category-select.component';
import { LocationSplitPipe } from 'src/app/shared/pipes/location-split.pipe';
import { TLS32030Data, TLS32030FooterData, TLS32030Service } from '../../../service/api/tls/tls32030.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { applyDisplayStatusVisibility } from '../TLS30000/common/report-display-status.util';


@Component({
  selector: 'app-tls32030',
  templateUrl: './tls32030.component.html',
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
    AsyncPipe,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,
    MenubarComponent,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    TableReportComponent,
    CheckboxModule,
    NgFor,
    LocationSplitPipe,
    CategorySelectComponent
  ]
})
export class TLS32030Component extends BasicQueryPageComponent<TLS32030Data> implements OnInit {
  public readonly tls32030Service = inject(TLS32030Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly fileExportService = inject(FileExportService);
  queryForm = this.formBuilder.group({
    DayType: ['3' as string | null],
    BaseDateFrom: [null as Date | null, [Validators.required]],
    BaseDateTo: [null as Date | null, [Validators.required]],
    day: [null as Date | null], // 日營業報表：單一比較日期
    year: [null as Date | null],
    week: [null as number | null],
    month: [null as number | null],
    halfYear: [null as number | null],
    CompareDateFrom: [null as Date | null, [Validators.required]],
    CompareDateTo: [null as Date | null, [Validators.required]],
    CompareDay: [null as Date | null], // 日營業報表：單一基準日期
    CompareYear: [null as Date | null],
    CompareWeek: [null as number | null],
    CompareMonth: [null as number | null],
    CompareHalfYear: [null as number | null],
    FloorList: [""],
    AreaList: [""],
    BuildingList: [""],
    category: [null as { bus_type: string[]; bus_class: BusClassItem[]; bus_sclass: BusSClassItem[] } | null],
    TltKindList: [""],
    OrgList: [""],
    TltNoList: [""],
    TermTypeList: [null],
    AmtTaxMode: ['G'],
    ReceFilter: ['A'],
    PreSale: [false],
    ConsumerNum: [false],
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'TltNo', order: -1 }]],
  });
  data: TLS32030Data[] = [];
  footerData: TLS32030FooterData | null = null;
  totalRecords = 0;
  selectedItems: TLS32030Data[] = [];
  pdfBtnLoading = false;
  excelBtnLoading = false;
  isPreSale = this.queryForm.get('PreSale')?.value ?? false;
  isConsumerNum = this.queryForm.get('ConsumerNum')?.value ?? false;
  DayTypeOptions = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
  ];
  taxOptions = [{ value: 'G', label: '是' }, { value: 'N', label: '否' }];
  auditoriumOptions = this.dropdown.querySys3800();
  organizationOptions = this.dropdown.querySys3100();
  regionOptions = this.dropdown.querySys3A00();
  floorOptions = this.dropdown.querySys3900();
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  operationsOptions = getSYS1000Options('TLT_Kind');
  // 僅本頁做去重顯示：依「櫃號+標準化櫃名」分組去重、label 不含起訖日，不動共用API本身（TLS32060等其他呼叫端不受影響）
  counterCodeOptions = this.dropdown.queryTltTalentContractHistory().pipe(
    map(options => this.dedupeCounterCodeOptions(options))
  );
  // 供 onSubmit 把勾選到的talent_id對照換算回tlt_no用；counterCodeOptions 是 shareReplay(1)，這裡再訂閱一次不會多打API
  private talentContractOptions: Option[] = [];

  // 同一櫃號+標準化後同名的合約只留排序後第一筆(API本身已依生效中優先/櫃號/起始日排序)，label 改為「櫃號 - 櫃名」不含日期
  private dedupeCounterCodeOptions(options: Option[] | null): Option[] | null {
    if (!options) return options;
    const seen = new Set<string>();
    const result: Option[] = [];
    for (const opt of options) {
      const tltNo = opt['tlt_no'] ?? '';
      const tltName = opt['tlt_name'] ?? '';
      const normalizedName = String(tltName).replace(/\s+/g, '');
      const key = `${tltNo}__${normalizedName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ ...opt, label: `${tltNo} - ${tltName}` });
    }
    return result;
  }
  ReceFilterOptions = [
    { value: 'A', label: '全部' },
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];
  monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1} 月` }));
  weekOptions: { value: number, label: string }[] = [];
  halfYearOptions = [{ value: 1, label: '上半年' }, { value: 2, label: '下半年' }];
  columns: ReportColumn[] = [
    { field: 'building_desc', header: '館別', align: 'left' },
    { field: 'Org_Name', header: '組織', align: 'left' },
    { field: 'SYS_Name', header: '櫃別', align: 'left' },
    { field: 'TltNo', header: '專櫃編號', align: 'left' },
    { field: 'TltName', header: '專櫃名稱', align: 'left' },

    { field: 'Comp_LocationNo', header: '位置編號', align: 'left', groupField: '比較' },
    { field: 'Comp_Space', header: '坪數', align: 'right', groupField: '比較', format: (value) => formatAmountWithDecimals(value, 2) },
    { field: 'Comp_SaleAmt', header: '銷售總金額', align: 'right', groupField: '比較', format: formatAmount },
    { field: 'Comp_TxnCnt', header: '交易筆數', align: 'right', groupField: '比較', format: formatAmount },
    { field: 'Comp_Target', header: '目標', align: 'right', width: '75px', groupField: '比較', format: formatAmount },
    { field: 'Comp_DaySpaceEff', header: '日坪效', align: 'right', groupField: '比較', format: formatAmount },
    { field: 'Comp_AchieveRate', header: '達成率', align: 'right', groupField: '比較', format: (value) => formatPercentage(value, 2) },
    { field: 'Comp_AvgTicket', header: '客單價', align: 'right', groupField: '比較', format: formatAmount },
    { field: 'Comp_PrePerformance', header: '預售實績', align: 'right', groupField: '比較', format: formatAmount, visible: this.isPreSale },
    { field: 'Comp_ConsumerNum', header: '消費人數', align: 'right', groupField: '比較', format: formatAmount, visible: this.isConsumerNum },
    { field: 'Comp_ConsumerOrder', header: '消費客單', align: 'right', groupField: '比較', format: formatAmount, visible: this.isConsumerNum },
    { field: 'Base_LocationNo', header: '位置編號', align: 'left', groupField: '基準' },
    { field: 'Base_Space', header: '坪數', align: 'right', groupField: '基準', format: (value) => formatAmountWithDecimals(value, 2) },
    { field: 'Base_SaleAmt', header: '銷售總金額', align: 'right', groupField: '基準', format: formatAmount },
    { field: 'Base_TxnCnt', header: '交易筆數', align: 'right', groupField: '基準', format: formatAmount },
    { field: 'Base_Target', header: '目標', align: 'right', width: '75px', groupField: '基準', format: formatAmount },
    { field: 'Base_DaySpaceEff', header: '日坪效', align: 'right', groupField: '基準', format: formatAmount },
    { field: 'Base_AchieveRate', header: '達成率', align: 'right', groupField: '基準', format: (value) => formatPercentage(value, 2) },
    { field: 'Base_AvgTicket', header: '客單價', align: 'right', groupField: '基準', format: formatAmount },
    { field: 'Base_PrePerformance', header: '預售實績', align: 'right', groupField: '基準', format: formatAmount, visible: this.isPreSale },
    { field: 'Base_ConsumerNum', header: '消費人數', align: 'right', groupField: '基準', format: formatAmount, visible: this.isConsumerNum },
    { field: 'Base_ConsumerOrder', header: '消費客單', align: 'right', groupField: '基準', format: formatAmount, visible: this.isConsumerNum },
    { field: 'Diff_SaleAmt', header: '銷售總金額', align: 'right', groupField: '差異', format: formatAmount },
    { field: 'Diff_TxnCnt', header: '交易筆數', align: 'right', groupField: '差異', format: formatAmount },
    { field: 'Diff_Target', header: '目標', width: '75px', align: 'right', groupField: '差異', format: formatAmount },
    { field: 'Diff_DaySpaceEff', header: '日坪效', align: 'right', groupField: '差異', format: formatAmount },
    { field: 'Diff_AchieveRate', header: '達成率', align: 'right', groupField: '差異', format: (value) => formatPercentage(value, 2) },
    { field: 'Diff_AvgTicket', header: '客單價', align: 'right', groupField: '差異', format: formatAmount },
    { field: 'Diff_PrePerformance', header: '預售實績', align: 'right', groupField: '差異', format: formatAmount, visible: this.isPreSale },
    { field: 'Diff_ConsumerNum', header: '消費人數', align: 'right', groupField: '差異', format: formatAmount, visible: this.isConsumerNum },
    { field: 'Diff_ConsumerOrder', header: '消費客單', align: 'right', groupField: '差異', format: formatAmount, visible: this.isConsumerNum },
    { field: 'Growth_SaleAmtPct', header: '銷售總金額', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2) },
    { field: 'Growth_TxnCntPct', header: '交易筆數', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2) },
    { field: 'Growth_TargetPct', header: '營業目標(預算)', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2) },
    { field: 'Growth_DaySpaceEffPct', header: '日坪效', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2) },
    { field: 'Growth_AchieveRatePct', header: '達成率', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2) },
    { field: 'Growth_AvgTicketPct', header: '客單價', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2) },
    { field: 'Growth_PrePerformancePct', header: '預售實績', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2), visible: this.isPreSale },
    { field: 'Growth_ConsumerNumPct', header: '消費人數', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2), visible: this.isConsumerNum },
    { field: 'Growth_ConsumerOrderPct', header: '消費客單', align: 'right', groupField: '成長率', format: (value) => formatPercentage(value, 2), visible: this.isConsumerNum },
  ];
  columnGroup = [
    { header: '基準', field: '基準' },
    { header: '比較', field: '比較' },
    { header: '差異', field: '差異' },
    { header: '成長率', field: '成長率' }
  ];
  private formatListForBackend(list: any[] | string | null | undefined): string | null {
    if (Array.isArray(list) && list.length > 0) return list.map(x => String(x)).join(',');
    if (typeof list === 'string' && list.trim() !== '') return list;
    return null;
  }

  // 把勾選到的talent_id(下拉每筆合約獨立選項)對照本次下拉結果換算回對應tlt_no並去重
  private mapTalentIdsToTltNoList(talentIds: any): string | null {
    const ids: any[] = Array.isArray(talentIds) ? talentIds : [];
    const tltNos = ids
      .map(id => this.talentContractOptions.find(opt => opt.value === id)?.['tlt_no'])
      .filter((tltNo): tltNo is string => !!tltNo);
    const unique = Array.from(new Set(tltNos));
    return unique.length > 0 ? unique.join(',') : null;
  }
  ngOnInit(): void {
    this.initializePage('TLS32030', 'tls/tls32030', this.queryForm, f => this.onSubmit(f));
    this.counterCodeOptions.pipe(untilDestroyed(this)).subscribe(options => {
      this.talentContractOptions = options || [];
    });
    this.columns = this.columns.map((col): ReportColumn => ({
      ...col,
      cellClass: () => {
        switch (col.groupField) {
          case '基準': return 'bg-group-base';
          case '比較': return 'bg-group-compare';
          case '差異': return 'bg-group-diff';
          case '成長率': return 'bg-group-growth';
          default: return '';
        }
      },
      // 確保如果有個別欄位自己寫的 format，就優先用它自己的（位置編號需要這行生效）
      format: col.format ? col.format : undefined
    }));
    this.setWeekOptions(this.queryForm.controls.year.value);
    this.queryForm.controls.DayType.valueChanges.pipe(startWith(this.queryForm.controls.DayType.value), untilDestroyed(this)).subscribe(type => {
      // 【修改】切換 DayType 時，純粹清空所有輔助與日期欄位，不給予任何預設值
      this.queryForm.controls.day.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareDay.setValue(null, { emitEvent: false });
      this.queryForm.controls.year.setValue(null, { emitEvent: false });
      this.queryForm.controls.week.setValue(null, { emitEvent: false });
      this.queryForm.controls.month.setValue(null, { emitEvent: false });
      this.queryForm.controls.halfYear.setValue(null, { emitEvent: false });

      this.queryForm.controls.CompareYear.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareWeek.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareMonth.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareHalfYear.setValue(null, { emitEvent: false });

      this.queryForm.controls.BaseDateFrom.setValue(null, { emitEvent: false });
      this.queryForm.controls.BaseDateTo.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareDateFrom.setValue(null, { emitEvent: false });
      this.queryForm.controls.CompareDateTo.setValue(null, { emitEvent: false });
      if (type === '2') this.setWeekOptions(null);
    });
    // 訂閱欄位變化後重新計算區間（若有值才計算）
    this.queryForm.controls.day.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareDay.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.year.valueChanges.pipe(untilDestroyed(this)).subscribe(year => {
      this.setWeekOptions(year);
      this.calculateDateRanges(this.queryForm.controls.DayType.value);
    });
    this.queryForm.controls.week.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.month.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.halfYear.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));

    this.queryForm.controls.CompareYear.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareWeek.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareMonth.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.controls.CompareHalfYear.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.calculateDateRanges(this.queryForm.controls.DayType.value));
    this.queryForm.get('PreSale')?.valueChanges.pipe(untilDestroyed(this)).subscribe((val) => {
      this.setColumns();
      if (this.historyRequestBody) {
        this.historyRequestBody.PreSale = val === true;
      }
    });

    this.queryForm.get('ConsumerNum')?.valueChanges.pipe(untilDestroyed(this)).subscribe((val) => {
      this.setColumns();
      if (this.historyRequestBody) {
        this.historyRequestBody.ConsumerNum = val === true;
      }
    });
  }
  historyRequestBody: any | null = null;
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls32030Service.ExportTLS32030PDF(this.historyRequestBody as any);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.pdfBtnLoading = isLoading).subscribe();
  }
  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls32030Service.ExportTLS32030Excel(this.historyRequestBody as any);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.excelBtnLoading = isLoading).subscribe();
  }
  setWeekOptions(year: Date | null): void {
    if (!year) {
      this.weekOptions = [];
      return;
    }
    const maxWeeks = 53;
    this.weekOptions = Array.from({ length: maxWeeks }, (_, i) => ({ value: i + 1, label: `第 ${i + 1} 週` }));
    if (this.queryForm.controls.week.value && this.queryForm.controls.week.value > maxWeeks) {
      this.queryForm.controls.week.setValue(null, { emitEvent: false });
    }
  }

  calculateDateRanges(type: string | null): void {
    if (!type) return;

    let compareRange: { from: Date, to: Date } | null = null;
    let baseRange: { from: Date, to: Date } | null = null;

    // 1. 日營業報表 (DayType === '1')
    if (type === '1') {
      const compareDay = this.queryForm.controls.day.value;          // 左邊UI: 比較
      const baseDay = this.queryForm.controls.CompareDay.value;       // 右邊UI: 基準

      if (compareDay) compareRange = { from: compareDay, to: compareDay };
      if (baseDay) baseRange = { from: baseDay, to: baseDay };

      this.queryForm.controls.CompareDateFrom.setValue(compareRange?.from || null, { emitEvent: false });
      this.queryForm.controls.CompareDateTo.setValue(compareRange?.to || null, { emitEvent: false });
      this.queryForm.controls.BaseDateFrom.setValue(baseRange?.from || null, { emitEvent: false });
      this.queryForm.controls.BaseDateTo.setValue(baseRange?.to || null, { emitEvent: false });
      return;
    }

    // 2. 週/月/半年/年 營業報表 (DayType 2 ~ 5)
    const compareYear = this.queryForm.controls.year.value;           // 左邊UI: 比較
    const compareWeek = this.queryForm.controls.week.value;
    const compareMonth = this.queryForm.controls.month.value;
    const compareHalfYear = this.queryForm.controls.halfYear.value;

    const baseYear = this.queryForm.controls.CompareYear.value;       // 右邊UI: 基準
    const baseWeek = this.queryForm.controls.CompareWeek.value;
    const baseMonth = this.queryForm.controls.CompareMonth.value;
    const baseHalfYear = this.queryForm.controls.CompareHalfYear.value;

    if (!compareYear || !baseYear) return;

    const compareYearNum = compareYear.getFullYear();
    const baseYearNum = baseYear.getFullYear();

    switch (type) {
      case '2': // 週
        if (compareWeek) compareRange = this.getWeekRange(compareYearNum, compareWeek);
        if (baseWeek) baseRange = this.getWeekRange(baseYearNum, baseWeek);
        break;
      case '3': // 月
        if (compareMonth) compareRange = this.getMonthRange(compareYearNum, compareMonth);
        if (baseMonth) baseRange = this.getMonthRange(baseYearNum, baseMonth);
        break;
      case '4': // 半年
        if (compareHalfYear) compareRange = this.getHalfYearRange(compareYearNum, compareHalfYear);
        if (baseHalfYear) baseRange = this.getHalfYearRange(baseYearNum, baseHalfYear);
        break;
      case '5': // 年
        compareRange = this.getYearRange(compareYearNum);
        baseRange = this.getYearRange(baseYearNum);
        break;
    }

    // 正確對齊賦值：左邊算出的塞給 Compare，右邊算出的塞給 Base
    this.queryForm.controls.CompareDateFrom.setValue(compareRange?.from || null, { emitEvent: false });
    this.queryForm.controls.CompareDateTo.setValue(compareRange?.to || null, { emitEvent: false });
    this.queryForm.controls.BaseDateFrom.setValue(baseRange?.from || null, { emitEvent: false });
    this.queryForm.controls.BaseDateTo.setValue(baseRange?.to || null, { emitEvent: false });
  }

  private getMonthRange(yearNum: number, month: number): { from: Date, to: Date } | null {
    if (month < 1) return this.getMonthRange(yearNum - 1, 12);
    if (month > 12) return this.getMonthRange(yearNum + 1, 1);
    const dateFrom = new Date(yearNum, month - 1, 1);
    const dateTo = new Date(yearNum, month, 0);
    return { from: dateFrom, to: dateTo };
  }

  private getHalfYearRange(yearNum: number, halfYear: number): { from: Date, to: Date } | null {
    let dateFrom: Date;
    let dateTo: Date;
    if (halfYear === 1) {
      dateFrom = new Date(yearNum, 0, 1);
      dateTo = new Date(yearNum, 6, 0);
    } else if (halfYear === 2) {
      dateFrom = new Date(yearNum, 6, 1);
      dateTo = new Date(yearNum, 12, 0);
    } else {
      return null;
    }
    return { from: dateFrom, to: dateTo };
  }

  private getYearRange(yearNum: number): { from: Date, to: Date } | null {
    const dateFrom = new Date(yearNum, 0, 1);
    const dateTo = new Date(yearNum + 1, 0, 0);
    return { from: dateFrom, to: dateTo };
  }

  private getWeekRange(yearNum: number, week: number): { from: Date, to: Date } | null {
    if (week < 1) return this.getPreviousYearLastWeekRange(yearNum - 1);
    const jan4 = new Date(yearNum, 0, 4);
    const dayOfWeek = jan4.getDay() === 0 ? 7 : jan4.getDay();
    const firstMonday = new Date(jan4);
    firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);
    const dateFrom = new Date(firstMonday);
    dateFrom.setDate(firstMonday.getDate() + (week - 1) * 7);
    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateFrom.getDate() + 6);
    return { from: dateFrom, to: dateTo };
  }

  private getPreviousYearLastWeekRange(yearNum: number): { from: Date, to: Date } | null {
    const jan4NextYear = new Date(yearNum + 1, 0, 4);
    const dayOfWeekNextYear = jan4NextYear.getDay() === 0 ? 7 : jan4NextYear.getDay();
    const firstMondayNextYear = new Date(jan4NextYear);
    firstMondayNextYear.setDate(jan4NextYear.getDate() - dayOfWeekNextYear + 1);
    const dateFrom = new Date(firstMondayNextYear);
    dateFrom.setDate(firstMondayNextYear.getDate() - 7);
    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateFrom.getDate() + 6);
    return { from: dateFrom, to: dateTo };
  }
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
      // 分類條件：與 TLS32020 一致，統一交由 app-category-select 維護大/中/小分類的連動關係，
      // 送出時再依代碼組成後端既有的逗號分隔字串格式。
      const cat = formValue.category || { bus_type: [], bus_class: [], bus_sclass: [] };
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
        FloorList: this.formatListForBackend(formValue.FloorList),
        AreaList: this.formatListForBackend(formValue.AreaList),
        BusTypeList: this.formatListForBackend(cat.bus_type),
        BusClassList: this.formatListForBackend(cat.bus_class?.map((c: BusClassItem) => c.No)),
        BusSClassList: this.formatListForBackend(cat.bus_sclass?.map((s: BusSClassItem) => s.No)),
        TltKindList: this.formatListForBackend(formValue.TltKindList),
        OrgList: this.formatListForBackend(formValue.OrgList),
        TltNoList: this.mapTalentIdsToTltNoList(formValue.TltNoList),
        TermTypeList: this.formatListForBackend(formValue.TermTypeList),
        BuildingList: this.formatListForBackend(formValue.BuildingList),
        PreSale: formValue.PreSale === true,
        ConsumerNum: formValue.ConsumerNum === true,
      };

      this.historyRequestBody = body;
      this.tls32030Service.queryTLS32030(body as any).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data ?? [];
        this.footerData = res.footerData ?? null;
        this.totalRecords = res.TotalCount ?? this.data.length;
      });
    });
  }

  setColumns() {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: this.queryForm.get('PreSale')?.value === true,
      consumerNum: this.queryForm.get('ConsumerNum')?.value === true,
      preSaleField: ['Comp_PrePerformance', 'Base_PrePerformance', 'Diff_PrePerformance', 'Growth_PrePerformancePct'],
      consumerNumFields: [
        'Comp_ConsumerNum', 'Base_ConsumerNum', 'Diff_ConsumerNum', 'Growth_ConsumerNumPct',
        'Comp_ConsumerOrder', 'Base_ConsumerOrder', 'Diff_ConsumerOrder', 'Growth_ConsumerOrderPct',
      ],
    });
  }
}
