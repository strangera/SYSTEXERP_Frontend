import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { TLS26050Service, TLS26050Data, TLS26050QueryRequest } from '../../../service/api/tls/tls26050.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
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

@Component({
  selector: 'app-tls26050',
  templateUrl: './tls26050.component.html',
  styleUrl: './tls26050.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, TableComponent, TranslateModule, RadiobuttonComponent, CalendarComponent, InputNumberComponent, DropdownComponent, NgIf]
})
export class TLS26050Component extends BasicQueryPageComponent<TLS26050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    // 日期查詢條件（單選報表類型）
    reportType: [1],
    floor: [],
    region: [],
    tax: [],
    type: [],
    organizationCode: [],
    businessTypeCode: [],
    commissionType: [],
    onedatedd: [],
    onedateyy: [],
    weeks: [],
    onedatemm: [],
    halfyear: [],
    startdate: [],
    enddate: [],
    eventID: [],
    counterCode: [],
    ...createPaginationConfig([{ field: 'ID', order: -1 }])
  });

  totalRecords = 0;
  data: TLS26050Data[] = [];
  selectedItems: TLS26050Data[] = [];

  // TODO: 待修改 要設計小計
  columns: Column[] = [
    { field: 'TEAM', header: 'TEAM', visible: true },
    { field: 'GROUP', header: '組別', visible: true },
    { field: 'TARGET_2024', header: '2024目標', visible: true },
    { field: 'SALES_2024', header: '2024預售金額', visible: true },
    { field: 'ACHIEVEMENT_RATE', header: '目標達成率', visible: true },
    { field: 'TX_COUNT_2024', header: '2024交易筆數', visible: true },
    { field: 'AVG_TX_2024', header: '2024客單價', visible: true },
    { field: 'SALES_2023', header: '2023預售金額', visible: true },
    { field: 'TX_COUNT_2023', header: '2023交易筆數', visible: true },
    { field: 'AVG_TX_2023', header: '2023客單價', visible: true },
    { field: 'GROWTH_RATE', header: '成長比', visible: true },
    { field: 'SALES_DIFF', header: '業績差異', visible: true },
    { field: 'TX_COUNT_DIFF', header: '交易筆數差異', visible: true },
    { field: 'AVG_TX_DIFF', header: '客單差異', visible: true },
    { field: 'SALES_YIELD', header: '業績率取', visible: true },
    { field: 'MONTHLY_PERFORMANCE', header: '月坪效', visible: true },
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
    { value: 1, label: '日營業報表' },
    { value: 2, label: '週營業報表' },
    { value: 3, label: '月營業報表' },
    { value: 4, label: '半年營業報表' },
    { value: 5, label: '年營業報表' },
    { value: 6, label: '區間營業報表' },
    { value: 7, label: '活動區間營業報表' },
  ];
  EventIDOptions: any[] = [
    { value: 1, label: '活動1' },
    { value: 2, label: '活動2' },
  ]; daterangeOptions: any[] = [
    { value: 1, label: '日營業報表' },
    { value: 2, label: '週營業報表' },
    { value: 3, label: '月營業報表' },
    { value: 4, label: '半年營業報表' },
    { value: 5, label: '年營業報表' },
    { value: 6, label: '區間營業報表' },
    { value: 7, label: '活動區間營業報表' },
  ];
  halfyearOptions: any[] = [
    { value: 1, label: '上半年' },
    { value: 2, label: '下半年' },
  ];
  //#endregion

  constructor(
    private tls26050Service: TLS26050Service,
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
    this.initializePage('TLS26050', 'tls/tls26050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    const req: TLS26050QueryRequest = {
      ...frm.value,
    };
    this.handleSubmit(frm, () => {
      this.tls26050Service.queryTLS26050(req)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  // 載入選項
  loadOptions() {
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    this.regionService.getRegionOptions().subscribe(data => {
      this.regionOptions = data;
    });
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationOptions = data;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });
    this.commissionTypeService.getCommissionTypes().subscribe((data) => {
      this.commissionTypeOptions = data;
    });
    this.typeService.getTypeOptions().subscribe(data => {
      this.typeOptions = data;
    });
    this.cooperationMethodService.getCooperationMethods().subscribe(data => {
      this.operationsOptions = data;
    });
    this.taxableService.getSystemTypes().subscribe(data => {
      this.taxOptions = data;
    });
    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
    });
  }

  // TODO: 可能用的到
  onReportTypeChange(event: any): void {

  }
}
