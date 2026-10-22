import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, map } from 'rxjs';
import { CategorySelectComponent } from 'src/app/shared/biz-components/category-select/category-select.component';
import { formatAmount, formatAmountCN } from '../../../others/component/table/table.model';
import { TLS32010Data, TLS32010QueryRequest, TLS32010Service } from '../../../service/api/tls/tls32010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { applyDisplayStatusVisibility } from '../TLS30000/common/report-display-status.util';

@Component({
  selector: 'app-tls32010',
  templateUrl: './tls32010.component.html',
  standalone: true,
  imports: [CategorySelectComponent, ButtonModule, CalendarRangeComponent, CalendarComponent, TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule, RadiobuttonComponent, DropdownComponent, NgIf, MultiSelectComponent, CalendarRangeComponent, CheckboxModule,]
})
export class TLS32010Component extends BasicQueryPageComponent<TLS32010Data> implements OnInit {
  @ViewChild('dt') tableReport!: TableReportComponent;
  queryForm = this.formBuilder.group({
    // 日期查詢條件
    reportType: ['1'], // 報表類型（預設區間營業報表）
    // 日營業報表
    // 週營業報表
    year: [new Date()], // 修正：預設為一個 Date 物件
    week: [null as number | null], // 修正：預設為 null
    // 月營業報表
    month: [null as number | null],
    // 半年營業報表
    halfYear: [null as number | null],
    // 年營業報表
    // 區間營業報表
    // 活動區間營業報表
    eventID: [null], // 活動ID

    DateFrom: [null as Date | null, [Validators.required]], // 區間開始日期
    DateTo: [null as Date | null, [Validators.required]], // 區間結束日期
    // 合約查詢條件
    BuildingList: [null], // 館別
    FloorList: [null], // 樓層
    AreaList: [null], // 區域
    category: [null],
    CabinetKindList: [null], // 櫃別
    TermTypeList: [null], // 抽成別
    OrgList: [null], // 組織代號
    TltNoList: [null], // 專櫃編號
    TaxFlag: ['1'], // 是否含稅
    PreSale: [false],
    ConsumerNum: [false],
  });
  totalRecords = 0;
  historyRequestBody: TLS32010QueryRequest | null = null;
  data: TLS32010Data[] = [];

  isPreSale = this.queryForm.get('PreSale')?.value ?? false;
  isConsumerNum = this.queryForm.get('ConsumerNum')?.value ?? false;

  columns: ReportColumn[] = [
    { field: 'BuildingDesc', header: '館別', align: 'left' },
    { field: 'OrgName', header: '組織名稱', align: 'left' },
    { field: 'CabinetKindName', header: '櫃別', align: 'left' },
    { field: 'TltNo', header: '櫃位編號', align: 'left', groupField: '單位' },
    { field: 'TltName', header: '櫃位名稱', align: 'left', groupField: '單位' },
    { field: 'LocationNoList', header: '位置編號', align: 'left', groupField: '單位' },
    { field: 'TltSpace', header: '坪數', align: 'right', format: (value) => formatAmountWithDecimals(value, 2) },
    { field: 'Budget', header: '營業目標', align: 'right', format: formatAmount },
    { field: 'SaleAmt', header: '營業實績', align: 'right', format: formatAmount },
    { field: 'CustCnt', header: '交易筆數', align: 'right', format: formatAmount },
    { field: 'AvgTicketAmt', header: '客單價', align: 'right', format: formatAmount },
    { field: 'MonthlySpaceEfficiency', header: '月坪效', align: 'right', format: formatAmount, visible: false, cellClass: (row, type) => this.partialPeriodClass(row, type) },
    { field: 'MonthlySpaceContrib', header: '月坪貢獻', align: 'right', format: formatAmount, visible: false, cellClass: (row, type) => this.partialPeriodClass(row, type) },
    { field: 'AchievementRate', header: '達成率', align: 'right', format: (value: number) => value ? `${value.toFixed(1)}%` : '0.0%' },
    { field: 'TltSpaceRank', header: '坪數', align: 'right', groupField: '排名順位' },
    { field: 'BudgetRank', header: '營業目標', align: 'right', format: formatAmountCN, groupField: '排名順位' },
    { field: 'SaleAmtRank', header: '營業實績', align: 'right', format: formatAmountCN, groupField: '排名順位' },
    { field: 'CustCntRank', header: '交易筆數', align: 'right', groupField: '排名順位' },
    { field: 'AvgTicketAmtRank', header: '客單價', align: 'right', format: formatAmountCN, groupField: '排名順位' },
    { field: 'MonthlySpaceEfficiencyRank', header: '月坪效', align: 'right', format: formatAmountCN, groupField: '排名順位', visible: false },
    { field: 'AchievementRateRank', header: '達成率', align: 'right', format: formatAmountCN, groupField: '排名順位' },
    // { field: 'PreOrderAmt', header: '預售業績', align: 'right', format: formatAmountCN },
    { field: 'PreOrderAmt', header: '預售業績', visible: this.isPreSale, format: formatAmount, align: 'right', isTotal: true },
    { field: 'ConsumerNum', header: '消費人數', visible: this.isConsumerNum, format: formatAmount, align: 'right', isTotal: true },
    { field: 'ConsumerOrder', header: '消費客單', visible: this.isConsumerNum, format: formatAmount, align: 'right', isTotal: true },
  ];
  columnGroup = [
    { field: '單位', header: '單位' },
    { field: '排名順位', header: '排名順位' }
  ];
  footerData: TLS32010Data | null = null;
  reportTypeOptions = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
    { value: '7', label: '活動區間營業報表' }
  ];
  auditoriumOptions = this.dropdown.querySys3800();
  organizationOptions = this.dropdown.querySys3100();
  regionOptions = this.dropdown.querySys3A00();
  floorOptions = this.dropdown.querySys3900();
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  operationsOptions = getSYS1000Options('TLT_Kind');
  counterCodeOptions = this.dropdown.queryTltTalent();
  EventIDOptions = this.dropdown.queryTALPORDERM_DropDownListShare().pipe(
    map(data => {
      if (!data) return null;
      return data.map(item => {
        const sdate = this.datePipe.transform(item['pod_sdate'], 'yyyy/MM/dd');
        const edate = this.datePipe.transform(item['pod_edate'], 'yyyy/MM/dd');
        return {
          label: `${item['pod_no']}/${item['pod_desc']} ${sdate} ~ ${edate}`,
          value: item['pod_no'],
          pod_sdate: item['pod_sdate'],
          pod_edate: item['pod_edate'],
        };
      });
    })
  );
  taxOptions = [{ value: '1', label: '是' }, { value: '2', label: '否' }];
  monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1, label: `${i + 1} 月`
  }));
  weekOptions: { value: number, label: string }[] = [];
  halfYearOptions = [{ value: 1, label: '上半年' }, { value: 2, label: '下半年' }];
  btnLoading = false;
  private formattedEventOptions: Option[] = [];
  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls32010Service: TLS32010Service,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS32010');
    // 初始化週次選項
    const initialYear = this.queryForm.controls.year.value;
    if (initialYear) {
      this.setWeekOptions(initialYear);
    }

    // 訂閱 reportType 變化，切換時重設 year/week/month 避免髒數據
    this.queryForm.controls.reportType.valueChanges.pipe(untilDestroyed(this)).subscribe(type => {
      // 重設非當前報表類型的日期控制項 (同時重設 year 避免跨報表污染)
      this.queryForm.controls.year.setValue(new Date(), { emitEvent: false });
      this.queryForm.controls.week.setValue(null, { emitEvent: false });
      this.queryForm.controls.month.setValue(null, { emitEvent: false });
      this.queryForm.controls.halfYear.setValue(null, { emitEvent: false }); // 新增：重設 halfYear
      if (type === '2') {
        const currentYear = this.queryForm.controls.year.value;
        if (currentYear) {
          this.setWeekOptions(currentYear); // 切回週報表時重新設定週次選項
        }
      } else if (type === '3') { // 新增：月報表處理邏輯
        // 預設選中當前月份
        this.queryForm.controls.month.setValue(new Date().getMonth() + 1);
        // 切換後立即計算日期
        this.calculateMonthRange(this.queryForm.controls.year.value, this.queryForm.controls.month.value);
      } else if (type === '4') { // 新增：半年報表處理邏輯
        // 預設選中當前半年別 (1:上半年, 2:下半年)
        const currentMonth = new Date().getMonth() + 1;
        const defaultHalfYear = currentMonth <= 6 ? 1 : 2;
        this.queryForm.controls.halfYear.setValue(defaultHalfYear);
        // 切換後立即計算日期
        this.calculateHalfYearRange(this.queryForm.controls.year.value, this.queryForm.controls.halfYear.value);
      } else if (type === '5') { // 新增：年報表處理邏輯
        // 預設選中當前年份，並立即計算日期
        this.calculateYearRange(this.queryForm.controls.year.value);
      } else if (type === '7') { // 活動區間報表
        // 如果已選定活動，則自動更新日期範圍
        this.updateDateRangeByEventID(this.queryForm.controls.eventID.value);
      }
    });

    // 週報表 (保留原邏輯)
    // 訂閱 year 和 week 欄位變化，當兩者都有值時，觸發日期計算
    this.queryForm.controls.year.valueChanges.pipe(untilDestroyed(this)).subscribe(year => {
      const reportType = this.queryForm.controls.reportType.value;
      if (reportType === '2') {
        this.setWeekOptions(year);
        this.calculateWeekRange(year, this.queryForm.controls.week.value);
      } else if (reportType === '3') {
        this.calculateMonthRange(year, this.queryForm.controls.month.value);
      } else if (reportType === '4') { // 針對半年報表
        this.calculateHalfYearRange(year, this.queryForm.controls.halfYear.value);
      } else if (reportType === '5') { // 針對年報表
        this.calculateYearRange(year);
      }
    });
    // 週報表
    this.queryForm.controls.week.valueChanges.pipe(untilDestroyed(this)).subscribe(week => {
      if (this.queryForm.controls.reportType.value === '2') {
        this.calculateWeekRange(this.queryForm.controls.year.value, week);
      }
    });
    // 月報表訂閱邏輯
    this.queryForm.controls.month.valueChanges.pipe(untilDestroyed(this)).subscribe(month => {
      if (this.queryForm.controls.reportType.value === '3') {
        this.calculateMonthRange(this.queryForm.controls.year.value, month);
      }
    });
    // 新增：半年報表訂閱邏輯
    this.queryForm.controls.halfYear.valueChanges.pipe(untilDestroyed(this)).subscribe(halfYear => {
      if (this.queryForm.controls.reportType.value === '4') {
        this.calculateHalfYearRange(this.queryForm.controls.year.value, halfYear);
      }
    });
    // 新增：訂閱 EventIDOptions，儲存格式化後的活動清單
    this.EventIDOptions.pipe(untilDestroyed(this)).subscribe(options => {
      if (options) {
        this.formattedEventOptions = options;
      }
    });
    // 新增：監聽 eventID 變化，自動更新 DateFrom 和 DateTo
    this.queryForm.controls.eventID.valueChanges.pipe(untilDestroyed(this)).subscribe(eventID => {
      if (this.queryForm.controls.reportType.value === '7') {
        this.updateDateRangeByEventID(eventID);
      }
    });

    this.queryForm.get('PreSale')?.valueChanges.subscribe(() => {
      this.setColumns();
    });
    this.queryForm.get('ConsumerNum')?.valueChanges.subscribe(() => {
      this.setColumns();
    });
  }
  /**
     * 根據年份設定週次選項 (1~53)
     * @param year Date object
     */
  setWeekOptions(year: Date | null): void {
    if (!year) return;
    // 簡化處理：這裡假設一年最大週數為 53 (需根據您使用的 ISO 或 U.S. 標準調整)
    // 實際精確計算需考慮 ISO 8601 標準，但這裡為了簡單，先取 53
    const maxWeeks = 53;

    this.weekOptions = Array.from({ length: maxWeeks }, (_, i) => ({
      value: i + 1, label: `第 ${i + 1} 週`
    }));
    // 如果當前選擇的週次大於新年份的最大週數，則重設週次
    if (this.queryForm.controls.week.value && this.queryForm.controls.week.value > maxWeeks) {
      this.queryForm.controls.week.setValue(null, { emitEvent: false }); // 設置值時不觸發 change event 避免循環
    }
  }

  /**
   * 計算選定週次的起始日期和結束日期，並更新 DateFrom 和 DateTo
   * @param year 年份 (Date Object)
   * @param week 週次 (number)
   */
  calculateWeekRange(year: Date | null, week: number | null): void {
    if (!year || !week || week < 1) {
      this.queryForm.controls.DateFrom.setValue(null);
      this.queryForm.controls.DateTo.setValue(null);
      return;
    }
    const yearNum = year.getFullYear();
    // === 日期計算邏輯 (假設使用 **星期一** 作為一週的開始 - ISO 標準) ===
    // 1. 獲取該年 1 月 4 日，這天肯定在 ISO 週曆的第一週
    const jan4 = new Date(yearNum, 0, 4);
    // 2. 找到 Jan 4 所在的星期一（ISO: getDay() 0=日, 1=一... 6=六；ISO: 1=一... 7=日）
    // 透過 (day + 6) % 7 獲得 ISO weekday (1=一, 7=日)
    const dayOfWeek = jan4.getDay() === 0 ? 7 : jan4.getDay(); // 調整為 1=一 ~ 7=日
    // 計算該年第一週的星期一
    // jan4 減去 (dayOfWeek - 1) 天，就是第一週的星期一
    const firstMonday = new Date(jan4);
    firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);
    // 3. 計算目標週的起始日期 (DateFrom):
    // 從該年第一週的星期一開始，加上 (week - 1) 週
    const dateFrom = new Date(firstMonday);
    dateFrom.setDate(firstMonday.getDate() + (week - 1) * 7);
    // 4. 計算目標週的結束日期 (DateTo):
    // 在起始日期的基礎上加上 6 天
    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateFrom.getDate() + 6);
    // 更新表單欄位
    this.queryForm.controls.DateFrom.setValue(dateFrom, { emitEvent: false }); // 不觸發 event 避免循環
    this.queryForm.controls.DateTo.setValue(dateTo, { emitEvent: false }); // 不觸發 event 避免循環
  }
  /**
     * 計算選定月份的起始日期和結束日期，並更新 DateFrom 和 DateTo
     * @param year 年份 (Date Object)
     * @param month 月份 (number, 1-12)
     */
  calculateMonthRange(year: Date | null, month: number | null): void {
    if (!year || !month || month < 1 || month > 12) {
      this.queryForm.controls.DateFrom.setValue(null);
      this.queryForm.controls.DateTo.setValue(null);
      return;
    }
    const yearNum = year.getFullYear();
    // 1. 起始日期 (該月 1 日)
    // 注意：JS Date 的月份是 0-11，所以 month 1-12 要減 1
    const dateFrom = new Date(yearNum, month - 1, 1);
    // 2. 結束日期 (下個月 0 日，即該月的最後一天)
    const dateTo = new Date(yearNum, month, 0);
    // 更新表單欄位
    this.queryForm.controls.DateFrom.setValue(dateFrom, { emitEvent: false });
    this.queryForm.controls.DateTo.setValue(dateTo, { emitEvent: false });
  }
  /**
   * 計算選定半年的起始日期和結束日期，並更新 DateFrom 和 DateTo
   * @param year 年份 (Date Object)
   * @param halfYear 半年別 (number, 1=上半年, 2=下半年)
   */
  calculateHalfYearRange(year: Date | null, halfYear: number | null): void {
    if (!year || !halfYear || (halfYear !== 1 && halfYear !== 2)) {
      this.queryForm.controls.DateFrom.setValue(null);
      this.queryForm.controls.DateTo.setValue(null);
      return;
    }
    const yearNum = year.getFullYear();
    let dateFrom: Date;
    let dateTo: Date;
    if (halfYear === 1) {
      // 上半年 (1月1日 到 6月30日)
      dateFrom = new Date(yearNum, 0, 1); // 1月 (索引 0) 1日
      dateTo = new Date(yearNum, 6, 0); // 7月 (索引 6) 的第 0 天，即 6月30日
    } else { // halfYear === 2
      // 下半年 (7月1日 到 12月31日)
      dateFrom = new Date(yearNum, 6, 1); // 7月 (索引 6) 1日
      dateTo = new Date(yearNum, 12, 0); // 次年 1月 (索引 12) 的第 0 天，即 12月31日
    }
    // 更新表單欄位
    this.queryForm.controls.DateFrom.setValue(dateFrom, { emitEvent: false });
    this.queryForm.controls.DateTo.setValue(dateTo, { emitEvent: false });
  }
  /**
   * 計算選定年度的起始日期和結束日期，並更新 DateFrom 和 DateTo
   * @param year 年份 (Date Object)
   */
  calculateYearRange(year: Date | null): void {
    if (!year) {
      this.queryForm.controls.DateFrom.setValue(null);
      this.queryForm.controls.DateTo.setValue(null);
      return;
    }
    const yearNum = year.getFullYear();
    // 1. 起始日期 (該年 1 月 1 日)
    const dateFrom = new Date(yearNum, 0, 1); // 1月 (索引 0) 1日
    // 2. 結束日期 (次年 1 月 0 日，即該年 12 月 31 日)
    const dateTo = new Date(yearNum + 1, 0, 0);
    // 更新表單欄位
    this.queryForm.controls.DateFrom.setValue(dateFrom, { emitEvent: false });
    this.queryForm.controls.DateTo.setValue(dateTo, { emitEvent: false });

    console.log(`選擇 ${yearNum} 年度: ${this.datePipe.transform(dateFrom, 'yyyy-MM-dd')} ~ ${this.datePipe.transform(dateTo, 'yyyy-MM-dd')}`);
  }
  /**
   * 根據選定的 eventID 查找活動的起始和結束日期，並更新 DateFrom 和 DateTo
   * @param eventID 選定的活動 ID (pod_no)
   */
  updateDateRangeByEventID(eventID: string | null): void {
    if (!eventID) {
      this.queryForm.controls.DateFrom.setValue(null, { emitEvent: false });
      this.queryForm.controls.DateTo.setValue(null, { emitEvent: false });
      return;
    }
    const selectedEvent = this.formattedEventOptions.find(opt => opt.value === eventID);
    if (selectedEvent && selectedEvent['pod_sdate'] && selectedEvent['pod_edate']) {
      const dateFrom = new Date(selectedEvent['pod_sdate']);
      const dateTo = new Date(selectedEvent['pod_edate']);
      this.queryForm.controls.DateFrom.setValue(dateFrom, { emitEvent: false });
      this.queryForm.controls.DateTo.setValue(dateTo, { emitEvent: false });
    } else {
      this.queryForm.controls.DateFrom.setValue(null, { emitEvent: false });
      this.queryForm.controls.DateTo.setValue(null, { emitEvent: false });
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const cat = formValue.category || { bus_type: [], bus_class: [], bus_sclass: [] };

      // 確保明確取得 boolean 值
      const isPreSale = formValue.PreSale === true;
      const isConsumerNum = formValue.ConsumerNum === true;

      const body: TLS32010QueryRequest = {
        ...formValue,
        PreSale: isPreSale,
        ConsumerNum: isConsumerNum,
        BusTypeList: cat.bus_type,
        BusClassList: cat.bus_class?.map((c: any) => [c.bus_type, c.No]),
        BusSClassList: cat.bus_sclass?.map((s: any) => [s.bus_type, s.bus_class, s.No]),
        BuildingList: formValue.BuildingList,
        FloorList: formValue.FloorList,
        AreaList: formValue.AreaList,
        CabinetKindList: formValue.CabinetKindList,
        TermTypeList: formValue.TermTypeList,
        OrgList: formValue.OrgList,
        TltNoList: formValue.TltNoList,
        DateFrom: this.datePipe.transform(formValue.DateFrom, 'yyyy-MM-dd'),
        DateTo: this.datePipe.transform(formValue.DateTo, 'yyyy-MM-dd'),
        year: undefined,
        week: undefined,
        month: undefined,
        halfYear: undefined,
        category: undefined
      } as TLS32010QueryRequest;

      this.tls32010Service.queryTLS32010(body).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        this.historyRequestBody = body; // 這時候歷史請求參數就確定包含了正確的 PreSale 與 ConsumerNum 布林值
        this.setMonthlySpaceColumnsVisible(['3', '4', '5'].includes(formValue.reportType ?? ''));

        const rawData = response.Data || [];
        if (rawData.length > 0) {
          const lastIndex = rawData.length - 1;
          const lastRow = rawData[lastIndex];
          if (lastRow.RowNo === null || lastRow.BuildingDesc === '總計') {
            this.footerData = { ...lastRow, BuildingDesc: '' };
            this.data = rawData.slice(0, lastIndex);
          } else {
            this.data = rawData;
            this.footerData = null;
          }
          this.totalRecords = response.TotalCount;
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.footerData = null;
        }
      });
    });
  }
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.updateSortAndFormStateForExport();
    const export$ = this.tls32010Service.exportTLS32010PDF(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.updateSortAndFormStateForExport();
    const export$ = this.tls32010Service.exportTLS32010Excel(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  private updateSortAndFormStateForExport() {
    if (this.historyRequestBody) {
      // 1. 同步最新排序
      if (this.tableReport) {
        const currentSort = this.tableReport.multiSortMeta;
        this.historyRequestBody.SortBy = currentSort.length > 0 ? currentSort : undefined;
      }
      // 2. 同步最新勾選狀態 (避免查詢後勾選開關直接匯出沒刷新的問題)
      this.historyRequestBody.PreSale = this.queryForm.get('PreSale')?.value === true;
      this.historyRequestBody.ConsumerNum = this.queryForm.get('ConsumerNum')?.value === true;
    }
  }

  private partialPeriodClass(row: TLS32010Data, type?: string): string {
    if (type === 'footer' || type === 'subtotal') return '';
    const isMonthly = ['3', '4', '5'].includes(this.historyRequestBody?.reportType ?? '');
    return isMonthly && row.IsPartialPeriod === 1 ? 'text-red-500' : '';
  }

  private setMonthlySpaceColumnsVisible(visible: boolean) {
    const fields = ['MonthlySpaceEfficiency', 'MonthlySpaceContrib', 'MonthlySpaceEfficiencyRank'];
    this.columns = this.columns.map(col => fields.includes(col.field) ? { ...col, visible } : col);
  }

  setColumns() {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: this.queryForm.get('PreSale')?.value === true,
      consumerNum: this.queryForm.get('ConsumerNum')?.value === true,
      preSaleField: 'PreOrderAmt',
    });
  }
}
