import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs/operators';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { QueryTLS13050Request, TLS13050QueryItem, Tls13050Service } from '../../../service/api/tls/tls13050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmount } from '../../../shared/componentkit/table/table.model';
@Component({
  selector: 'app-tls13050',
  templateUrl: './tls13050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS13050Component extends BasicQueryPageComponent<TLS13050QueryItem> implements OnInit {
  queryForm = this.formBuilder.group({
    tlt_floorList: [[]],
    tlt_bdate_start: [null],
    tlt_bdate_end: [null],
    tlt_edate_end: [null],
    tlt_edate_start: [null],
    cag_bdate_start: [""],
    cag_bdate_end: [""],
    cag_edate_end: [""],
    cag_edate_start: [""],
    check_day_start: [null],
    check_day_end: [null],
    Building_No: [[]],
    org_idList: [[]],
    perf_edate: [null as Date | null],
    pageIndex: [0],
    pageSize: [0],
    SortBy: [[{ field: 'check_day', order: 0 }]]
  });
  // expansion 明細分頁選項（只在本頁使用）
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];

  floorOptions: any[] = [];
  data: TLS13050QueryItem[] = [];
  selectedItems: TLS13050QueryItem[] = [];
  totalRecords = 0;
  BUILDING_NO_Options: any[] = [];
  organizationCodeOptions: any[] = [];
  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_building', header: '館別', visible: true, format: (value: string) => this.getBuildingName(value) },
    { field: 'FloorText', header: '樓層', visible: true, format: (value: string) => this.getFloorName(value) },
    { field: 'org_name', header: '組織名稱', visible: true },
    { field: 'LocationText', header: '位置編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'cag_bdate', header: '起始日期', visible: true },
    { field: 'cag_edate', header: '結束日期', visible: true },
    { field: 'sad_sale_amt_sum', header: '(A)累積營業實績', visible: true, format: formatAmount },
    { field: 'limit_amt', header: '(B)年度包底金額', visible: true, format: formatAmount },
    { field: 'accumulated_diff', header: '(A-B)累積差額', visible: true, format: formatAmount },
    { field: 'limit_charge_rate', header: '抽成率', visible: true },
    { field: 'limit_charge_amt', header: '包底不足抽成額(含稅)', visible: true, format: formatAmount },
    { field: 'finishedrate', header: '年度包底營業額完成率', visible: true },
    { field: 'check_day', header: '月結天數', visible: true },
  ];
  buildingNoOptions: IDropdownItem[] = [];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private tls13050Service: Tls13050Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13050', undefined, this.queryForm, (form) => this.onSubmit(form));

    this.locationOptionsService.getBuildingOptions().subscribe({
      next: (res) => this.BUILDING_NO_Options = res,
    });
    this.locationOptionsService.getFloorOptions().subscribe({
      next: (res) => this.floorOptions = res,
    });
    // 館別
    this.dropDownListService.querySYS3800_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.buildingNoOptions = res.Data.map(x => ({
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No
        }));
      });
    // 組織代碼/名稱
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.organizationCodeOptions = (res.Data || []).map(item => ({
          ...item,
          formLabel: `${item.No}-${item.Name}`,
          value: item.No
        }));
      });
  }

  getBuildingName(buildingNo: string): string {
    if (!buildingNo) return '';
    const building = this.buildingNoOptions.find(opt => opt.No === buildingNo || opt.value === buildingNo);
    return building ? building.Name : buildingNo;
  }

  getFloorName(floorText: string): string {
    if (!floorText) return '';
    if (floorText.includes('/')) {
      return floorText.split('/')[1];
    }
    return floorText;
  }

  private formatQueryDate(date: unknown): string {
    if (!date) return '';
    const parsedDate = date instanceof Date ? date : new Date(String(date));
    if (isNaN(parsedDate.getTime())) return '';

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  }

  private buildQueryBody(formValue: any): QueryTLS13050Request {
    return {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: formValue.OrderBy ?? '',
      Offset: 0,
      SortBy: Array.isArray(formValue.SortBy) && formValue.SortBy.length > 0
        ? formValue.SortBy
        : [{ field: 'check_day', order: 0 }],
      tlt_floorList: formValue.tlt_floorList ?? [],
      tlt_bdate_start: this.formatQueryDate(formValue.tlt_bdate_start),
      tlt_bdate_end: this.formatQueryDate(formValue.tlt_bdate_end),
      tlt_edate_start: this.formatQueryDate(formValue.tlt_edate_start),
      tlt_edate_end: this.formatQueryDate(formValue.tlt_edate_end),
      cag_bdate_start: this.formatQueryDate(formValue.cag_bdate_start),
      cag_bdate_end: this.formatQueryDate(formValue.cag_bdate_end),
      cag_edate_start: this.formatQueryDate(formValue.cag_edate_start),
      cag_edate_end: this.formatQueryDate(formValue.cag_edate_end),
      check_day_start: this.formatNullableNumber(formValue.check_day_start),
      check_day_end: this.formatNullableNumber(formValue.check_day_end),
      org_idList: formValue.org_idList ?? [],
      Building_No: formValue.Building_No ?? [],
      perf_edate: this.formatQueryDate(formValue.perf_edate),
    };
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const body = this.buildQueryBody(form.getRawValue());

      this.tls13050Service.queryTLS13050(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (res) => {
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
          },

        });
    });
  }


}
