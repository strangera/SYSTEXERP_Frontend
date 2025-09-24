import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { TLS26050Service, TLS26050Data } from '../../../service/api/tls/tls26050.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '@service/basic/floor.service';
import { RegionService } from '@service/basic/region-code.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { DropdownOption } from '@shared/constants/business.constants';
import { CounterNameService } from '@service/basic/counter-name.service';
import { BusinessClassificationService } from '../tls12040-cru/services/business-classification.service';
import { DropDownListService } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-tls26050',
  templateUrl: './tls26050.component.html',
  styleUrl: './tls26050.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TranslateModule, RadiobuttonComponent, CalendarComponent, DropdownComponent, NgIf, MultiSelectComponent, CalendarRangeQuickComponent, CustomFooterTableComponent,
    DropdownComponent
  ]
})
export class TLS26050Component extends BasicQueryPageComponent<TLS26050Data> implements OnInit {
  readonly today: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    // 日期查詢條件（單選報表類型）
    reportType: ['1'], // 報表類型
    floor: [null], // 樓層
    region: [null], // 區域
    bus_type: [null], // 大分類
    tlt_kind: [null], // 櫃別
    org_id: [null], // 組織代號
    tlt_term_type: [null], // 抽成別
    onedatedd: [this.today], // 日期（日報表）
    onedatedd_c: [this.yesterday], // 比較日期（日報表）
    onedateyy: [null], // 年度（週/半年/年報表）
    weeks: [null], // 週數
    onedatemm: [null], // 年月（月報表）
    halfyear_onedateyy: [null], // 半年報表年度
    halfyear: [null], // 半年別
    year_onedateyy: [null], // 年報表年度
    startdate: [null as string | null], // 開始日期
    enddate: [null as string | null], // 結束日期
    onedateyy_c: [null], // 比較年度（週報表）
    weeks_c: [null], // 比較週數
    startdate_c: [null as string | null], // 比較開始日期（週報表用）
    enddate_c: [null as string | null], // 比較結束日期（週報表用）
    onedatemm_c: [null], // 比較年月（月報表）
    halfyear_onedateyy_c: [null], // 比較半年報表年度
    halfyear_c: [null], // 比較半年別
    year_onedateyy_c: [null], // 比較年報表年度
    sad_startdate: [null], // 區間開始日期
    sad_enddate: [null], // 區間結束日期
    sad_startdate_c: [null], // 比較區間開始日期
    sad_enddate_c: [null], // 比較區間結束日期
    eventID: [null], // 活動ID
    event_startdate: [null], // 活動開始日期
    event_enddate: [null], // 活動結束日期
    eventID_c: [null], // 比較活動ID
    event_startdate_c: [null], // 比較活動開始日期
    event_enddate_c: [null], // 比較活動結束日期
    tlt_no: [null], // 專櫃編號
    tax: [true], // 是否含稅
    bus_class: [null], // 中分類
    ...createPaginationConfig([{ field: 'team_name', order: -1 }])
  });

  totalRecords = 0;
  data: TLS26050Data[] = [];
  footerData: TLS26050Data[] = [];
  selectedItems: TLS26050Data[] = [];

  columns: Column[] = [];

  //#region 下拉選項定義
  // 組織選項（從服務載入）
  organizationOptions: any[] = [];
  // 區域選項（從服務載入）
  regionOptions: any[] = [];
  // 樓層選項（從服務載入）
  floorOptions: any[] = [];
  // 大分類選項（從服務載入）
  businessTypeCodeOptions: any[] = [];
  // 中分類選項（依大分類變更而變更）
  busClassOptions: DropdownOption[] = [];
  // 抽成別選項（從共享下拉服務取得）
  commissionTypeOptions: DropdownOption[] = this.sharedDropdownService.tltTermTypeOptions;
  // 專櫃編號選項（從服務載入）
  counterCodeOptions: any[] = [];
  // 稅別選項（含稅/未稅）
  taxOptions: any[] = [
    { value: true, label: '含稅' },
    { value: false, label: '未稅' }
  ];
  // 櫃別選項（從共享下拉服務取得）
  operationsOptions: DropdownOption[] = this.sharedDropdownService.tltKindOptions;
  // 報表類型選項（日/週/月/半年/年/區間/活動區間營業報表）
  reportTypeOptions: any[] = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
    { value: '7', label: '活動區間營業報表' },
  ];
  // 活動ID選項（硬編碼的測試資料）TODO: 無來源
  EventIDOptions: any[] = [
    { value: '1', label: '活動1' },
    { value: '2', label: '活動2' },
  ];
  // 半年別選項（上半年/下半年）TODO: value待確認
  halfyearOptions: any[] = [
    { value: '1', label: '上半年' },
    { value: '2', label: '下半年' },
  ];
  //#endregion

  constructor(
    private tls26050Service: TLS26050Service,
    private datePipe: DatePipe,
    private floorService: FloorService,
    private regionService: RegionService,
    private sharedDropdownService: SharedDropdownService,
    private counterNameService: CounterNameService,
    private businessClassificationService: BusinessClassificationService,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26050', 'tls/tls26050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.setColumns(true);
    this.onReportTypeChange('1');
    this.setReadOnlyFields();
  }

  onSubmit(frm: FormGroup) {
    const formValue = frm.getRawValue();
    const payload = {
      ...formValue,
      // 週營業報表 - 年度格式化 (yyyy)
      onedateyy: this.datePipe.transform(formValue.onedateyy, 'yyyy'),
      onedateyy_c: this.datePipe.transform(formValue.onedateyy_c, 'yyyy'),

      // 月營業報表 - 年月格式化 (yyyyMM)
      onedatemm: this.datePipe.transform(formValue.onedatemm, 'yyyyMM'),
      onedatemm_c: this.datePipe.transform(formValue.onedatemm_c, 'yyyyMM'),

      // 半年營業報表 - 年度格式化 (yyyy)
      halfyear_onedateyy: this.datePipe.transform(formValue.halfyear_onedateyy, 'yyyy'),
      halfyear_onedateyy_c: this.datePipe.transform(formValue.halfyear_onedateyy_c, 'yyyy'),

      // 年營業報表 - 年度格式化 (yyyy)
      year_onedateyy: this.datePipe.transform(formValue.year_onedateyy, 'yyyy'),
      year_onedateyy_c: this.datePipe.transform(formValue.year_onedateyy_c, 'yyyy')
    };

    this.handleSubmit(frm, () => {
      this.tls26050Service.queryTLS26050(payload)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.setColumns(frm.value.tax);
          this.data = response.Data.QueryData;
          this.footerData = [...response.Data.SumData, ...response.Data.AllData];
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  // 載入下拉選項
  loadOptions() {
    // 樓層下拉選項
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    // 區域下拉選項
    this.regionService.getRegionOptions().subscribe(data => {
      this.regionOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 大分類下拉選項
    this.businessClassificationService.getBusTypeOptions().subscribe(data => {
      this.businessTypeCodeOptions = data;
    });
    // 組織代號下拉選項
    this.sharedDropdownService.getOrgOptions().subscribe(data => {
      this.organizationOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 專櫃編號下拉選項
    this.counterNameService.getCounters().subscribe((res) => {
      this.counterCodeOptions =
        res?.map((x: any) => ({
          label: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    // 活動下拉選項
    this.dropDownListService.getActivityOptions({ mid: 0, str_no: '10', pod_type: ["1"], pod_status: '' }).subscribe((res) => {
      this.EventIDOptions = (res?.Data || []).map((item: any) => ({
        ...item,
        value: item.pod_no,
        label: `${item.pod_no}-${item.pod_desc}`
      }));
    });
  }

  // 根據銷售金額是否含稅設定顯示Header
  setColumns(tax: boolean) {
    this.columns = [
      { field: 'talent_id', header: '專櫃編號', hidden: true },
      { field: 'tlt_building', header: '館別', visible: true },
      { field: 'team_name', header: 'TEAM', visible: true },
      { field: 'division_name', header: '組別', visible: true },
      { field: 'tlt_kind', header: '櫃別', hidden: true },
      { field: 'bus_class_name', header: '中分類', hidden: true },
      { field: 'budget_now', header: '目標', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'preorder_amt_now', header: '當期預售金額', hidden: tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'preorder_namt_now', header: '當期預售金額', hidden: !tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'Achievement_rate_now', header: '目標達成率', hidden: tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isSubTotal: true, isTotal: true },
      { field: 'nAchievement_rate_now', header: '目標達成率', hidden: !tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isSubTotal: true, isTotal: true },
      { field: 'preorder_custcnt_now', header: '當期交易筆數', visible: true, isSubTotal: true, isTotal: true },
      { field: 'avg_ordervalue_now', header: '當期客單價', hidden: tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'navg_ordervalue_now', header: '當期客單價', hidden: !tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'preorder_amt_last', header: '去年同期預售金額', hidden: tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'preorder_namt_last', header: '去年同期預售金額', hidden: !tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'preorder_custcnt_last', header: '去年同期交易筆數', visible: true, isSubTotal: true, isTotal: true },
      { field: 'avg_ordervalue_last', header: '去年同期客單價', hidden: tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'navg_ordervalue_last', header: '去年同期客單價', hidden: !tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'Growth', header: '成長比', hidden: tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isSubTotal: true, isTotal: true },
      { field: 'nGrowth', header: '成長比', hidden: !tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isSubTotal: true, isTotal: true },
      { field: 'PerformanceDiff', header: '業績差異', hidden: tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'nPerformanceDiff', header: '業績差異', hidden: !tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'TransactionsNumber', header: '交易筆數差異', visible: true, isSubTotal: true, isTotal: true },
      { field: 'OrdervalueDiff', header: '客單差異', hidden: tax, isSubTotal: true, isTotal: true },
      { field: 'nOrdervalueDiff', header: '客單差異', hidden: !tax, isSubTotal: true, isTotal: true },
      { field: 'tlt_space', header: '營業坪數', visible: true, isSubTotal: true, isTotal: true },
      { field: 'MonthlyFloorEffect', header: '月坪效', hidden: tax, format: formatAmount, isSubTotal: true, isTotal: true },
      { field: 'nMonthlyFloorEffect', header: '月坪效', hidden: !tax, format: formatAmount, isSubTotal: true, isTotal: true }
    ]
  }

  queryWeek(event: string, baseOrCompare: 'base' | 'compare') {
    const control = this.queryForm.controls[baseOrCompare === 'base' ? 'onedateyy' : 'onedateyy_c'];
    if (!control.value) return;
    const payload = {
      onedateyy: this.datePipe.transform(control.value, 'yyyy') ?? '',
      weeks: event,
    };
    this.tls26050Service.queryTLS26050Week(payload).subscribe((response) => {
      switch (baseOrCompare) {
        case 'base':
          this.queryForm.controls['startdate'].setValue(response.Data[0].WeekStart);
          this.queryForm.controls['enddate'].setValue(response.Data[0].WeekEnd);
          break;
        case 'compare':
          this.queryForm.controls['startdate_c'].setValue(response.Data[0].WeekStart);
          this.queryForm.controls['enddate_c'].setValue(response.Data[0].WeekEnd);
          break;
      }
    });
  }

  onReportTypeChange(event: any) {
    // 根據報表類型設定欄位驗證
    const reportType = event;

    // 清除所有驗證器
    Object.keys(this.queryForm.controls).forEach(key => {
      if (key !== 'reportType') {
        this.queryForm.get(key)?.clearValidators();
      }
    });

    // 根據報表類型設定必要欄位驗證
    switch (reportType) {
      case '1': // 日營業報表
        this.queryForm.get('onedatedd')?.setValidators([Validators.required]);
        this.queryForm.get('onedatedd_c')?.setValidators([Validators.required]);
        break;
      case '2': // 週營業報表
        this.queryForm.get('onedateyy')?.setValidators([Validators.required]);
        this.queryForm.get('weeks')?.setValidators([Validators.required]);
        this.queryForm.get('onedateyy_c')?.setValidators([Validators.required]);
        this.queryForm.get('weeks_c')?.setValidators([Validators.required]);
        this.queryForm.get('startdate')?.setValidators([Validators.required]);
        this.queryForm.get('enddate')?.setValidators([Validators.required]);
        this.queryForm.get('startdate_c')?.setValidators([Validators.required]);
        this.queryForm.get('enddate_c')?.setValidators([Validators.required]);
        break;
      case '3': // 月營業報表
        this.queryForm.get('onedatemm')?.setValidators([Validators.required]);
        this.queryForm.get('onedatemm_c')?.setValidators([Validators.required]);
        break;
      case '4': // 半年營業報表
        this.queryForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        this.queryForm.get('halfyear_onedateyy_c')?.setValidators([Validators.required]);
        break;
      case '5': // 年營業報表
        this.queryForm.get('year_onedateyy')?.setValidators([Validators.required]);
        this.queryForm.get('year_onedateyy_c')?.setValidators([Validators.required]);
        break;
      case '6': // 區間營業報表
        this.queryForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.queryForm.get('sad_enddate')?.setValidators([Validators.required]);
        this.queryForm.get('sad_startdate_c')?.setValidators([Validators.required]);
        this.queryForm.get('sad_enddate_c')?.setValidators([Validators.required]);
        break;
      case '7': // 活動區間營業報表
        this.queryForm.get('event_startdate')?.setValidators([Validators.required]);
        this.queryForm.get('event_enddate')?.setValidators([Validators.required]);
        this.queryForm.get('event_startdate_c')?.setValidators([Validators.required]);
        this.queryForm.get('event_enddate_c')?.setValidators([Validators.required]);
        break;
    }

    // 更新所有欄位驗證狀態
    Object.keys(this.queryForm.controls).forEach(key => {
      this.queryForm.get(key)?.updateValueAndValidity();
    });
  }

  setReadOnlyFields() {
    this.queryForm.controls['startdate'].disable();
    this.queryForm.controls['enddate'].disable();
    this.queryForm.controls['startdate_c'].disable();
    this.queryForm.controls['enddate_c'].disable();
    this.queryForm.controls['event_startdate'].disable();
    this.queryForm.controls['event_enddate'].disable();
    this.queryForm.controls['event_startdate_c'].disable();
    this.queryForm.controls['event_enddate_c'].disable();
  }

  onBusinessTypeChange(event: any) {
    this.businessClassificationService.getBusClassOptions(event).subscribe(data => {
      this.busClassOptions = data;
    });
  }

  // 活動下拉改變
  queryEvent(event: any, baseOrCompare: 'base' | 'compare') {
    console.log(event);
    console.log(this.EventIDOptions);
    switch (baseOrCompare) {
      case 'base':
        this.queryForm.controls['event_startdate'].setValue(this.EventIDOptions.find(x => x.value === event)?.pod_sdate ?? null);
        this.queryForm.controls['event_enddate'].setValue(this.EventIDOptions.find(x => x.value === event)?.pod_edate ?? null);
        break;
      case 'compare':
        this.queryForm.controls['event_startdate_c'].setValue(this.EventIDOptions.find(x => x.value === event)?.pod_sdate ?? null);
        this.queryForm.controls['event_enddate_c'].setValue(this.EventIDOptions.find(x => x.value === event)?.pod_edate ?? null);
        break;
    }
  }
}