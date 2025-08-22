import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { TLS32010Service, TLS32010Data, TLS32010QueryRequest } from '../../../service/api/tls/tls32010.service';
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
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';

@Component({
  selector: 'app-tls32010',
  templateUrl: './tls32010.component.html',
  styleUrl: './tls32010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, TableComponent, TranslateModule, RadiobuttonComponent, DropdownComponent, NgIf, MultiSelectComponent, CalendarRangeQuickComponent]
})
export class TLS32010Component extends BasicQueryPageComponent<TLS32010Data> implements OnInit {
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
    tax: [true], // 是否含稅
    ...createPaginationConfig([{ field: 'team_name', order: -1 }])
  });

  totalRecords = 0;
  data: TLS32010Data[] = [];
  selectedItems: TLS32010Data[] = [];

  columns: Column[] = [];
  columnGroup = [
    { field: 'dept', header: '單位' },
    { field: 'tier', header: '排名順位' }
  ];

  //#region 選項
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  operationsOptions: any[] = [];
  counterCodeOptions: any[] = [];
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
  //#endregion

  constructor(
    private tls32010Service: TLS32010Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private commissionTypeService: CommissionTypeService,
    private cooperationMethodService: CooperationMethodService,
    private floorService: FloorService,
    private regionService: RegionService,
    private counterCodeService: CounterCodeService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32010', 'tls/tls32010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.setColumns(true);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls32010Service.queryTLS32010(frm.getRawValue())
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
    // 大分類/中分類下拉選項
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 櫃別下拉選項
    this.cooperationMethodService.getCooperationMethods().subscribe(data => {
      this.operationsOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 抽成別下拉選項
    this.commissionTypeService.getCommissionTypes().subscribe((data) => {
      this.commissionTypeOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 組織代號下拉選項
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
    // 專櫃編號下拉選項
    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });
  }

  // 根據銷售金額是否含稅設定顯示Header
  setColumns(tax: boolean) {
    this.columns = [
      { field: 'talent_id', header: '櫃位編號', hidden: true },
      { field: 'tlt_building', header: '館別', visible: true },
      { field: 'org_name', header: '組織名稱', visible: true },
      { field: 'tlt_kind', header: '櫃別', visible: true },
      { field: 'talent_id', header: '櫃位編號', visible: true, groupField: 'dept' },
      { field: 'talent_name', header: '櫃位名稱', visible: true, groupField: 'dept' },
      { field: 'position_no', header: '位置編號', visible: true, groupField: 'dept' },
      { field: 'tlt_space', header: '坪數', visible: true, format: formatAmount },
      { field: 'sales_target', header: '營業目標', visible: true, format: formatAmount },
      { field: 'sales_actual', header: '營業實績', hidden: tax, format: formatAmount },
      { field: 'sales_actual_tax', header: '營業實績', hidden: !tax, format: formatAmount },
      { field: 'transaction_count', header: '交易筆數', visible: true },
      { field: 'avg_unit_price', header: '客單價', hidden: tax, format: formatAmount },
      { field: 'avg_unit_price_tax', header: '客單價', hidden: !tax, format: formatAmount },
      { field: 'floor_efficiency', header: '坪效', hidden: tax, format: formatAmount },
      { field: 'floor_efficiency_tax', header: '坪效', hidden: !tax, format: formatAmount },
      { field: 'achievement_rate', header: '達成率', hidden: tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%' },
      { field: 'achievement_rate_tax', header: '達成率', hidden: !tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%' },
      // 排名順位
      { field: 'tlt_space_t', header: '坪數', visible: true, format: formatAmount, groupField: 'tier' },
      { field: 'sales_target_t', header: '營業目標', visible: true, format: formatAmount, groupField: 'tier' },
      { field: 'sales_actual_t', header: '營業實績', visible: true, format: formatAmount, groupField: 'tier' },
      { field: 'transaction_count_t', header: '交易筆數', visible: true, groupField: 'tier' },
      { field: 'avg_unit_price_t', header: '客單價', visible: true, format: formatAmount, groupField: 'tier' },
      { field: 'floor_efficiency_t', header: '日坪效', visible: true, format: formatAmount, groupField: 'tier' },
      { field: 'achievement_rate_t', header: '達成率', visible: true, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', groupField: 'tier' },
    ];
  }
}