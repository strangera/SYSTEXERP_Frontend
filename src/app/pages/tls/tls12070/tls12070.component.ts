import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls12070Service } from '@service/api/tls/tls12070.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { apiOption } from '@shared/models/tls/tls000.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

export interface Customer_interview {
  contact_Date_Start: string; // 接洽日期_起始日
  contact_Date_End: string; // 接洽日期_終止日
  contact_USR_No: string; // 接洽人員
}

// 意願報表內容
export interface Willing_data {
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
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, CommonModule, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, MultiSelectComponent, TableComponent, TranslateModule]
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
    { field: 'ven_uniform', header: '廠商統一編號', visible: false },
    { field: 'ven_uniform_Count', header: '潛在客戶總數', visible: true },
    { field: 'ID_Count', header: '拜訪記錄次數', visible: true },
  ];

  willing_data: Willing_data[] = [];
  willing_columns: Column[] = [ //意願報表欄位
    { field: 'contact_USR_No', header: '訪談人員代碼', visible: true },
    { field: 'contact_USR_Name', header: '訪談人員', visible: true },
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
  constructor(
    private tls12070Service: Tls12070Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12070', 'TLS/TLS12070cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.activeReport = 'query';
    this.handleSubmit(frm, () => {

      const request = {
        ...frm.getRawValue(),
        contact_Date_Start: formatDate(frm.getRawValue().contact_Date_Start, 'yyyy-MM-dd', 'en-US'),
        contact_Date_End: formatDate(frm.getRawValue().contact_Date_End, 'yyyy-MM-dd', 'en-US'),
      }

      console.log('主查詢request', request);
      // 查詢 Customer_interview資料表
      this.tls12070Service.queryTLS12070_Count(request).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.interview_data = response.Data || [];
            console.log('Result', response.Data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
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

  // 查詢 一般報表
  onQueryClick(frm: FormGroup) {
    this.activeReport = 'query';
    this.onSubmit(frm);
  }

  // 查詢 意願報表
  onWillingClick(frm: FormGroup) {
    this.activeReport = 'willing';
    console.log('查詢條件', frm.value);
    this.handleSubmit(frm, () => {
      this.tls12070Service.queryTLS12070_Summary(frm.value).pipe(untilDestroyed(this)).subscribe({
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

  loadOptions() {
    // 查詢 接待人員
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.contact_USR_Option = response.Data.map((item: any) => ({
        No: item.No, // 接待人員 名稱
        Name: item.Name, // 接待人員 名稱
        Label: item.No + '-' + item.Name //標籤
      }));
      console.log('接待人員代號:', this.contact_USR_Option);
    });
  }

  onDetail1(event: any) {
    const queryConditions = this.queryStateService.getQueryStateValue(this.ProgNo);
    this.onDetail(event, queryConditions);
  }
}
