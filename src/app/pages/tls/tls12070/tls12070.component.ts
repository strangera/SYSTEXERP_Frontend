import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate, ColumnGroup } from '../../../shared/componentkit/table/table.model';
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
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { Tls12070Service } from '@service/api/tls/tls12070.service';
import { apiOption } from '@shared/models/tls/tls000.model';
import { ReportTableGroupComponent } from '@shared/componentkit/report-table-group/report-table-group.component';
import { CommonModule } from '@angular/common';

export interface Customer_interview {
  id: number; // ID
  ven_uniform: string; // 廠商統一編號(pos2013)
  VEN_Name: string; // 廠商名稱(pos2013.ven_name)
  VEN_EngName?: string; // 廠商英文名稱(pos2013.VEN_EngName)
  tlt_name?: string; // 品牌(專櫃名稱)
  bus_type?: string; // 業種-大分類代碼(tltbustype)
  VEN_ContactPerson: string; // 廠商聯絡姓名
  VEN_BossTel: string; // 廠商聯絡人電話
  VEN_BossTitle?: string; // 廠商聯絡人頭銜
  VEN_BossMobile?: string; // 廠商聯絡人行動電話
  VEN_BossEmail?: string; // 廠商聯絡人電子郵件
  VEN_Addr?: string; // 廠商公司地址
  contact_Date?: string; // 訪談日期
  contact_Time?: string; // 訪談時間
  willing_level: string; // 意願等級(SYS1000.T116)
  FLOOR_NO?: string; // 接洽樓層(sys3900)
  building_no?: string; // 接洽館別代碼(sys3800)
  LOCATION_No?: string; // 接洽店位代碼(POS2002)
  contact_USR_No: string; // 訪談人員代碼
  contact_USR_Name: string; // 訪談人員姓名
  contact_record?: string; // 洽談重點及交換資料紀錄
  contact_remarks?: string; // 備註
}

// 意願報表內容
export interface Willing_data{
  id: number; // 主鍵，自動編號

  contact_USR_No: string; // 接洽人員代碼
  contact_USR_Name: string; // 接洽人員姓名
  willing_level_N: number; // 未確認
  willing_level_A: number; // A/交涉中(基本合意)
  willing_level_B: number; // B/交涉中(反應良好)
  willing_level_C: number; // C/交涉中(反應不好)
  willing_level_D: number; // D/保留
  willing_level_F: number; // F/無意進駐
  All_Counts: number; //小計
}

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);


// 2.1.2.7 專櫃訪談紀錄追蹤表
@Component({
  selector: 'app-tls12070',
  templateUrl: './tls12070.component.html',
  styleUrl: './tls12070.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, InputTextComponent, CommonModule, InputNumberComponent, AccordionModule, FormsModule, ReactiveFormsModule, ReportTableGroupComponent, CalendarRangeComponent, CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableComponent, ReportTableGroupComponent, TranslateModule]
})
export class TLS12070Component extends BasicQueryPageComponent<Customer_interview> implements OnInit {
  activeReport: 'query' | 'willing' = 'query';
  // 0812更新: 查詢按鈕的sql是Grace直接提供的，維持Grace的查詢結果直接顯示為報表內容，
  // 後續反饋有要更新再調整，(先不依照接洽人員拆分)

  // 查詢
  queryForm = this.formBuilder.group({
    // Customer_interview表單
    contact_Date_Start: [yesterday],  // 訪談日期_起始日
    contact_Date_End: [yesterday],  // 訪談日期_終止日
    contact_USR_No: [[], [Validators.maxLength(20)]], // contact_USR_No (drop，應該就是接洽人員)

    //分頁查詢
    ...createPaginationConfig([{ field: 'contact_USR_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  contact_USR_Option: apiOption[] = []; // 訪談人員

  interview_data: Customer_interview[] = []; //意願報表
  intervew_columns: Column[] = [
    { field: 'contact_USR_No', header: '訪談人員代碼', visible: true },
    { field: 'contact_USR_Name', header: '訪談人員姓名', visible: true },
    { field: 'contact_Date', header: '訪談日期', visible: true, format: formatDate },
    { field: 'contact_Time', header: '訪談時間', visible: true },
    { field: 'willing_level', header: '意願等級', visible: true }, // SYS1000.T116 //中

    { field: 'ven_uniform', header: '廠商統一編號', visible: true }, // POS2013
    { field: 'VEN_Name', header: '廠商名稱', visible: true }, // POS2013.name
    // { field: 'VEN_EngName', header: '廠商英文名稱', visible: true },  // pos2013.EngName
    { field: 'tlt_name', header: '品牌(專櫃名稱)', visible: true },
    { field: 'bus_type', header: '大分類代碼', visible: true }, // tltbustype /中
    { field: 'VEN_ContactPerson', header: '廠商聯絡姓名', visible: true },
    { field: 'VEN_BossTel', header: '廠商聯絡人電話', visible: true },
    { field: 'VEN_BossTitle', header: '廠商聯絡人頭銜', visible: true },
    { field: 'VEN_BossMobile', header: '廠商聯絡人行動電話', visible: true },
    { field: 'VEN_BossEmail', header: '廠商聯絡人電子郵件', visible: true },
    { field: 'VEN_Addr', header: '廠商公司地址', visible: true },
    { field: 'FLOOR_NO', header: '接洽樓層', visible: true }, // sys3900 /中
    { field: 'building_no', header: '接洽館別代碼', visible: true }, // sys3800 /中
    { field: 'LOCATION_No', header: '接洽店位代碼', visible: true }, //POS2002
    { field: 'contact_record', header: '洽談重點及交換資料紀錄', visible: true },
    { field: 'contact_remarks', header: '備註', visible: true },
  ];

  willing_data: Willing_data[] = [];
  willing_columns: Column[] = [ //意願報表欄位
    { field: 'contact_USR_No', header: '接洽人員代碼', visible: true },
    { field: 'contact_USR_Name', header: '接洽人員', visible: true },
    { field: 'willing_level_N', header: '?/未確認', visible: true },
    { field: 'willing_level_A', header: 'A/交涉中(基本合意)', visible: true },
    { field: 'willing_level_B', header: 'B/交涉中(反應良好)', visible: true },
    { field: 'willing_level_C', header: 'C/交涉中(反應不好)', visible: true },
    { field: 'willing_level_D', header: 'D/保留', visible: true },
    { field: 'willing_level_F', header: 'F/無意進駐', visible: true },
    { field: 'All_Counts', header: '小計', visible: true },
  ];

  selectedItems: Customer_interview[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(private tls12070Service: Tls12070Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12070', 'TLS/TLS12060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.activeReport = 'query';
    this.handleSubmit(frm, () => {
      this.tls12070Service.queryTLS12070(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.interview_data = response.Data || [];
            console.log('Result', response.Data);
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

  // 查詢 意願報表
  onWillingClick(frm: FormGroup) {
    // TODO: 呼叫意願報表查詢 API
    this.activeReport = 'willing';
    console.log('查詢條件', frm.value);
    this.handleSubmit(frm, () => {
      this.tls12070Service.queryTLS12070_Summary(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.willing_data = response.Data || [];
            console.log('意願Result', response.Data);
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
  onDelete(data: Customer_interview | Customer_interview[]): void {
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

    this.selectedItems = [];
  }

  isRowSelectable(): boolean {
    // return rowData.CanDel ?? false;
    return true;
  }

  loadOptions() {
    // 查詢 接待人員
    this.tls12070Service.queryTBLUSER_DropDownList({}).subscribe((response) => {
      this.contact_USR_Option = response.Data.map((item: any) => ({
        No: item.No, // 接待人員 名稱
        Name: item.Name, // 接待人員 名稱
        Label: item.No + '-' + item.Name //標籤
      }));
      console.log('接待人員代號:', this.contact_USR_Option);
    });
  }
}
