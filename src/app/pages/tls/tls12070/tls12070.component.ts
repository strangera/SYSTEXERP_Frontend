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
  id: number; // 主鍵，自動編號

  CreatedDateStart: Date,  // 訪談日期_起始日
  CreatedDateEnd: Date,  // 訪談日期_終止日
  contact_USR_Name: string, // 訪談人員 (drop，應該就是接洽人員)

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No?: string; // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  UPD_Date?: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No?: string; // 變更人員代碼
  UPD_USR_Name?: string; // 變更人員姓名
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
    // 先建立表單，還不確定table內容
    contact_DateStart: [null],  // 訪談日期_起始日
    contact_DateEnd: [null],  // 訪談日期_終止日
    contact_USR_Name: [[], [Validators.maxLength(100)]], // 訪談人員 (drop，應該就是接洽人員)

    //分頁查詢
    ...createPaginationConfig([{ field: 'contact_USR_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  contact_USR_Option: apiOption[] = []; // 訪談人員 (確定是這支了)

  data: interviewList[] = [];
  columns: Column[] = [

    { field: 'interview_USR', header: '訪談人員', visible: true },
    { field: 'potentialNumber', header: '潛在客戶數', visible: true },
    { field: 'visitNumber', header: '拜訪記錄次數', visible: true },

    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
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
