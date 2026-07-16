import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls12060Service } from '@service/api/tls/tls12060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { formatDateTime } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { formatDate } from '../../../others/component/table/table.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';

export interface response10260 {
  "id": number,
  "tlt_name": string,
  "contact_person": string,
  "contact_date": Date,
  "vendor_name": string,
  "bus_type": string,
  "contact_type": string,
  "contract_subno": number,
  "rent_space": number,
  "approve_desc": string,
  "crt_date": Date,
  "tlt_no": string,
  "location": string
}

export interface POS2013 {
  No: string,
  Name: string,
  ShortName: string,
  VEN_No: string,
  VEN_EngName: string,

  Label: string,
}

// 2.1.2.6 招商進度監控(報表)
@Component({
  selector: 'app-tls12060',
  templateUrl: './tls12060.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, InputNumberRangeComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableReportComponent, TranslateModule]
})
export class TLS12060Component extends BasicQueryPageComponent<response10260> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    contract_type: [[]],  // 合約種類(要約書、契約書)
    contract_status: [[]], //  合約狀態 (未審核、已審核、已作廢)
    CreatedDateStart: [null],  // 接洽日期_起始日
    CreatedDateEnd: [null],  // 接洽日期_終止日

    contact_USR: [[], [Validators.maxLength(100)]], // 接洽人員
    cus_uniform_id: [[], [Validators.maxLength(100)]], // 廠商統一編號
    bus_type: [[], [Validators.maxLength(2)]], // 業種-大分類代碼(tltbustype)

    area: [[], [Validators.maxLength(100)]],  // 區域
    floor: [[], [Validators.maxLength(100)]],  // 樓層
    location: [[], [Validators.maxLength(100)]],  // 位置編號 (應該是SYS3A00這支)

    each_row: [['10'], [Validators.min(1), Validators.max(100)]], // 每頁顯示行數
    version_start: [null, [Validators.min(0)]], // 版本起始
    version_end: [null, [Validators.min(0)]], // 版本終止
    counter: [[], [Validators.min(0)]], // 專櫃編號

    tlt_building: [[],], // 館別 (SYS3800)

    //分頁查詢
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'contact_USR_No', order: 1 }]],
  });
  // 表格
  // ----------------------------------------------------------------
  lastQueryBody: any;
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  contact_type_Option: option[] = [
    { value: '3', label: '要約書' },
    { value: '4', label: '契約書' },
  ]; // 合約種類
  contract_status_Option: option[] = [
    { value: '1', label: '未審核' },
    { value: '2', label: '已審核' },
    { value: '3', label: '已作廢' },
  ]; // 合約狀態
  contactName_Option: option[] = []; // 接洽人員

  bus_type_Option: apiOption[] = []; // 業種-大分類代碼
  area_Option: apiOption[] = []; // 區域
  floor_Option: apiOption[] = []; // 樓層
  location_Option: apiOption[] = []; // 位置編號
  cus_uniform_Option: POS2013[] = []; // 廠商統一編號(pos2013)
  contact_USR_Option: apiOption[] = [];  // 接洽人員代碼/名稱
  TLTTalent_Option: apiOption[] = []; // 專櫃編號
  tlt_building_Option: apiOption[] = []; // 館別

  data: response10260[] = [];
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃', visible: true },
    { field: 'contact_person', header: '洽談者', visible: true },
    { field: 'contact_date', header: '洽談日', visible: true, format: formatDate },
    { field: 'vendor_name', header: '統編/廠商', visible: true },
    { field: 'bus_type', header: '大分類代碼', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'location', header: '位置編號', visible: true },
    { field: 'contact_type', header: '合約種類', visible: true },
    { field: 'contract_subno', header: '版本', visible: true },
    { field: 'rent_space', header: '位置租賃數', visible: true },
    { field: 'approve_desc', header: '合約狀態', visible: true },
    { field: 'crt_date', header: '建立日期', visible: true, format: formatDateTime }
  ];

  selectedItems: response10260[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    public readonly tls12060Service: Tls12060Service,
    private dropDownListService: DropDownListService) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12060', 'TLS/TLS12060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    // console.log('查詢條件', frm.value);
    console.log('查詢條件', JSON.stringify(frm.value, null, 2));
    this.handleSubmit(frm, () => {
      this.tls12060Service.queryTLS12060(frm.value).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.lastQueryBody = frm.value;
            this.data = response.Data || [];
            console.log('Result', response.data);
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

  isRowSelectable(): boolean {
    return false;
  }

  loadOptions() {
    // 查 接待人員(包含狀態停用)
    this.dropDownListService.queryTBLUSER_AllStatus_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.contact_USR_Option = response.Data.map((item: any) => ({
        No: item.No, // 接待人員 代碼
        Name: item.Name, // 接待人員 名稱
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      console.log('接待人員代號:', this.contact_USR_Option);
    });

    // 查 大分類(專櫃)
    this.tls12060Service.queryTLTBUSTYPE_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.bus_type_Option = response.Data.map((item: any) => ({
        No: item.No, // 大分類(專櫃) 號
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      console.log('大分類代號:', this.bus_type_Option);
    });
    // 查 樓層
    this.tls12060Service.querySYS3900_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.floor_Option = response.Data.map((item: any) => ({
        No: item.No, // 樓層 號
        Name: item.Name, // 樓層 名稱
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      console.log('大分類代號:', this.floor_Option);
    });
    //查 位置編號
    this.tls12060Service.queryPOS2002_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.location_Option = response.Data.map((item: any) => ({
        No: item.No, // 位置編號
        Name: item.Name, // 位置 名稱
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      console.log('location_Option:', this.location_Option);
    });
    // 查 區域代碼
    this.tls12060Service.querySYS3A00_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.area_Option = response.Data.map((item: any) => ({
        No: item.No, // 區域代碼
        Name: item.Name, // 區域 名稱
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      console.log('area_Option:', this.area_Option);
    });
    // 查 櫃編
    this.tls12060Service.queryTLTTALENT_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.TLTTalent_Option = response.Data.map((item: any) => ({
        No: item.No, // 櫃編 代碼
        Name: item.Name, // 櫃編 名稱
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      console.log('area_Option:', this.TLTTalent_Option);
    });

    // 查 統編
    this.tls12060Service.queryPOS2013_DropDownList({ "VEN_Flag": '1' }).pipe(untilDestroyed(this)).subscribe((response) => {
      // 去除重複的 No，只保留第一筆
      const uniqueMap = new Map<string, any>();
      response.Data.forEach((item: any) => {
        if (!uniqueMap.has(item.No)) {
          uniqueMap.set(item.No, item);
        }
      });

      // 建立 dropdown options
      this.cus_uniform_Option = Array.from(uniqueMap.values()).map((item: any) => ({
        No: item.No,
        Name: item.Name,
        ShortName: item.ShortName,
        VEN_No: item.VEN_No,
        VEN_EngName: item.VEN_EngName,
        Label: item.No + '-' + item.Name,
      }));

      console.log('統編代號(去重):', this.cus_uniform_Option);
    });

    //查 館別
    this.tls12060Service.querySYS3800_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.tlt_building_Option = response.Data.map((item: apiOption) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '-' + item.Name,
      }));

      console.log('館別:', this.tlt_building_Option);
    });
  }
}
