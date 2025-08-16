import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { TLS26070Service, TLS26070Data, TLS26070QueryRequest } from '../../../service/api/tls/tls26070.service';
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
import { TypeService } from '@service/basic/type.service';
import { TaxableService } from '@service/basic/taxable.service';
import { FloorService } from '@service/basic/floor.service';
import { RegionService } from '@service/basic/region-code.service';
import { CounterCodeService } from '@service/basic/counter-code.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-tls26070',
  templateUrl: './tls26070.component.html',
  styleUrl: './tls26070.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, TableComponent, TranslateModule, RadiobuttonComponent, CalendarComponent, InputNumberComponent, DropdownComponent, NgIf, MultiSelectComponent]
})
export class TLS26070Component extends BasicQueryPageComponent<TLS26070Data> implements OnInit {
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
    onedateyy: [null], // 年度（週/半年/年報表）
    weeks: [null], // 週數
    onedatemm: [null], // 年月（月報表）
    halfyear_onedateyy: [null], // 半年報表年度
    halfyear: [null], // 半年別
    year_onedateyy: [null], // 年報表年度
    startdate: [null], // 開始日期
    enddate: [null], // 結束日期
    sad_startdate: [null], // 區間開始日期
    sad_enddate: [null], // 區間結束日期
    eventID: [null], // 活動ID
    event_startdate: [null], // 活動開始日期
    event_enddate: [null], // 活動結束日期
    tlt_no: [null], // 專櫃編號
    tax: [true], // 是否含稅
    ...createPaginationConfig([{ field: 'talent_id', order: 1 }])
  });

  totalRecords = 0;
  data: TLS26070Data[] = [];
  selectedItems: TLS26070Data[] = [];

  columns: Column[] = [
    { field: 'talent_id', header: '專櫃編號', visible: true }, // 專櫃編號
    { field: 'tlt_building', header: '樓別', visible: true }, // 樓別
    { field: 'TEAM', header: 'TEAM', visible: true }, // TEAM
    { field: 'tlt_kind', header: '櫃別', visible: true }, // 櫃別
    { field: 'bus_class_name', header: '大分類/中分類', visible: true }, // 大分類/中分類名稱
    { field: 'bus_sclass_name', header: '業種中分類', visible: true }, // 業種中分類名稱
    { field: 'tlt_name', header: '專櫃名稱', visible: true }, // 專櫃名稱
    { field: 'total_amt', header: '合約總金額', visible: true, format: formatAmount }, // 合約總金額
    { field: 'sad_preorder_amts', header: '預售金額(含稅)', visible: true, format: formatAmount }, // 預售金額(含稅)
    { field: 'sad_preorder_notaxamts', header: '預售金額(未稅)', visible: true, format: formatAmount }, // 預售金額(未稅)
    { field: 'sad_preorder_custs', header: '預售客數', visible: true }, // 預售客數
    { field: 'tlt_space', header: '坪數', visible: true }, // 坪數
  ];

  //#region 選項
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  typeOptions: any[] = [];
  counterCodeOptions: any[] = [];
  taxOptions: any[] = [];
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
  //#endregion

  constructor(
    private tls26070Service: TLS26070Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private commissionTypeService: CommissionTypeService,
    private cooperationMethodService: CooperationMethodService,
    private typeService: TypeService,
    private taxableService: TaxableService,
    private floorService: FloorService,
    private regionService: RegionService,
    private counterCodeService: CounterCodeService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26070', 'tls/tls26070cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls26070Service.queryTLS26070(frm.getRawValue())
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          // this.data = response.Data;
          // FIXME: 先只取前10筆
          this.data = response.Data.slice(0, 10);
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
    // 是否含稅下拉選項
    // TODO: service是寫死的
    this.taxableService.getSystemTypes().subscribe(data => {
      this.taxOptions = data.map(item => ({
        ...item,
        value: item.value === '1' ? true : false
      }));
    });
  }

  // 清空其他日期相關欄位 // TODO: 待確認
  onReportTypeChange(event: any): void {
    // this.queryForm.patchValue({
    //   onedatedd: null,
    //   onedateyy: null,
    //   weeks: null,
    //   onedatemm: null,
    //   halfyear_onedateyy: null,
    //   halfyear: null,
    //   year_onedateyy: null,
    //   startdate: null,
    //   enddate: null,
    //   sad_startdate: null,
    //   sad_enddate: null,
    //   eventID: null,
    //   event_startdate: null,
    //   event_enddate: null
    // });
  }
}