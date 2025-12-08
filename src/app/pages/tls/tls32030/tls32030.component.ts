import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { FloorService } from '@service/basic/querySYS3900.service';
import { RegionService } from '@service/basic/querySYS3A00.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TLS32030Data, TLS32030QueryRequest, TLS32030Service } from '../../../service/api/tls/tls32030.service';

import { getSYS1000Options } from '@service/system/sys1000.service';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls32030',
  templateUrl: './tls32030.component.html',
  standalone: true,
  imports: [
    AsyncPipe, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, AccordionModule,
    MenubarComponent, ButtonComponent, CalendarComponent, CalendarRangeComponent,
    CalendarRangeQuickComponent, InputNumberComponent, InputTextComponent, DropdownComponent,
    MultiSelectComponent, RadiobuttonComponent, TableComponent
  ]
})
export class TLS32030Component extends BasicQueryPageComponent<TLS32030Data> implements OnInit {

  queryForm = this.formBuilder.group({
    reportType: ['1', Validators.required],
    BudgetVersion: [""],
    // 日報表
    onedate_Start: [null as Date | null],
    onedate_End: [null as Date | null],
    onedatedd_c_Start: [null as Date | null],
    onedatedd_c_End: [null as Date | null],

    // 週報表
    onedateyy: [null as Date | null],
    weeks: [null as number | null],
    startdate: [null as Date | null],
    enddate: [null as Date | null],
    onedateyy_c: [null as Date | null],
    weeks_c: [null as number | null],
    startdate_c: [null as Date | null],
    enddate_c: [null as Date | null],
    // 月報表
    onedatemm: [null as Date | null],
    onedatemm_c: [null as Date | null],

    // 半年報表
    halfyear_onedateyy: [null as Date | null],
    halfyear: [null as string | null],
    halfyear_onedateyy_c: [null as Date | null],
    halfyear_c: [null as string | null],

    // 年報表
    year_onedateyy: [null as Date | null],
    year_onedateyy_c: [null as Date | null],

    // 區間
    sad_startdate: [null as Date | null],
    sad_enddate: [null as Date | null],
    sad_startdate_c: [null as Date | null],
    sad_enddate_c: [null as Date | null],

    // 活動
    eventID: [null as string | null],
    event_startdate: [null as Date | null],
    event_enddate: [null as Date | null],
    eventID_c: [null as string | null],
    event_startdate_c: [null as Date | null],
    event_enddate_c: [null as Date | null],
    // 合約條件
    floor: [[]],
    region: [[]],
    bus_type: [[]],
    bus_class: [[]],
    tlt_kind: [[]],
    tlt_term_type: [[]],
    org_id: [[]],
    tlt_no: [[]],
    tlt_building: [[]],
    issue: ['2'],
    tax: [true],

    ...createPaginationConfig([{ field: 'counterNumber', order: -1 }])
  });

  data: TLS32030Data[] = [];
  totalRecords = 0;
  selectedItems: TLS32030Data[] = [];

  reportTypeOptions = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
    { value: '7', label: '活動區間營業報表' },
  ];

  halfyearOptions = [
    { value: '1', label: '上半年' },
    { value: '2', label: '下半年' }
  ];

  EventIDOptions = [
    { value: '1', label: '活動1' },
    { value: '2', label: '活動2' }
  ];

  taxOptions = [
    { value: true, label: '含稅' },
    { value: false, label: '未稅' }
  ];
  issueOptions: any[] = [{ value: '0', label: '是' }, { value: '1', label: '否' }, { value: '2', label: '全部' },];

  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  organizationOptions: any[] = [];
  counterCodeOptions = this.dropdown.queryTltTalent();
  operationsOptions = getSYS1000Options('store_way');
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  commissionTypeOptions = getSYS1000Options('tlt_term_type');

  columns: Column[] = [
    { field: 'building_desc', header: '館別' },
    { field: 'Org_Name', header: '組織' },
    { field: 'SYS_Name', header: '櫃別' },
    { field: 'counterNumber', header: '櫃別' },
    { field: 'TltNo', header: '專櫃編號' },
    { field: 'TltName', header: '專櫃名稱' },

    { field: 'Base_LocationNo', header: '位置編號', groupField: 'Base' },
    { field: 'Base_Space', header: '坪數', groupField: 'Base' },
    { field: 'Base_SaleAmt', header: '銷售金額', groupField: 'Base' },
    { field: 'Base_TxnCnt', header: '交易筆數', groupField: 'Base' },
    { field: 'Base_Target', header: '目標', groupField: 'Base' },
    { field: 'Base_DaySpaceEff', header: '日坪效', groupField: 'Base' },
    { field: 'Base_AchieveRate', header: '達成率', groupField: 'Base' },
    { field: 'Base_AvgTicket', header: '客單價', groupField: 'Base' },

    { field: 'Comp_LocationNo', header: '位置編號', groupField: 'Comp' },
    { field: 'Comp_Space', header: '坪數', groupField: 'Comp' },
    { field: 'Comp_SaleAmt', header: '銷售金額', groupField: 'Comp' },
    { field: 'Comp_TxnCnt', header: '交易筆數', groupField: 'Comp' },
    { field: 'Comp_Target', header: '目標', groupField: 'Comp' },
    { field: 'Comp_DaySpaceEff', header: '日坪效', groupField: 'Comp' },
    { field: 'Comp_AchieveRate', header: '達成率', groupField: 'Comp' },
    { field: 'Comp_AvgTicket', header: '客單價', groupField: 'Comp' },

    { field: 'Diff_SaleAmt', header: '銷售金額差異', groupField: 'Diff' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', groupField: 'Diff' },
    { field: 'Diff_Target', header: '目標差異', groupField: 'Diff' },
    { field: 'Diff_DaySpaceEff', header: '日坪效差異', groupField: 'Diff' },
    { field: 'Diff_AchieveRate', header: '達成率差異', groupField: 'Diff' },
    { field: 'Diff_AvgTicket', header: '客單價差異', groupField: 'Diff' },

    { field: 'Diff_SaleAmt', header: '銷售金額差異', groupField: 'Diff' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', groupField: 'Diff' },
    { field: 'Diff_Target', header: '目標差異', groupField: 'Diff' },
    { field: 'Diff_DaySpaceEff', header: '日坪效差異', groupField: 'Diff' },
    { field: 'Diff_AchieveRate', header: '達成率差異', groupField: 'Diff' },
    { field: 'Diff_AvgTicket', header: '客單價差異', groupField: 'Diff' },

  ];
  columnGroup = [
    { header: '基準', field: 'Base' },
    { header: '比較', field: 'Comp' },
    { header: '差異', field: 'Diff' },
    { header: '成長率', field: 'Growth' }
  ];

  constructor(
    private tls32030Service: TLS32030Service,
    private dropdown: DropdownApiService,
    private floorService: FloorService,
    private regionService: RegionService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32030', 'tls/tls32030', this.queryForm, f => this.onSubmit(f));

    this.setDateDefaults('1');

    this.queryForm.controls.reportType.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(v => this.setDateDefaults(v ?? '1'));
    this.loadOptions();
  }

  private formatDate(val: any): string | null {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString().substring(0, 10);
    return val;
  }

  private buildQueryRequest(): TLS32030QueryRequest {
    const raw = this.queryForm.getRawValue();
    const pageSize = raw.pageSize ?? 20;
    const pageIndex = raw.pageIndex ?? 1;
    const d = this.resolveDateRange(raw);

    return {
      PageSize: pageSize,
      PageIndex: pageIndex,
      Offset: (pageIndex - 1) * pageSize,
      OrderBy: '',
      SortBy: raw.SortBy ?? [],

      BaseDateFrom: this.formatDate(d.BaseFrom),
      BaseDateTo: this.formatDate(d.BaseTo),
      CompareDateFrom: this.formatDate(d.CompFrom),
      CompareDateTo: this.formatDate(d.CompTo),

      BudgetVersion: null,
      AmtTaxMode: raw.tax ? '1' : '0',
      ReceFilter: raw.issue ?? null,

      FloorList: raw.floor ?? [],
      AreaList: raw.region ?? [],
      BusTypeList: raw.bus_type ?? [],
      BusClassList: raw.bus_class ?? [],
      TltKindList: raw.tlt_kind ?? [],
      OrgList: raw.org_id ?? [],
      TltNoList: raw.tlt_no ?? [],
      TermTypeList: raw.tlt_term_type ?? [],
      BuildingList: raw.tlt_building ?? [],
    };
  }

  private resolveDateRange(raw: any) {
    const rt = raw.reportType;

    // 預設皆為 null，避免 undefined 報錯
    let BaseFrom: Date | null = null;
    let BaseTo: Date | null = null;
    let CompFrom: Date | null = null;
    let CompTo: Date | null = null;

    switch (rt) {
      case '1': // 日報表
        BaseFrom = raw.onedate_Start;
        BaseTo = raw.onedate_End;

        CompFrom = raw.onedatedd_c_Start;
        CompTo = raw.onedatedd_c_End;
        break;

      case '2': // 週報表
        BaseFrom = raw.startdate;
        BaseTo = raw.enddate;

        CompFrom = raw.startdate_c;
        CompTo = raw.enddate_c;
        break;

      case '3': { // 月報表
        if (raw.onedatemm) {
          const y = raw.onedatemm.getFullYear();
          const m = raw.onedatemm.getMonth();
          BaseFrom = new Date(y, m, 1);
          BaseTo = new Date(y, m + 1, 0);
        }
        if (raw.onedatemm_c) {
          const y = raw.onedatemm_c.getFullYear();
          const m = raw.onedatemm_c.getMonth();
          CompFrom = new Date(y, m, 1);
          CompTo = new Date(y, m + 1, 0);
        }
        break;
      }

      case '4': { // 半年報表
        const year = raw.halfyear_onedateyy?.getFullYear();
        const half = raw.halfyear;

        if (year) {
          if (half === '1') {
            BaseFrom = new Date(year, 0, 1);
            BaseTo = new Date(year, 5, 30);
          } else {
            BaseFrom = new Date(year, 6, 1);
            BaseTo = new Date(year, 11, 31);
          }
        }

        const cyear = raw.halfyear_onedateyy_c?.getFullYear();
        const chalf = raw.halfyear_c;

        if (cyear) {
          if (chalf === '1') {
            CompFrom = new Date(cyear, 0, 1);
            CompTo = new Date(cyear, 5, 30);
          } else {
            CompFrom = new Date(cyear, 6, 1);
            CompTo = new Date(cyear, 11, 31);
          }
        }
        break;
      }

      case '5': { // 年報表
        const y1 = raw.year_onedateyy?.getFullYear();
        const y2 = raw.year_onedateyy_c?.getFullYear();

        if (y1) {
          BaseFrom = new Date(y1, 0, 1);
          BaseTo = new Date(y1, 11, 31);
        }
        if (y2) {
          CompFrom = new Date(y2, 0, 1);
          CompTo = new Date(y2, 11, 31);
        }
        break;
      }

      case '6': // 區間
        BaseFrom = raw.sad_startdate;
        BaseTo = raw.sad_enddate;

        CompFrom = raw.sad_startdate_c;
        CompTo = raw.sad_enddate_c;
        break;

      case '7': // 活動
        BaseFrom = raw.event_startdate;
        BaseTo = raw.event_enddate;

        CompFrom = raw.event_startdate_c;
        CompTo = raw.event_enddate_c;
        break;
    }


    return {
      BaseFrom,
      BaseTo,
      CompFrom,
      CompTo
    };
  }


  private setDateDefaults(rt: string) {
    const f = this.queryForm;
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    switch (rt) {
      case '1':
        f.patchValue({
          onedate_Start: base,
          onedate_End: base,
          onedatedd_c_Start: new Date(base.getTime() - 86400000),
          onedatedd_c_End: new Date(base.getTime() - 86400000)
        });
        break;

      case '2': {
        const monday = new Date(base);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);

        f.patchValue({
          onedateyy: today,
          weeks: 1,
          startdate: monday,
          enddate: sunday,

          onedateyy_c: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
          weeks_c: 1,
          startdate_c: new Date(monday.getTime() - 7 * 86400000),
          enddate_c: new Date(sunday.getTime() - 7 * 86400000)
        });
        break;
      }

      case '3':
        f.patchValue({
          onedatemm: new Date(today.getFullYear(), today.getMonth(), 1),
          onedatemm_c: new Date(today.getFullYear(), today.getMonth() - 1, 1)
        });
        break;

      case '4':
        f.patchValue({
          halfyear_onedateyy: new Date(today.getFullYear(), 0, 1),
          halfyear: today.getMonth() < 6 ? '1' : '2',
          halfyear_onedateyy_c: new Date(today.getFullYear() - 1, 0, 1),
          halfyear_c: today.getMonth() < 6 ? '2' : '1'
        });
        break;

      case '5':
        f.patchValue({
          year_onedateyy: new Date(today.getFullYear(), 0, 1),
          year_onedateyy_c: new Date(today.getFullYear() - 1, 0, 1)
        });
        break;

      case '6':
        f.patchValue({
          sad_startdate: base,
          sad_enddate: base,
          sad_startdate_c: new Date(base.getTime() - 86400000),
          sad_enddate_c: new Date(base.getTime() - 86400000)
        });
        break;

      case '7':
        f.patchValue({
          eventID: '1',
          event_startdate: base,
          event_enddate: base,
          eventID_c: '1',
          event_startdate_c: new Date(base.getTime() - 86400000),
          event_enddate_c: new Date(base.getTime() - 86400000)
        });
        break;
    }
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const req = this.buildQueryRequest();
      this.tls32030Service.queryTLS32030(req)
        .pipe(finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

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


  }
}

