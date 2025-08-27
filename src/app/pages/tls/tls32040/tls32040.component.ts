import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { TLS32040Service, TLS32040Data, TLS32040QueryRequest } from '../../../service/api/tls/tls32040.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';
import { BusinessTypeCodeService } from '@service/basic/business-type-code-service.service';
import { CommissionTypeService } from '@service/basic/commission-type.service';
import { OrganizationNumberService } from '@service/basic/organization-number.service';
import { CooperationMethodService } from '@service/basic/cooperation-method.service';
import { FloorService } from '@service/basic/floor.service';
import { RegionService } from '@service/basic/region-code.service';
import { CounterCodeService } from '@service/basic/counter-code.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Tls11010Service } from '@service/api/tls/tls11010.service';

@Component({
  selector: 'app-tls32040',
  templateUrl: './tls32040.component.html',
  styleUrl: './tls32040.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, TableComponent, TranslateModule, RadiobuttonComponent, CalendarComponent, InputNumberComponent, DropdownComponent, NgIf, MultiSelectComponent, CalendarRangeQuickComponent, CustomFooterTableComponent]
})
export class TLS32040Component extends BasicQueryPageComponent<TLS32040Data> implements OnInit {
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
  data: TLS32040Data[] = [];
  footerData: TLS32040Data[] = [];
  selectedItems: TLS32040Data[] = [];

  columns: Column[] = [];

  //#region 選項
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  typeOptions: any[] = [];
  counterCodeOptions: any[] = [];
  taxOptions: any[] = [
    { value: true, label: '含稅' },
    { value: false, label: '未稅' }
  ];
  operationsOptions: any[] = [];
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
    private tls32040Service: TLS32040Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private commissionTypeService: CommissionTypeService,
    private cooperationMethodService: CooperationMethodService,
    private floorService: FloorService,
    private regionService: RegionService,
    private counterCodeService: CounterCodeService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32040', 'tls/tls32040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.setColumns(true);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls32040Service.queryTLS32040(frm.getRawValue())
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
    // 大分類/中分類下拉選項
    // TODO: service是寫死的
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 櫃別下拉選項
    // TODO: service是寫死的
    this.cooperationMethodService.getCooperationMethods().subscribe(data => {
      this.operationsOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 抽成別下拉選項
    // TODO: service是寫死的
    this.commissionTypeService.getCommissionTypes().subscribe((data) => {
      this.commissionTypeOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 組織代號下拉選項
    // TODO: service是寫死的
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 專櫃編號下拉選項
    // TODO: service是寫死的
    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 加載館別選項
    this.tls11010Service.getBuildingOptions().subscribe((data) => {
      this.buildingOptions = data;
    });
  }

  // 根據銷售金額是否含稅設定顯示Header
  setColumns(tax: boolean) {
    this.columns = [
      { field: 'talent_id', header: '專櫃編號', hidden: true },
      { field: 'tlt_building', header: '館別', hidden: true },
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
    this.tls32040Service.queryTLS32040Week(payload).subscribe((response) => {
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