import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls11010Service } from '@service/api/tls/tls11010.service';
import { FloorService } from '@service/basic/floor.service';
import { RegionService } from '@service/basic/region-code.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS32020Data, TLS32020Service } from '../../../service/api/tls/tls32020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls32020',
  templateUrl: './tls32020.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, TableComponent, TranslateModule, RadiobuttonComponent, DropdownComponent, NgIf, MultiSelectComponent, CalendarRangeQuickComponent]
})
export class TLS32020Component extends BasicQueryPageComponent<TLS32020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    // 日期查詢條件
    reportType: ['6'], // 報表類型（預設區間營業報表）
    sad_startdate: [null], // 區間開始日期
    sad_enddate: [null], // 區間結束日期
    eventID: [null], // 活動ID
    event_startdate: [null], // 活動開始日期
    event_enddate: [null], // 活動結束日期
    // 合約查詢條件
    floor: [null], // 樓層
    region: [null], // 區域
    bus_type: [null], // 大分類/中分類
    tlt_kind: [null], // 櫃別
    org_id: [null], // 組織代號
    tlt_term_type: [null], // 抽成別
    tlt_no: [null], // 專櫃編號
    tlt_building: [null], // 館別
    tax: [true], // 是否含稅
    issue: ['2'], // 是否開立業主發票
    ...createPaginationConfig([{ field: 'team_name', order: -1 }])
  });

  totalRecords = 0;
  data: TLS32020Data[] = [];
  selectedItems: TLS32020Data[] = [];

  columns: Column[] = [];
  columnGroup = [
    { field: 'target_diff', header: '目標差異' },
    { field: 'sales_diff', header: '營業額差異' },
    { field: 'transaction_diff', header: '交易筆數差異' },
    { field: 'unit_price_diff', header: '客單價差異' },
    { field: 'current_year', header: '2024年' },
    { field: 'previous_year', header: '2023年' },
    { field: 'comparison', header: '比較分析' }
  ];

  //#region 選項
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  operationsOptions = getSYS1000Options('store_way');
  counterCodeOptions = this.dropdown.queryTltTalent();
  taxOptions: any[] = [
    { value: true, label: '含稅' },
    { value: false, label: '未稅' }
  ];
  reportTypeOptions: any[] = [
    { value: '6', label: '區間營業報表' },
    { value: '7', label: '活動區間營業報表' },
  ];
  EventIDOptions: any[] = [
    { value: '1', label: '活動1' },
    { value: '2', label: '活動2' },
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
    private tls32020Service: TLS32020Service,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32020', 'tls/tls32020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.setColumns(true);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls32020Service.queryTLS32020(frm.getRawValue())
        .pipe(finalize(() => this.loading = false))
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
    // TODO: 請改打API
    // 大分類/中分類下拉選項
    // this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
    //   this.businessTypeCodeOptions = data.map(item => ({
    //     ...item,
    //     value: typeof item.value === 'number' ? item.value.toString() : item.value
    //   }));
    // });
    //TODO 請呼叫API 不要呼叫寫死的
    // 組織代號下拉選項
    // this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
    //   this.organizationOptions = data.map(item => ({
    //     ...item,
    //     value: typeof item.value === 'number' ? item.value.toString() : item.value
    //   }));
    // });
    //館別下拉
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));
  }

  // 根據銷售金額是否含稅設定顯示Header
  setColumns(tax: boolean) {
    this.columns = [
      // 基本資訊
      { field: 'sequence', header: '序號', visible: false, },
      { field: 'date', header: '日期', visible: true, },

      // 目標差異
      { field: 'a1_target_diff', header: 'A1目標差異', visible: true, format: formatAmount, groupField: 'target_diff', isTotal: true },
      { field: 'a2_target_diff', header: 'A2目標差異', visible: true, format: formatAmount, groupField: 'target_diff', isTotal: true },
      { field: 'total_target_diff', header: 'A1+A2目標差異', visible: true, format: formatAmount, groupField: 'target_diff', isTotal: true },

      // 營業額差異
      { field: 'a1_sales_diff', header: 'A1營業實績差異', visible: true, format: formatAmount, groupField: 'sales_diff', isTotal: true },
      { field: 'a2_sales_diff', header: 'A2營業實績差異', visible: true, format: formatAmount, groupField: 'sales_diff', isTotal: true },
      { field: 'total_sales_diff', header: 'A1+A2營業實績差異', visible: true, format: formatAmount, groupField: 'sales_diff', isTotal: true },

      // 交易筆數差異
      { field: 'a1_transaction_diff', header: 'A1交易筆數差異', visible: true, groupField: 'transaction_diff', isTotal: true },
      { field: 'a2_transaction_diff', header: 'A2交易筆數差異', visible: true, groupField: 'transaction_diff', isTotal: true },
      { field: 'total_transaction_diff', header: 'A1+A2交易筆數差異', visible: true, groupField: 'transaction_diff', isTotal: true },

      // 客單價差異
      { field: 'a1_unit_price_diff', header: 'A1客單價差異', visible: true, format: formatAmount, groupField: 'unit_price_diff', isTotal: true },
      { field: 'a2_unit_price_diff', header: 'A2客單價差異', visible: true, format: formatAmount, groupField: 'unit_price_diff', isTotal: true },
      { field: 'total_unit_price_diff', header: 'A1+A2客單價差異', visible: true, format: formatAmount, groupField: 'unit_price_diff', isTotal: true },

      // 2024年資料
      { field: 'current_target_a1', header: 'A1營業目標', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },
      { field: 'current_target_a2', header: 'A2營業目標', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },
      { field: 'current_target_total', header: 'A1+A2營業目標', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },
      { field: 'current_sales_a1', header: 'A1營業實績', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },
      { field: 'current_sales_a2', header: 'A2營業實績', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },
      { field: 'current_sales_total', header: 'A1+A2營業實績', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },
      { field: 'current_transaction_a1', header: 'A1交易筆數', visible: true, groupField: 'current_year', isTotal: true },
      { field: 'current_transaction_a2', header: 'A2交易筆數', visible: true, groupField: 'current_year', isTotal: true },
      { field: 'current_transaction_total', header: 'A1+A2交易筆數', visible: true, groupField: 'current_year', isTotal: true },
      { field: 'current_unit_price_a1', header: 'A1客單價', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },
      { field: 'current_unit_price_a2', header: 'A2客單價', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },
      { field: 'current_unit_price_total', header: 'A1+A2客單價', visible: true, format: formatAmount, groupField: 'current_year', isTotal: true },

      // 2023年資料
      { field: 'previous_sales_a1', header: 'A1營業實績', visible: true, format: formatAmount, groupField: 'previous_year', isTotal: true },
      { field: 'previous_sales_a2', header: 'A2營業實績', visible: true, format: formatAmount, groupField: 'previous_year', isTotal: true },
      { field: 'previous_sales_total', header: 'A1+A2營業實績', visible: true, format: formatAmount, groupField: 'previous_year', isTotal: true },
      { field: 'previous_transaction_a1', header: 'A1交易筆數', visible: true, groupField: 'previous_year', isTotal: true },
      { field: 'previous_transaction_a2', header: 'A2交易筆數', visible: true, groupField: 'previous_year', isTotal: true },
      { field: 'previous_transaction_total', header: 'A1+A2交易筆數', visible: true, groupField: 'previous_year', isTotal: true },
      { field: 'previous_unit_price_a1', header: 'A1客單價', visible: true, format: formatAmount, groupField: 'previous_year', isTotal: true },
      { field: 'previous_unit_price_a2', header: 'A2客單價', visible: true, format: formatAmount, groupField: 'previous_year', isTotal: true },
      { field: 'previous_unit_price_total', header: 'A1+A2客單價', visible: true, format: formatAmount, groupField: 'previous_year', isTotal: true },

      // 比較分析
      { field: 'sales_variance', header: '營業差異', visible: true, format: formatAmount, groupField: 'comparison', isTotal: true },
      { field: 'achievement_rate', header: '達成率', visible: true, format: (value: number) => value ? `${value.toFixed(1)}%` : '0%', groupField: 'comparison', isTotal: true },
      { field: 'transaction_variance', header: '交易筆數差異', visible: true, groupField: 'comparison', isTotal: true },
      { field: 'unit_price_variance', header: '客單價差異', visible: true, format: formatAmount, groupField: 'comparison', isTotal: true }
    ];
  }
}
