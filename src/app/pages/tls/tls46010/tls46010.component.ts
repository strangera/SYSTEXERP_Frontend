import { Tls46010Service } from './../../../service/api/TLS0000/tls46000/tls46010.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { Pos10015 } from '../../../shared/models/tls/tls000.model';

@Component({
  selector: 'app-tls46010',
  templateUrl: './tls46010.component.html',
})

// 2.4.6.1 網路位置設定
export class TLS46010Component
  extends BasicQueryPageComponent<Pos10015>
  implements OnInit {
  queryForm = this.formBuilder.group({
    SYS_SrvNo: ['', [Validators.maxLength(8)]], // 主機編號
    SYS_SrvStatus: ['', [Validators.maxLength(2)]], // 主機狀態 A=啟用 C=停用 預設值為A
    SYS_SrvIP: ['', [Validators.maxLength(40)]], // 主機IP
    ...createPaginationConfig([{ field: 'id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;

  // 表格
  // ----------------------------------------------------------------
  data: Pos10015[] = [];
  selectedItems: Pos10015[] = [];
  columns: Column[] = [
    { field: 'SYS_StoreNo', header: '門市店號', visible: true },
    { field: 'SYS_SrvNo', header: '主機編號', visible: true },
    { field: 'SYS_SrvIP', header: '主機IP', visible: true },
    { field: 'SYS_SrvPort', header: '主機連接埠', visible: true },
    { field: 'SYS_SrvStatus', header: '主機狀態', visible: true, format: (value: string) => this.getSrvStatusName(value) },
    { field: 'SYS_SrvName', header: '主機名稱', visible: true },
    { field: 'SYS_SrvUsrID', header: '主機登入帳號', visible: true },
    { field: 'SYS_SrvUsrPwd', header: '主機登入密碼', visible: true, format: () => '******' },
    { field: 'SYS_SRVDDir', header: '後台系統下載目錄', visible: false },
    { field: 'SYS_SRVUDir', header: '後台系統上傳目錄', visible: false },
    { field: 'SYS_MyPOSDDir', header: '傳輸程式下載目', visible: true },
    { field: 'SYS_MyPOSUDir', header: '傳輸程式上傳目', visible: true },
    { field: 'SYS_SRVDDirClt', header: '前台系統下載目', visible: true },
    { field: 'SYS_SRVUDirClt', header: '前台系統上傳目', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true }
  ];
  // ----------------------------------------------------------------

  getSrvStatusName(code: string): string {
    switch (code) {
      case 'A': return '啟用';
      case 'C': return '停用';
      default: return code ?? '-';
    }
  }

  SYS_SrvStatus_Option = [
    { no: 'A', name: '啟用' },
    { no: 'C', name: '停用' }
  ];


  constructor(
    private tls46010Service: Tls46010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46010', '/TLS/TLS46010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls46010Service.queryTLS46010(frm.value).subscribe({
        next: (response) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = (response.Data || []).map((item: Pos10015) => ({
              ...item,
              SYS_SrvStatusName: this.getSrvStatusName(item.SYS_SrvStatus),
              maskedPwd: '*'.repeat(item.SYS_SrvUsrPwd?.length || 0)
            }));
            console.log(this.data);

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
  onDelete(rowData: Pos10015[]): void {
    const idList = rowData
      .map(item => item.id)
      .filter(id => id !== undefined && id !== null);
    console.log(idList);
    if (idList.length === 0) {
      this.messageService.warnBubble('無有效的 ID 可供刪除');
      return;
    }
    this.tls46010Service.deleteTLS46010({ idList }).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('選中項目刪除成功');
          this.selectedItems = []; // 清空選中項目
          this.onSubmit(this.queryForm); // 重新查詢以更新列表
        } else {
          console.error('API error:', response.Status, response.Message);
          this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
        }
      }
    });
  }
}
