import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { apiOption } from '@shared/models/tls/tls000.model';
import { ASS21030Service } from '@service/api/ass/ass21030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
@Component({
  selector: 'app-ass21050',
  templateUrl: './ass21050.component.html',
  styleUrls: ['./ass21050.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    TranslateModule,
    TableReportComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class ASS21050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ENG_MeterNo: [''],
    FLOOR_NO: [''],
    AREA_NO: [''],
    remark: [''],
    SortBy: [[{ field: 'ENG_MeterNo', order: 1 }]],
  });
  floorNoOptions: IDropdownItem[] = [];
  areaNoOptions: IDropdownItem[] = [];
  ENG_MeterNo_Option: apiOption[] = [];
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  lastQueryBody: any = {};
  columns: any[] = [
    { field: 'gasCourseCode', header: '錶號位置編號', visible: true },
    { field: 'counterCode', header: '樓層', visible: true },
    { field: 'areaRatio', header: '區域', visible: true },
    { field: 'counterCategory', header: '平面圖X座標', visible: true },
    { field: 'remarks', header: '平面圖Y座標', visible: true },
    { field: 'areaRatio', header: '說明', visible: true },
  ];


  constructor(
    private ass21030Service: ASS21030Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21050', '/ASS/ASS21050CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  loadOptions() {
    // 查 取得能源表號
    this.ass21030Service.queryENG1001_ENG_MeterNo_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.ENG_MeterNo_Option = response.Data.map((item: any) => ({
        No: item.ENG_MeterNo,
        Name: item.ENG_MeterNo,
      }));
    });
    // 載入營業樓層選項
    this.dropdownApiService.querySys3900().subscribe(options => {
      this.floorNoOptions = options ?? [];
    });
    // 載入營業區域選項
    this.dropdownApiService.querySys3A00().subscribe(options => {
      this.areaNoOptions = options ?? [];
    });
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;


    });
  }

}
