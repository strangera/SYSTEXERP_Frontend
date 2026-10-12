import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { AccordionModule } from 'primeng/accordion';
import { formatDate } from '../../../others/component/table/table.model';
import { Tls14010Service } from '../../../service/api/tls/tls14010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';

//建立查詢項目的interface
export interface TLTContract {
  tlt_no: string;              // 專櫃編號
  tlt_name: string;            // 專櫃名稱(品牌)
  contract_subno: string;      // 版本
  bus_type: string;            // 大分類 (代碼)
  bus_type_name: string;       // 大分類 (名稱)
  tlt_bdate: string;           // 合約起始日 (ISO 日期字串)
  tlt_edate: string;           // 合約終止日
  tlt_contract_bdate: string;  // 營運起始日
  tlt_contract_edate: string;  // 營運終止日
  apply_status: string;        // 合約狀態 (代碼)
  LocationText: string;            // 承租內容
  tlt_openflag: string;        // 營運狀況 (代碼)
}

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-tls14010',
  templateUrl: './tls14010.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, MultiSelectComponent, InputTextComponent, DropdownComponent, CalendarRangeComponent, ButtonComponent, TableReportComponent, TranslateModule]
})

// 合約狀態清單
export class TLS14010Component extends BasicQueryPageComponent<TLTContract>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // TLTTALENT_專櫃主檔+ TLTTALENT_LOCATION_專櫃店位明細檔
    tlt_noList: [[], [Validators.maxLength(12)]], // 專櫃編號
    tlt_name: ['', [Validators.maxLength(100)]], // 專櫃名稱(品牌)
    location_noList: [[], [Validators.maxLength(10)]], // 位置編號 店位代碼-館別(1)+樓層(2)+區域(1)+流水編號(3)
    tlt_building: [''], // 館別 (SYS3800)
    tlt_floorList: [[]], // 樓層(SYS3900)
    area_noList: [[]], // 區域 (SYS3a00)
    bus_typeList: [[]], // 大分類 (tltbustype)
    org_idList: [[]], // 組織代碼 (SYS3100) 0916新增

    tlt_openflagList: [[]], // 營運狀況 閉店/撤櫃, 營業中, 合約結束,核准時合約尚未開始, 洽談中, 簽約中, 已作廢 fix
    contract_subno_start: ['', [Validators.maxLength(100)]], // 版本編號_start
    contract_subno_end: ['', [Validators.maxLength(100)]], // 版本編號_end
    apply_statusList: [[], [Validators.maxLength(100)]], // 合約狀態 1=未審核 2=已審核 fix
    tlt_bdate: [null], // 營運起始日
    tlt_edate: [null], // 營運終止日

    //分頁查詢
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'tlt_no', order: 0 }, { field: 'contract_subno', order: 1 }]],
  });
  // 表格
  // ----------------------------------------------------------------
  lastQueryBody: any;
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  tlt_openOptions: option[] = [ //營運狀況選單
    { value: '0', label: '已撤櫃' },
    { value: '1', label: '營業中' },
    { value: '9', label: '合約未生效' }, // user需求需使用 '合約未生效'
  ];
  statusOptions: option[] = [ // 合約狀態的下拉選單
    { value: "1", label: '未審核' },
    { value: "2", label: '已審核' },
  ];

  tlt_noOptions: apiOption[] = []; // 專櫃清單的下拉選單
  tlt_floorOptions: apiOption[] = []; // 樓層的下拉選單
  areaOptions: apiOption[] = []; // 區域的下拉選單
  bus_typeOptions: apiOption[] = []; // 大分類的下拉選單
  location_noOptions: apiOption[] = []; // 位置的下拉選單
  buildingOptions: apiOption[] = []; // 館別的下拉選單
  org_idOptions: apiOption[] = []; // 組織代碼的下拉選單 0916新增
  ven_uniform_Options: apiOption[] = []; // 統編代碼的下拉選單 1106新增

  data: TLTContract[] = [];
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱(品牌)', visible: true },
    { field: 'ven_uniform', header: '廠商統編', visible: true },
    { field: 'VEN_Name', header: '廠商統編名稱', visible: true },
    { field: 'contract_subno', header: '版本', visible: true },
    { field: 'bus_type', header: '大分類', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'tlt_contract_bdate', header: '營運起始日', visible: true, format: (value: string) => value ? new Date(value).toLocaleDateString() : '' },
    { field: 'tlt_contract_edate', header: '營運終止日', visible: true, format: (value: string) => value ? new Date(value).toLocaleDateString() : '' },
    { field: 'tlt_bdate', header: '合約起始日', visible: true, format: (value: string) => value ? new Date(value).toLocaleDateString() : '' },
    { field: 'tlt_edate', header: '合約終止日', visible: true, format: (value: string) => value ? new Date(value).toLocaleDateString() : '' },
    { field: 'apply_status', header: '合約狀態', visible: true, format: (value: string) => this.statusOptions.find((option) => option.value === value)?.label || value },
    { field: 'LocationText', header: '承租內容', visible: true },
    { field: 'tlt_openflag', header: '營運狀況', visible: true, format: (value: string) => this.tlt_openOptions.find((option) => option.value === value)?.label || value },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];

  selectedItems: TLTContract[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    public readonly tls14010Service: Tls14010Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS14010', 'TLS/TLS14010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  //測試位置 B1B19
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      this.tls14010Service.queryTLS14010(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            this.lastQueryBody = frm.value;
            this.data = response.Data || [];
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  loadOptions() {
    {
      // 專櫃專櫃清單(TLTTALENT) 下拉選單
      this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
        this.tlt_noOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('tlt_noOptions:', this.tlt_noOptions);
      });
      // 樓層(SYS3900) 下拉選單
      this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
        this.tlt_floorOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('tlt_floorOptions:', this.tlt_floorOptions);
      });
      // 區域(SYS3A00) 下拉選單
      this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
        this.areaOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('areaOptions:', this.areaOptions);
      });
      // 專櫃大分類(TLTBUSTYPE) 下拉選單
      this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
        this.bus_typeOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('bus_typeOptions:', this.bus_typeOptions);
      });
      // 館別(SYS3800) 下拉選單
      this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
        this.buildingOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('buildingOptions:', this.buildingOptions);
      });
      // 位置編號(SYS3A00) 下拉選單
      this.dropDownListService.queryPOS2002_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
        this.location_noOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('buildingOptions:', this.location_noOptions);
      });
      // 組織代碼(SYS3100) 下拉選單
      this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
        this.org_idOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('組織代碼:', this.org_idOptions);
      });
    }
  }
}
