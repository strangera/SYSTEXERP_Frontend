import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { debounceTime, finalize } from 'rxjs';
import { TLS26060Service, TLS26060Data } from '../../../service/api/tls/tls26060.service';
import { TLS26050Service } from '../../../service/api/tls/tls26050.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { DropdownOption } from '@shared/constants/business.constants';
import { CounterNameService } from '@service/basic/counter-name.service';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-tls26060',
  templateUrl: './tls26060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    RadiobuttonComponent,
    CalendarComponent,
    DropdownComponent,
    NgIf,
    MultiSelectComponent,
    CalendarRangeQuickComponent,
    CustomFooterTableComponent,
    DropdownComponent
  ]
})
export class TLS26060Component extends BasicQueryPageComponent<TLS26060Data> implements OnInit {
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
    reportType: ['1'], // 報表類型
    floor: [null], // 樓層 string[]
    region: [null], // 區域 string[]
    bus_type: [null],//大分類
    bus_class: [null],//中分類
    tlt_kind: [null], // 櫃別 string[]
    tlt_term_type: [null], // 抽成別 string[]
    org_id: [null], // 組織代號 string[]
    tlt_no: [null], // 專櫃編號 string[]
    tax: [true], // 是否含稅 boolean

    onedatedd: [this.today], // 日期（日報表）
    onedatedd_c: [this.yesterday], // 比較日期（日報表）
    onedateyy: [null], // 年度（週/半年/年報表）
    weeks: [null], // 週數
    startdate: [null as string | null], // 開始日期
    enddate: [null as string | null], // 結束日期
    onedateyy_c: [null], // 比較年度（週報表）
    weeks_c: [null], // 比較週數
    startdate_c: [null as string | null], // 比較開始日期（週報表用）
    enddate_c: [null as string | null], // 比較結束日期（週報表用）
    onedatemm: [null], // 年月（月報表）
    onedatemm_c: [null], // 比較年月（月報表）
    halfyear_onedateyy: [null], // 半年報表年度
    halfyear: [null], // 半年別
    halfyear_onedateyy_c: [null], // 比較半年報表年度
    halfyear_c: [null], // 比較半年別
    year_onedateyy: [null], // 年報表年度
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
    ...createPaginationConfig([{ field: 'team_name', order: -1 }])
  });

  totalRecords = 0;
  data: TLS26060Data[] = [];
  footerData: TLS26060Data[] = [];
  selectedItems: TLS26060Data[] = [];

  columns: Column[] = [];

  //#region 下拉選項定義
  // 1. 日期查詢條件相關下拉選項
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
  // 活動ID選項（硬編碼的測試資料
  EventIDOptions: any[] = [];
  // 半年別選項（上半年/下半年
  halfyearOptions: any[] = [
    { value: '1', label: '上半年' },
    { value: '2', label: '下半年' },
  ];

  // 2. 合約查詢條件相關下拉選項
  // 櫃別選項
  operationsOptions: DropdownOption[] = this.sharedDropdownService.tltKindOptions;
  // 抽成別選項
  commissionTypeOptions: DropdownOption[] = this.sharedDropdownService.tltTermTypeOptions;
  counterCodeOptions: any[] = []; // 專櫃編號選項
  tlt_floor_Option: IDropdownItem[] = []; // 樓層
  area_no_Option: IDropdownItem[] = []; // 區域
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  org_id_Option: IDropdownItem[] = []; // 組織
  // 稅別選項（含稅/未稅）
  taxOptions: any[] = [
    { value: true, label: '含稅' },
    { value: false, label: '未稅' }
  ];
  //#endregion

  constructor(
    private tls26060Service: TLS26060Service,
    private tls26050Service: TLS26050Service,
    private datePipe: DatePipe,
    private sharedDropdownService: SharedDropdownService,
    private counterNameService: CounterNameService,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26060', 'tls/tls26060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.setColumns(true);
    this.onReportTypeChange('1');
    this.setReadOnlyFields();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
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
        year_onedateyy_c: this.datePipe.transform(formValue.year_onedateyy_c, 'yyyy'),
        // 中分類處理：將物件陣列轉換成 [[CAT_LNo, No]] 格式
        bus_class: formValue.bus_class ? formValue.bus_class.map((item: any) => [item.CAT_LNo, item.No]) : null
      };
      this.tls26060Service.queryTLS26060(payload)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.setColumns(frm.value.tax);
          this.data = response.Data.QueryData;
          this.footerData = response.Data.AllData;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  // 載入下拉選項
  loadOptions() {
    // 獲取專櫃編號選項
    this.counterNameService.getCounters().subscribe((res) => {
      this.counterCodeOptions = res?.map((x: any) => ({
        label: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    // 獲取樓層下拉選項
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.tlt_floor_Option = res.Data;
    })
    // 獲取區域下拉選項
    this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.area_no_Option = res.Data;
    })
    // 獲取大分類下拉選項
    this.dropDownListService.queryPOS2003_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.bus_type_Option = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.queryForm.controls.bus_type.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value: string[] | null) => {
      if (value && value.length > 0) {
        this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: value }).pipe(untilDestroyed(this)).subscribe(response => {
          const groupedData = response.Data.reduce((accumulator, currentItem) => {
            const groupKey = currentItem.CAT_LNo || '';
            if (!accumulator[groupKey]) {
              accumulator[groupKey] = {
                CAT_LName: currentItem.CAT_LName,
                items: []
              };
            }

            accumulator[groupKey].items.push({
              ...currentItem,
              label: `${currentItem.No} - ${currentItem.Name}`,
            });

            return accumulator;
          }, {} as Record<string, any>);

          // 最後，將分組物件的值轉換為陣列，得到最終的分組下拉清單格式
          this.bus_class_Option = Object.values(groupedData);
        });
      } else {
        this.bus_class_Option = [];
        this.queryForm.controls.bus_class.setValue(null);
      }
    });
    // 獲取組織下拉選項
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.org_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    })
  }

  // 根據銷售金額是否含稅設定顯示Header
  setColumns(tax: boolean) {
    this.columns = [
      { field: 'talent_id', header: '專櫃編號', hidden: true },
      { field: 'tlt_building', header: '館別', visible: true },
      { field: 'team_name', header: 'TEAM', visible: true },
      { field: 'division_name', header: '組別', visible: true },
      { field: 'tlt_kind', header: '櫃別', visible: true },
      { field: 'bus_class_name', header: '大分類', hidden: true },
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

  // 查詢週報表起訖日期
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

  // 根據報表類型設定欄位驗證
  onReportTypeChange(event: any) {
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
        this.queryForm.get('halfyear')?.setValidators([Validators.required]);
        this.queryForm.get('halfyear_c')?.setValidators([Validators.required]);
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
        this.queryForm.get('eventID')?.setValidators([Validators.required]);
        this.queryForm.get('eventID_c')?.setValidators([Validators.required]);
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

  // 活動下拉改變
  queryEvent(event: any, baseOrCompare: 'base' | 'compare') {
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
