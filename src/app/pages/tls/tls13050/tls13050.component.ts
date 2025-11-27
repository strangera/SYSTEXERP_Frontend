import { Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { Tls13050Service } from '../../../service/api/tls/tls13050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
@Component({
  selector: 'app-tls13050',
  templateUrl: './tls13050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS13050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    tlt_floorList: [[]],
    tlt_bdate_start: [(new Date()), [Validators.required]],
    tlt_bdate_end: [(new Date()), [Validators.required]],
    tlt_edate_start: [(new Date()), [Validators.required]],
    tlt_edate_end: [(new Date()), [Validators.required]],
    check_day_start: [null],
    check_day_end: [null],
    Building_No: [[]],
    org_idList: [[]],
    ...createPaginationConfig([{ field: 'apply_no', order: 1 }])
  });


  floorOptions: any[] = [];
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  BUILDING_NO_Options: any[] = [];
  organizationCodeOptions: any[] = [];
  columns: any[] = [
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
    { field: 'commissionRate', header: '抽成率', visible: true },
    { field: 'underLimitCommission', header: '包底不足抽成額(含稅)', visible: true, format: formatAmount },
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
          formLabel: item.No + ' ' + item.Name,
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

  onSubmit(form: any): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      // 轉 yyyy-MM-dd
      const formatDate = (date: any): string => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
      };

      const body = {
        PageSize: formValue.PageSize ?? 0,
        PageIndex: formValue.PageIndex ?? 0,
        OrderBy: formValue.OrderBy ?? '',
        Offset: formValue.Offset ?? 0,
        SortBy: formValue.SortBy ?? [{ field: 'apply_no', order: 1 }],

        tlt_floorList: formValue.tlt_floorList || [],
        tlt_bdate_start: formatDate(formValue.tlt_bdate_start),
        tlt_bdate_end: formatDate(formValue.tlt_bdate_end),
        tlt_edate_start: formatDate(formValue.tlt_edate_start),
        tlt_edate_end: formatDate(formValue.tlt_edate_end),
        check_day_start: formValue.check_day_start ?? null,
        check_day_end: formValue.check_day_end ?? null,
      };

      console.log('送出的查詢 body', body);

      this.tls13050Service.queryTLS13050(body).subscribe({
        next: (res) => {
          console.log('查詢成功', res);
          this.data = res.Data || [];
          this.totalRecords = res.TotalCount || this.data.length;
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }


}
