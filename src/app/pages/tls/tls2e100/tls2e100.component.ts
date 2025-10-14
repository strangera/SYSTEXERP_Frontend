import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Button } from 'primeng/button';

// 2.2.14.10 年度對帳單
@Component({
  selector: 'app-tls2e100',
  templateUrl: './tls2e100.component.html',
  styleUrl: './tls2e100.component.scss',
  standalone: true,
  imports: [MenubarComponent, Button, TableReportComponent, AccordionModule, MultiSelectComponent, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class TLS2E100Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    sad_date: [new Date()],
    tlt_floorList: [[]],
    tlt_noList: [[]],
    Floor_No: [[]],
    tlt_buildingList: [[]],
    org_idList: [[]],
    ...createPaginationConfig([{ field: 'TLT_NoList', order: 1 }]),
  });

  columns: any[] = [
    { field: 'apply_no', header: '招募編號	', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true },
    { field: 'tlt_id', header: '類別代號', visible: true },
    { field: 'tlt_id_desc', header: '類別名稱', visible: true },
    { field: 'Jan', header: '一月', visible: true },
    { field: 'Feb', header: '二月	', visible: true },
    { field: 'Mar', header: '三月	', visible: true },
    { field: 'Apr', header: '四月	', visible: true },
    { field: 'May', header: '五月	', visible: true },
    { field: 'Jun', header: '六月	', visible: true },
    { field: 'Jul', header: '七月	', visible: true },
    { field: 'Aug', header: '八月	', visible: true },
    { field: 'Sep', header: '九月	', visible: true },
    { field: 'Oct', header: '十月	', visible: true },
    { field: 'Nov', header: '十一月	', visible: true },
    { field: 'Dec', header: '十二月	', visible: true },
    { field: 'tlt_id_count', header: '類別小計	', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  org_id_Option: IDropdownItem[] = [];
  tltNoOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  floorOptions: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  constructor(
    private dropDownListService: DropDownListService,
    private locationOptionsService: LocationOptionsService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E100', 'TLS/TLS2E100cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.org_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    })
    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.Data) {
          this.tltNoOptions = res.Data.map(item => ({
            label: `${item.No} ${item.Name}`,
            value: item.No,
            No: item.No,
            Name: item.Name
          }));
        }
      });
    this.locationOptionsService.getFloorOptions().subscribe({
      next: (res) => {
        this.floorOptions = res.map((item: any) => ({
          label: item.name || item.FLOOR_NAME || item.label,
          value: item.code || item.FLOOR_NO || item.value
        }));
      },
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
  }



  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}

