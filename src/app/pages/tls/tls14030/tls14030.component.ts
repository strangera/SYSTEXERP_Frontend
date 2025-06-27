import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { option } from '../../../shared/models/sys/sysb000.module';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MRemark: string | null;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  CanDel: boolean;
}

// 保證傳票
@Component({
  selector: 'app-tls14030',
  templateUrl: './tls14030.component.html',
  styleUrl: './tls14030.component.scss'
})
export class Tls14030Component extends BasicQueryPageComponent<CategoryItem> implements OnInit{
  // 查詢表單：包含大分類代碼和名稱
    queryForm = this.formBuilder.group({
      // id: [{ value: '', disabled: true }], // read only
      // talent_id: [{ value: '', disabled: true }], // 合約編號系統id read only
      tlt_no: ['', [Validators.maxLength(12)]], // 專櫃編號 read only
      ticket_type: [[]], // 保證票型態 "1=準時開業保證票 2=施工保證票 3=契約屆滿保證票"
      ticket_no: ['', [Validators.maxLength(20)]], // 票據編號 手動輸入
      ticket_kind: [[]], // 票據種類 非必填但有限制長度 "1=本票 2=支票 3=行銀保證函 9=其他"
      ticket_amount: [null, [Validators.min(0)]], // 保證票金額 整數金額 "讀取 TLTTALENT 專櫃主檔相對的保證金金額"
      expiry_date: [null], // 票據到期日期 手動輸入
      get_ticket_status: [[]], // 票據收票狀態 "0=未繳票  1=已繳票  2=已退票  9=封存"
      get_date: [null], // 繳票日期 手動輸入
      return_date: [null], // 退票日期 手動輸入
      close_date: [null], // 封存日期 手動輸入
      ticket_remarks: ['', [Validators.maxLength(1000)]], // 保證票摘要-合約主檔 "讀取 TLTTALENT 專櫃主檔ticket_remarks"
      // remark: ['', [Validators.maxLength(200)]], // 備註 手動輸入

      ...createPaginationConfig([{ field: 'talent_id', order: 1 }]), // 分頁和排序參數
    });
    totalRecords = 0;// 分頁和排序參數 // 排序需要
  
    data: CategoryItem[] = [];// 表格數據和篩選數據
    columns: Column[] = [// 表格欄位定義
      { field: 'talent_id', header: '合約編號系統編號', visible: true },
      { field: 'tlt_no', header: '專櫃編號', visible: true },
      { field: 'ticket_type', header: '保證票型態', visible: true },
      { field: 'ticket_no', header: '票據編號', visible: true },
      { field: 'ticket_kind', header: '票據種類', visible: true },
      { field: 'ticket_amount', header: '保證票金額', visible: true },
      { field: 'expiry_date', header: '票據到期日期', visible: true },
      { field: 'get_ticket_status', header: '票據收票狀態', visible: true },
      { field: 'get_date', header: '繳票日期', visible: true },
      { field: 'return_date', header: '退票日期', visible: true },
      { field: 'close_date', header: '封存日期', visible: true },
      { field: 'ticket_remarks', header: '保證票摘要-合約主檔', visible: true },
      { field: 'remark', header: '備註', visible: true },
    ];
    selectedItems: CategoryItem[] = [];// 多選項目

    ticket_typeOption: option[] = [ //保證票型態
      {value: '1', label: '準時開業保證票'},
      {value: '2', label: '施工保證票'},
      {value: '3', label: '契約屆滿保證票'},
    ];

    ticket_kindOption: option[] = [ //票據種類
      {value: '1', label: '本票'},
      {value: '2', label: '支票'},
      {value: '3', label: '行銀保證函'},
      {value: '9', label: '其他'},
    ];

    get_ticket_statusOption: option[] = [ //票據收票狀態
      {value: '1', label: '未繳票'},
      {value: '2', label: '已繳票'},
      {value: '3', label: '已退票'},
      {value: '9', label: '封存'},
    ];
  
    constructor(
      private apiService: TLS5000Service,
    ) { super(); }
  
    ngOnInit(): void {
      this.initializePage('TLS14030', '/TLS/TLS14030CRU', this.queryForm, (form) => this.onSubmit(form));
    }
    // 提交查詢：處理表單並呼叫查詢 API
    onSubmit(frm: FormGroup): void {
      this.handleSubmit(frm, () => {
        // this.apiService.queryTLS51010(frm.value).subscribe({
        //   next: (response) => {
        //     if (response.Status === '0000') {
        //       this.data = response.Data || [];
        //       this.totalRecords = response.TotalCount || response.Data.length; // 排序需要
        //       this.queryStateService.setQueryState(this.ProgNo, frm.value);
        //     }
        //     this.loading = false;
        //     this.messageService.unblockUi();
        //   },
        //   error: () => {
        //     this.loading = false;
        //     this.messageService.unblockUi();
        //   },
        // });
      });
    }
    // 刪除項目
    onDelete(data: CategoryItem | CategoryItem[]): void {
      const items = Array.isArray(data) ? data : [data];
      if (items.length === 0) return;
  
      const idList = items
        .filter(item => item && item.id != null)
        .map(item => item.id);
  
      if (idList.length === 0) {
        this.messageService.warnBubble('未找到有效的刪除項目');
        return;
      }
  
      this.apiService.deleteTLS51010({ idList }).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.messageService.successBubble('選中項目刪除成功');
          } else {
            console.error('API error:', response.Status, response.Message);
            this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
          }
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.messageService.errorBubble('刪除失敗');
        },
        complete: () => {
          this.onSubmit(this.queryForm); // 刷新資料
        },
      });
  
      this.selectedItems = [];
    }
  
  
    isRowSelectable(rowData: CategoryItem): boolean {
      return rowData.CanDel
    }
}
