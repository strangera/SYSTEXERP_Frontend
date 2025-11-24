import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls11010Service } from '@service/api/tls/tls11010.service';
import { FloorService } from '@service/basic/querySYS3900.service';
import { RegionService } from '@service/basic/querySYS3A00.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS26050Service } from '../../../service/api/tls/tls26050.service';
import { TLS32050Data, TLS32050Service } from '../../../service/api/tls/tls32050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls32050',
  templateUrl: './tls32050.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, TableComponent, TranslateModule, RadiobuttonComponent, CalendarComponent, InputNumberComponent, DropdownComponent, NgIf, MultiSelectComponent, CalendarRangeQuickComponent]
})
export class TLS32050Component extends BasicQueryPageComponent<TLS32050Data> implements OnInit {
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
    bus_type: [null], // 大分類/中分類
    tlt_kind: [null], // 櫃別
    org_id: [null], // 組織代號
    tlt_term_type: [null], // 抽成別
    onedatedd: [this.today, Validators.required], // 日期（日報表）
    onedatedd_c: [this.yesterday, Validators.required], // 比較日期（日報表）
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
    issue: [null], // 是否開立業主發票
    tlt_building: [[]],
    ...createPaginationConfig([{ field: 'team_name', order: -1 }])
  });

  totalRecords = 0;
  data: TLS32050Data[] = [];
  selectedItems: TLS32050Data[] = [];

  columns: Column[] = [];

  //#region 選項
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  typeOptions: any[] = [];
  counterCodeOptions = this.dropdown.queryTltTalent();
  taxOptions: any[] = [
    { value: true, label: '含稅' },
    { value: false, label: '未稅' }
  ];
  operationsOptions = getSYS1000Options('store_way');

  reportTypeOptions: any[] = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
    { value: '7', label: '活動區間營業報表' },
  ];
  EventIDOptions: any[] = [
    { value: '1', label: '活動1' },
    { value: '2', label: '活動2' },
  ];
  halfyearOptions: any[] = [
    { value: '1', label: '上半年' },
    { value: '2', label: '下半年' },
  ];
  issueOptions: any[] = [
    { value: '0', label: '是' },
    { value: '1', label: '否' },
    { value: '2', label: '全部' },
  ];
  buildingOptions: any[] = [];
  //#endregion

  constructor(
    private readonly dropdown: DropdownApiService,
    private tls32050Service: TLS32050Service,
    private tls26050Service: TLS26050Service,
    private datePipe: DatePipe,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32050', 'tls/tls32050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.setColumns(true);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls32050Service.queryTLS32050(frm.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.setColumns(frm.value.tax);
          this.data = response.Data;
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
    // 大分類/中分類下拉選項
    // TODO: 請改打API
    // TODO: service是寫死的
    // this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
    //   this.businessTypeCodeOptions = data.map(item => ({
    //     ...item,
    //     value: typeof item.value === 'number' ? item.value.toString() : item.value
    //   }));
    // });
    // 組織代號下拉選項
    //TODO 請呼叫API 不要呼叫寫死的
    // TODO: service是寫死的
    // this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
    //   this.organizationOptions = data.map(item => ({
    //     ...item,
    //     value: typeof item.value === 'number' ? item.value.toString() : item.value
    //   }));
    // });
    // 加載館別選項
    this.tls11010Service.getBuildingOptions().subscribe((data) => {
      this.buildingOptions = data;
    });
  }

  // 根據銷售金額是否含稅設定顯示Header
  setColumns(tax: boolean) {
    this.columns = [
      { field: 'talent_id', header: '專櫃編號', hidden: true },
      { field: 'tlt_building', header: '館別', visible: true },
      { field: 'team_name', header: 'TEAM', visible: true },
      { field: 'division_name', header: '組別', visible: true },
      { field: 'tlt_kind', header: '櫃別', visible: true },
      { field: 'bus_class_name', header: '中分類', visible: true },
      { field: 'budget_now', header: '目標', visible: true, format: formatAmount, isSubTotal: true },
      { field: 'preorder_amt_now', header: '當期預售金額', hidden: tax, format: formatAmount, isSubTotal: true },
      { field: 'preorder_namt_now', header: '當期預售金額', hidden: !tax, format: formatAmount, isSubTotal: true },
      { field: 'Achievement_rate_now', header: '目標達成率', hidden: tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isSubTotal: true },
      { field: 'nAchievement_rate_now', header: '目標達成率', hidden: !tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isSubTotal: true },
      { field: 'preorder_custcnt_now', header: '當期交易筆數', visible: true, isSubTotal: true },
      { field: 'avg_ordervalue_now', header: '當期客單價', hidden: tax, format: formatAmount, isSubTotal: true },
      { field: 'navg_ordervalue_now', header: '當期客單價', hidden: !tax, format: formatAmount, isSubTotal: true },
      { field: 'preorder_amt_last', header: '去年同期預售金額', hidden: tax, format: formatAmount, isSubTotal: true },
      { field: 'preorder_namt_last', header: '去年同期預售金額', hidden: !tax, format: formatAmount, isSubTotal: true },
      { field: 'preorder_custcnt_last', header: '去年同期交易筆數', visible: true, isSubTotal: true },
      { field: 'avg_ordervalue_last', header: '去年同期客單價', hidden: tax, format: formatAmount, isSubTotal: true },
      { field: 'navg_ordervalue_last', header: '去年同期客單價', hidden: !tax, format: formatAmount, isSubTotal: true },
      { field: 'Growth', header: '成長比', hidden: tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isSubTotal: true },
      { field: 'nGrowth', header: '成長比', hidden: !tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isSubTotal: true },
      { field: 'PerformanceDiff', header: '業績差異', hidden: tax, format: formatAmount, isSubTotal: true },
      { field: 'nPerformanceDiff', header: '業績差異', hidden: !tax, format: formatAmount, isSubTotal: true },
      { field: 'TransactionsNumber', header: '交易筆數差異', visible: true, isSubTotal: true },
      { field: 'OrdervalueDiff', header: '客單差異', hidden: tax, isSubTotal: true },
      { field: 'nOrdervalueDiff', header: '客單差異', hidden: !tax, isSubTotal: true },
      { field: 'tlt_space', header: '營業坪數', visible: true, isSubTotal: true },
      { field: 'MonthlyFloorEffect', header: '月坪效', hidden: tax, format: formatAmount, isSubTotal: true },
      { field: 'nMonthlyFloorEffect', header: '月坪效', hidden: !tax, format: formatAmount, isSubTotal: true }
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
}
