import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate } from '../../../shared/componentkit/table/table.model';
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

export interface interviewList {
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

// 2.1.2.7 專櫃訪談紀錄追蹤表
@Component({
  selector: 'app-tls12070',
  templateUrl: './tls12070.component.html',
  styleUrl: './tls12070.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, InputTextComponent, InputNumberComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableComponent, ReportTableGroupComponent, TranslateModule]
})
export class TLS12070Component extends BasicQueryPageComponent<interviewList> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // Customer_interview表單
    contact_Date_Start: [null],  // 訪談日期_起始日
    contact_Date_End: [null],  // 訪談日期_終止日
    contact_USR_No: [[], [Validators.maxLength(20)]], // contact_USR_No (drop，應該就是接洽人員)

    //分頁查詢
    ...createPaginationConfig([{ field: 'contact_USR_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  contact_USR_Option: apiOption[] = []; // 訪談人員 (確定是這支了)

  data: interviewList[] = [];
  columns: Column[] = [
  // { field: 'id', header: 'ID', visible: true },
  { field: 'ven_uniform', header: '廠商統一編號', visible: true }, // POS2013
  { field: 'VEN_Name', header: '廠商名稱', visible: true }, // POS2013.name
  { field: 'VEN_EngName', header: '廠商英文名稱', visible: true },  // pos2013.EngName
  { field: 'tlt_name', header: '品牌(專櫃名稱)', visible: true },
  { field: 'bus_type', header: '業種-大分類代碼', visible: true }, // tltbustype
  { field: 'VEN_ContactPerson', header: '廠商聯絡姓名', visible: true },
  { field: 'VEN_BossTel', header: '廠商聯絡人電話', visible: true },
  { field: 'VEN_BossTitle', header: '廠商聯絡人頭銜', visible: true },
  { field: 'VEN_BossMobile', header: '廠商聯絡人行動電話', visible: true },
  { field: 'VEN_BossEmail', header: '廠商聯絡人電子郵件', visible: true },
  { field: 'VEN_Addr', header: '廠商公司地址', visible: true },
  { field: 'contact_Date', header: '訪談日期', visible: true, format: formatDate },
  { field: 'contact_Time', header: '訪談時間', visible: true },
  { field: 'willing_level', header: '意願等級', visible: true }, // SYS1000.T116
  { field: 'FLOOR_NO', header: '接洽樓層', visible: true }, // sys3900
  { field: 'building_no', header: '接洽館別代碼', visible: true }, // sys3800
  { field: 'LOCATION_No', header: '接洽店位代碼', visible: true }, //POS2002
  { field: 'contact_USR_No', header: '訪談人員代碼', visible: true },
  { field: 'contact_USR_Name', header: '訪談人員姓名', visible: true },
  { field: 'contact_record', header: '洽談重點及交換資料紀錄', visible: true },
  { field: 'contact_remarks', header: '備註', visible: true },
];


  selectedItems: interviewList[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(private tls12070Service: Tls12070Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12070', 'TLS/TLS12060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    console.log('查詢條件', frm.value);
    this.handleSubmit(frm, () => {
      // this.tls12010Service.queryTLS12010(frm.value).subscribe({
      //   next: (response) => {
      //     if (response.Status === '0000') {
      //       this.data = response.Data || [];
      //       console.log('Result', this.data);
      //       this.totalRecords = response.TotalCount || response.Data.length;
      //       this.queryStateService.setQueryState(this.ProgNo, frm.value);
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //     }
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      // });
    });
  }

  // 刪除項目
  onDelete(data: interviewList | interviewList[]): void {
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

  // isRowSelectable(rowData: interviewList): boolean {
  //   return rowData.CanDel ?? false;
  // }

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
