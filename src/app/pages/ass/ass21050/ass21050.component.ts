import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ASS21050Service } from '@service/api/ass/ass21050.service';
import { finalize } from 'rxjs/operators';
import { formatDateToYYYY_MM_DD } from '@shared/componentkit/table/table.model';
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
  ],
})
export class ASS21050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    LOCATION_No: [''],
    FLOOR_NO: [''],
    AREA_NO: [''],
    LOCATION_Name: ['',[Validators.maxLength(30)]],
    LOCATION_Remark: ['',[Validators.maxLength(200)]],
    SortBy: [[{ field: 'LOCATION_No', order: 1 }]],
  });
  floorNoOptions: IDropdownItem[] = [];
  areaNoOptions: IDropdownItem[] = [];
  ENG_MeterNo_Option: apiOption[] = [];
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  lastQueryBody: any = {};
  columns: any[] = [
    { field: 'LOCATION_No', header: '設備位置編號', visible: true },
    // { field: 'building_no', header: '館別代碼', visible: true },
    { field: 'building_desc', header: '館別名稱', visible: true },
    // { field: 'FLOOR_NO', header: '樓層代碼', visible: true },
    { field: 'floor_desc', header: '樓層名稱', visible: true },
    // { field: 'AREA_NO', header: '區域代碼', visible: true },
    { field: 'area_desc', header: '區域名稱', visible: true },
    { field: 'Draw_X', header: 'X 軸', visible: true },
    { field: 'Draw_Y', header: 'Y 軸', visible: true },
    { field: 'LOCATION_Name', header: '設備位置名稱', visible: true },
    { field: 'LOCATION_Remark', header: '設備位置說明', visible: true },
    { field: 'CRT_Date', header: '日期', visible: true, format: formatDateToYYYY_MM_DD },
    { field: 'CRT_USR_No', header: '變更人員編號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期（最後修改時間）', visible: true, format: formatDateToYYYY_MM_DD },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];


  constructor(
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
    private ass21030Service: ASS21030Service,
    public ass21050Service: ASS21050Service,
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
      const formValue = frm.value;

      // 建構查詢參數，符合後端 API 格式
      const queryBody = {
        PageSize: formValue?.pageSize || 30,
        PageIndex: formValue?.pageIndex || 1,
        OrderBy: "",
        Offset: 0,
        SortBy: formValue?.SortBy || [{ field: 'LOCATION_No', order: 1 }],
        LOCATION_No: formValue.LOCATION_No || "",
        FLOOR_NO: Array.isArray(formValue.FLOOR_NO) ? formValue.FLOOR_NO.join(',') : (formValue.FLOOR_NO || ""),
        AREA_NO: Array.isArray(formValue.AREA_NO) ? formValue.AREA_NO.join(',') : (formValue.AREA_NO || ""),
        LOCATION_Name: formValue.LOCATION_Name || "",
        LOCATION_Remark: formValue.LOCATION_Remark || ""
      };

      // 儲存最後查詢條件供 table-report 使用
      this.lastQueryBody = queryBody;

      // 呼叫查詢 API
      this.ass21050Service.queryASS21050(queryBody).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe({
        next: (response: any) => {
          if (response && response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || 0;
            // 儲存查詢狀態
            this.queryStateService.setQueryState(this.ProgNo, formValue);
          } else {
            this.data = [];
            this.totalRecords = 0;
            console.warn('查詢回應異常:', response);
          }
        },
      });
    });
  }

}
