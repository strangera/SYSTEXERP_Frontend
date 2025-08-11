import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { Tls12060Service } from '@service/api/tls/tls12060.service';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { createPaginationConfig, formatDateTime } from '@shared/componentkit/table2/table2.model';
import { ReportTableGroupComponent } from '@shared/componentkit/report-table-group/report-table-group.component';

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
  styleUrl: './tls12060.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, InputTextComponent, InputNumberComponent, InputNumberRangeComponent, AccordionModule, FormsModule, ReactiveFormsModule, ReportTableGroupComponent, CalendarComponent, CalendarRangeComponent, CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableComponent, TranslateModule]
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

    //分頁查詢
    ...createPaginationConfig([{ field: 'contact_USR_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
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

  data: response10260[] = [];
  columns: Column[] = [
    { field: 'tlt_name', header: '專櫃', visible: true },
    { field: 'contact_person', header: '洽談者', visible: true },
    { field: 'contact_date', header: '洽談日', visible: true, format: formatDate },
    { field: 'vendor_name', header: '統編/廠商', visible: true },
    { field: 'bus_type', header: '大分類', visible: true },
    { field: 'contract_type', header: '合約種類', visible: true },

    { field: 'contract_subno', header: '版本', visible: true },
    { field: 'rent_space', header: '位置租賃數', visible: true },
    { field: 'approve_desc', header: '合約狀態', visible: true },
    { field: 'crt_date', header: '建立日期', visible: true, format: formatDateTime },
  ];

  selectedItems: response10260[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(private tls12060Service: Tls12060Service) {
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
      this.tls12060Service.queryTLS12060(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
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

  // 刪除項目
  onDelete(data: response10260 | response10260[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集所有有效的 ID
    const idList = items
      .filter((item) => item && item.id != null && item.id !== undefined)
      .map((item) => item.id);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    // const deleteBody = {
    //   idList: idList, // 符合 API 的 idList 格式
    // };

    // this.tls12010Service.deleteTLS12010(deleteBody).subscribe({
    //   next: (response) => {
    //     if (response.Status === '0000') {
    //       this.messageService.successBubble('選中項目刪除成功');
    //     } else {
    //       console.error('API error:', response.Status, response.Message);
    //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
    //     }
    //   },
    //   error: (err: string) => {
    //     console.error('API error:', err);
    //     this.messageService.errorBubble('刪除失敗');
    //   },
    //   complete: () => {
    //     this.onSubmit(this.queryForm);
    //   },
    // });

    this.selectedItems = [];
  }

  isRowSelectable(): boolean {
    return false;
  }

  loadOptions() {
    // 查 接待人員
    this.tls12060Service.queryTBLUSER_DropDownList({}).subscribe((response) => {
      this.contact_USR_Option = response.Data.map((item: any) => ({
        No: item.No, // 接待人員 代碼
        Name: item.Name, // 接待人員 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('接待人員代號:', this.contact_USR_Option);
    });
    // 查 大分類(專櫃)
    this.tls12060Service.queryTLTBUSTYPE_DropDownList({}).subscribe((response) => {
      this.bus_type_Option = response.Data.map((item: any) => ({
        No: item.No, // 大分類(專櫃) 號
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('大分類代號:', this.bus_type_Option);
    });
    // 查 樓層
    this.tls12060Service.querySYS3900_DropDownList({}).subscribe((response) => {
      this.floor_Option = response.Data.map((item: any) => ({
        No: item.No, // 樓層 號
        Name: item.Name, // 樓層 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('大分類代號:', this.floor_Option);
    });
    //查 位置編號
    this.tls12060Service.queryPOS2002_DropDownList({}).subscribe((response) => {
      this.location_Option = response.Data.map((item: any) => ({
        No: item.No, // 位置編號
        Name: item.Name, // 位置 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('location_Option:', this.location_Option);
    });
    // 查 區域代碼
    this.tls12060Service.querySYS3A00_DropDownList({}).subscribe((response) => {
      this.area_Option = response.Data.map((item: any) => ({
        No: item.No, // 區域代碼
        Name: item.Name, // 區域 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('area_Option:', this.area_Option);
    });
    // 查 櫃編
    this.tls12060Service.queryTLTTALENT_DropDownList({}).subscribe((response) => {
      this.TLTTalent_Option = response.Data.map((item: any) => ({
        No: item.No, // 櫃編 代碼
        Name: item.Name, // 櫃編 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('area_Option:', this.TLTTalent_Option);
    });

    // 查 統編
    this.tls12060Service.queryPOS2013_DropDownList({ "VEN_Flag": '1' }).subscribe((response) => {
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
        Label: item.No + '/' + item.Name,
      }));

      console.log('統編代號(去重):', this.cus_uniform_Option);
    });
  }
}
