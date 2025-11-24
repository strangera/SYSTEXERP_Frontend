import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
import { TLS32030Data, TLS32030Service } from '../../../service/api/tls/tls32030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls32030',
  templateUrl: './tls32030.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, TableComponent, TranslateModule, RadiobuttonComponent, CalendarComponent, InputNumberComponent, DropdownComponent, NgIf, MultiSelectComponent, CalendarRangeQuickComponent]
})
export class TLS32030Component extends BasicQueryPageComponent<TLS32030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    // 日期查詢條件（單選報表類型）
    reportType: ['1'], // 報表類型
    floor: [null], // 樓層
    region: [null], // 區域
    bus_type: [null], // 大分類/中分類
    tlt_kind: [null], // 櫃別
    org_id: [null], // 組織代號
    tlt_term_type: [null], // 抽成別
    onedatedd: ['2024/12/12'], // 日期（日報表）
    onedatedd_c: [null], // 比較日期（日報表）
    onedateyy: [null], // 年度（週/半年/年報表）
    weeks: [null], // 週數
    onedatemm: [null], // 年月（月報表）
    halfyear_onedateyy: [null], // 半年報表年度
    halfyear: [null], // 半年別
    year_onedateyy: [null], // 年報表年度
    startdate: [null], // 開始日期
    enddate: [null], // 結束日期
    onedateyy_c: [null], // 比較年度（週報表）
    weeks_c: [null], // 比較週數
    startdate_c: [null], // 比較開始日期（週報表用）
    enddate_c: [null], // 比較結束日期（週報表用）
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
    tlt_building: [null], // 館別
    issue: ['2'], // 是否開立業主發票
    ...createPaginationConfig([{ field: 'team_name', order: -1 }])
  });

  totalRecords = 0;
  data: TLS32030Data[] = [];
  selectedItems: TLS32030Data[] = [];

  columnGroup = [
    { header: '單位', field: 'unit' },
    { header: '比較', field: 'compare' },
    { header: '基準', field: 'baseline' },
    { header: '成長率', field: 'growthRate' },
    { header: '差異', field: 'difference' },
  ];

  columns: Column[] = [
    // 基本資訊欄位
    { field: 'building', header: '館別', groupField: 'unit' },
    { field: 'organization', header: '組織', groupField: 'unit' },
    { field: 'counterType', header: '櫃別', groupField: 'unit' },
    { field: 'counterNumber', header: '專櫃編號', groupField: 'unit' },
    { field: 'counterName', header: '專櫃名稱', groupField: 'unit' },

    // 比較欄位群組 (2024/05/14)
    { field: 'compare_salesAmount', header: '銷售金額', groupField: 'compare' },
    { field: 'compare_salesCount', header: '銷售筆數', groupField: 'compare' },
    { field: 'compare_customerCount', header: '來客數', groupField: 'compare' },
    { field: 'compare_unitPrice', header: '日坪效', groupField: 'compare' },
    { field: 'compare_conversionRate', header: '達成率', groupField: 'compare' },
    { field: 'compare_averageSpend', header: '客單價', groupField: 'compare' },
    { field: 'compare_position', header: '位置排名', groupField: 'compare' },

    // 基準欄位群組 (2024/05/13)
    { field: 'baseline_salesAmount', header: '銷售金額', groupField: 'baseline' },
    { field: 'baseline_salesCount', header: '銷售筆數', groupField: 'baseline' },
    { field: 'baseline_customerCount', header: '來客數', groupField: 'baseline' },
    { field: 'baseline_unitPrice', header: '日坪效', groupField: 'baseline' },
    { field: 'baseline_conversionRate', header: '達成率', groupField: 'baseline' },
    { field: 'baseline_averageSpend', header: '客單價', groupField: 'baseline' },
    { field: 'baseline_position', header: '位置排名', groupField: 'baseline' },

    // 成長率欄位群組
    { field: 'growth_salesAmount', header: '銷售金額', groupField: 'growthRate' },
    { field: 'growth_salesCount', header: '銷售筆數', groupField: 'growthRate' },
    { field: 'growth_customerCount', header: '來客數', groupField: 'growthRate' },
    { field: 'growth_unitPrice', header: '日坪效', groupField: 'growthRate' },
    { field: 'growth_conversionRate', header: '達成率', groupField: 'growthRate' },
    { field: 'growth_averageSpend', header: '客單價', groupField: 'growthRate' },
    { field: 'growth_position', header: '位置排名', groupField: 'growthRate' },

    // 差異欄位群組
    { field: 'diff_salesAmount', header: '銷售金額', groupField: 'difference' },
    { field: 'diff_salesCount', header: '銷售筆數', groupField: 'difference' },
    { field: 'diff_customerCount', header: '來客數', groupField: 'difference' },
    { field: 'diff_unitPrice', header: '日坪效', groupField: 'difference' },
    { field: 'diff_conversionRate', header: '達成率', groupField: 'difference' },
    { field: 'diff_averageSpend', header: '客單價', groupField: 'difference' },
    { field: 'diff_position', header: '位置排名', groupField: 'difference' }
  ];

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
  BUILDING_NO_Options: any[] = [];
  issueOptions: any[] = [
    { value: '0', label: '是' },
    { value: '1', label: '否' },
    { value: '2', label: '全部' },
  ];
  //#endregion

  constructor(
    private readonly dropdown: DropdownApiService,
    private tls32030Service: TLS32030Service,
    private floorService: FloorService,
    private regionService: RegionService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32030', 'tls/tls32030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls32030Service.queryTLS32030(frm.getRawValue())
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
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
  }
}
