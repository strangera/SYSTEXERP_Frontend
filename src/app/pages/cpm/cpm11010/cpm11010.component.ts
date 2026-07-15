import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { CPM11010Data, CPM11010Service } from '../../../service/api/cpm/cpm11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../others/component/table/table.component';

@Component({
  selector: 'app-cpm11010',
  templateUrl: './cpm11010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule
  ]
})
export class CPM11010Component extends BasicQueryPageComponent<CPM11010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    building_no: [[]],    // 館別(多選)
    FLOOR_NO: [[]],       // 營業樓層(多選)
    AREA_NO: [[]],        // 營業區域(多選)
    Service_Id: [[]],     // 位置編號(多選)
    Service_Name: ['', Validators.maxLength(60)],   // 服務台位置名稱
    ...createPaginationConfig([])
  });

  data: CPM11010Data[] = [];
  selectedItems: CPM11010Data[] = [];
  totalRecords = 0;

  // 下拉選單選項
  buildingNoOptions: IDropdownItem[] = [];
  floorNoOptions: IDropdownItem[] = [];
  areaNoOptions: any[] = [];
  serviceIdOptions: any[] = [];

  columns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'building_no', header: '館別', hidden: true },
    { field: 'building_desc', header: '館別', visible: true },
    { field: 'FLOOR_NO', header: '營業樓層', hidden: true },
    { field: 'FLOOR_desc', header: '營業樓層', visible: true },
    { field: 'AREA_NO', header: '營業區域', hidden: true },
    { field: 'AREA_desc', header: '營業區域', visible: true },
    { field: 'Service_Id', header: '服務台位置編號', visible: true },
    { field: 'Service_Name', header: '服務台位置名稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', hidden: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員編號', hidden: true },
    { field: 'CRT_USR_Name', header: '建立人員名稱', hidden: true },
    { field: 'UPD_Date', header: '更新日期', hidden: true, format: formatDate },
    { field: 'UPD_USR_No', header: '更新人員編號', hidden: true },
    { field: 'UPD_USR_Name', header: '更新人員名稱', hidden: true }
  ];

  constructor(
    private cpm11010Service: CPM11010Service,
    private dropdownApiService: DropdownApiService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11010', 'cpm/cpm11010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.cpm11010Service.queryCPM11010(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  onDelete(selectedItems: CPM11010Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const idList = selectedItems.map(item => item.ID);
        this.cpm11010Service.deleteCPM11010({ idList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }

  loadOptions() {
    // 載入館別選項
    this.dropdownApiService.querySys3800().subscribe(options => {
      this.buildingNoOptions = options ?? [];
    });
    // 載入營業樓層選項
    this.dropdownApiService.querySys3900().subscribe(options => {
      this.floorNoOptions = options ?? [];
    });
    // 載入營業區域選項
    this.dropdownApiService.querySys3A00().subscribe(options => {
      this.areaNoOptions = options?.map(item => ({ label: item.Name, value: item.No })) || [];
    });
    // 載入服務台位置編號選項
    this.dropDownListService.queryCPM11010_ServiceId_DropDownList().subscribe(response => {
      this.serviceIdOptions = response.Data?.map(item => ({ label: `${item.Service_Id}-${item.Service_Name}`, value: item.Service_Id })) || [];
    });
  }
}