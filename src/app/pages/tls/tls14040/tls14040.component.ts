import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { option } from '../../../shared/models/sys/sysb000.module';

// 資料模型：保證票彙總表項目
interface Garantee_Ticket {
  id: number;
  talent_id: number;  // 合約編號系統 id
  tlt_no: string; // 專櫃編號
  ticket_type: string; // 保證票型態 1=準時開業保證票 2=施工保證票 3=契約屆滿保證票
  ticket_no: string; // 票據編號
  ticket_kind: string; // 票據種類 1=本票 2=支票 3=行銀保證函 9=其他
  ticket_amount: number; // 保證票金額
  expiry_date: string; // 票據到期日期
  get_ticket_status: string; // 票據收票狀態 0=未繳票  1=已繳票  2=已退票  9=封存
  get_date: string; // 繳票日期
  return_date: string; // 退票日期
  close_date: string; // 封存日期
  ticket_remark: string; // 保證票摘要-合約主檔
  remark: string; // 備註

  crt_Date: Date;
  crt_usr_no: string;
  crt_usr_name: string;
  upd_date: Date;
  upd_usr_no: string;
  upd_usr_name: string;

  CanDel: boolean; //僅顯示
}

@Component({
  selector: 'app-tls14040',
  templateUrl: './tls14040.component.html',
  styleUrl: './tls14040.component.scss'
})

// 保證票彙總表
export class Tls14040Component extends BasicQueryPageComponent<Garantee_Ticket> implements OnInit{
  // 查詢表單：保證票彙總表 --名稱都先簡略設置
    queryForm = this.formBuilder.group({
      tlt_no: ['', [Validators.maxLength(12)]], // 專櫃編號
      tlt_name: [''], // 櫃位名稱(品牌)
      location: [[]], // 位置編號
      area: [[]], // 區域
      flooor: [[]], // 樓層
      industryType: [[]], // 大分類
      management: [[]], // 營運狀況  0: 已撤櫃, 1=營運中,  9=核准時合約尚未開始
      serialNumber_start: [''], // 版本編號_起始
      serialNumber_end: [''], // 版本編號_結束
      contractStatus: [[]], // 合約狀態
      contract_date_start: [null], // 合約期間起迄_起始
      contract_date_end: [null], // 合約期間起迄_結束
      organization: [[]], // 組織別
      approve_status: [[]], // 審核狀態 1=未審核  2=已審核   1: 未審核   2=已審核   3= 已作廢 
  
      ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]), // 分頁和排序參數
    });
    totalRecords = 0;// 分頁和排序參數 // 排序需要
  
    data: Garantee_Ticket[] = [];// 表格數據和篩選數據
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
    selectedItems: Garantee_Ticket[] = [];// 多選項目
  
    ticket_typeOption: option[] = [ //保證票型態
      { value: '1', label: '準時開業保證票' },
      { value: '2', label: '施工保證票' },
      { value: '3', label: '契約屆滿保證票' },
    ];
  
    ticket_kindOption: option[] = [ //票據種類
      { value: '1', label: '本票' },
      { value: '2', label: '支票' },
      { value: '3', label: '行銀保證函' },
      { value: '9', label: '其他' },
    ];
  
    get_ticket_statusOption: option[] = [ //票據收票狀態
      { value: '1', label: '未繳票' },
      { value: '2', label: '已繳票' },
      { value: '3', label: '已退票' },
      { value: '9', label: '封存' },
    ];
  
    constructor(
      private apiService: TLS5000Service,
    ) { super(); }
  
    ngOnInit(): void {
      this.initializePage('TLS14040', '/TLS/TLS14040cru', this.queryForm, (form) => this.onSubmit(form));
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
    onDelete(data: Garantee_Ticket | Garantee_Ticket[]): void {
      const items = Array.isArray(data) ? data : [data];
      if (items.length === 0) return;
  
      const idList = items
        .filter(item => item && item.id != null)
        .map(item => item.id);
  
      if (idList.length === 0) {
        this.messageService.warnBubble('未找到有效的刪除項目');
        return;
      }
  
      // this.apiService.deleteTLS51010({ idList }).subscribe({
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
      //     this.onSubmit(this.queryForm); // 刷新資料
      //   },
      // });
  
      this.selectedItems = [];
    }
  
  
    isRowSelectable(rowData: Garantee_Ticket): boolean {
      return rowData.CanDel
    }
}
