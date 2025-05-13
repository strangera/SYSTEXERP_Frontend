import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Sysb100m } from '../module/sysb000.module';
import { Sysb100Service } from '../../../service/API/sys/sysb100.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-sysb100',
  templateUrl: './sysb100.component.html',
  styleUrl: './sysb100.component.scss',
})
// 公司基本資料維護作業
export class SYSB100Component
  extends BasicQueryPageComponent<Sysb100m>
  implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    SYS_StoreNo: ['', [Validators.maxLength(10)]], // 公司編號/店號
    STR_Uniform: ['', [Validators.maxLength(8)]], // 統一編號
    SYS_StoreName: ['', [Validators.maxLength(60)]], // 公司名稱(中文)
    SYS_StoreNameENG: ['', [Validators.maxLength(60)]], // 公司名稱(英文)
    STO_TaxNo: ['', [Validators.maxLength(10)]], // 稅籍編號
    STO_ManagerName: ['', [Validators.maxLength(12)]], // 負責人
    STO_ContactName: ['', [Validators.maxLength(12)]], // 聯絡人
    STO_ContactTel: ['', [Validators.maxLength(15)]], // 聯絡人電話
    STO_ContactFax: ['', [Validators.maxLength(15)]], // 聯絡人傳真
    STO_Addr: ['', [Validators.maxLength(100)]], // 公司(營業處)地址(中文)
    STO_AddrENG: ['', [Validators.maxLength(100)]], // 公司(營業處)地址(英文)
    STO_RegAddr: ['', [Validators.maxLength(100)]], // 公司登記地址(中文)
    STO_RegAddrENG: ['', [Validators.maxLength(100)]], // 公司登記地址(英文)
    STO_BRN: ['', [Validators.maxLength(10)]], // 營業登記證號
    STO_Tel: ['', [Validators.maxLength(15)]], // 公司電話
    STO_Fax: ['', [Validators.maxLength(15)]], // 公司傳真
    STO_PostCode: ['', [Validators.maxLength(6)]], // 郵遞區號
    STO_MailTel: ['', [Validators.maxLength(15)]], // 郵寄電話
    STO_MailFax: ['', [Validators.maxLength(15)]], // 郵寄傳真
    STO_MailAddr: ['', [Validators.maxLength(100)]], // 郵寄地址
    STO_InvoiceAddr: ['', [Validators.maxLength(100)]], // 發票地址
    STO_Email: ['', [Validators.maxLength(100)]], // 電子郵件
    STO_URL: ['', [Validators.maxLength(100)]], // 公司網址

    //分頁查詢
    ...createPaginationConfig, // 分頁和排序參數 // 排序需要
  });

  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Sysb100m[] = [];
  columns: Column[] = [
    { field: 'SYS_StoreNo', header: '公司編號/店號', visible: true },
    { field: 'STR_Uniform', header: '統一編號', visible: true },
    { field: 'SYS_StoreName', header: '公司名稱(中文)', visible: true },
    { field: 'SYS_StoreNameENG', header: '公司名稱(英文)', visible: true },
    { field: 'STO_TaxNo', header: '稅籍編號', visible: true },

    { field: 'STO_ManagerName', header: '負責人', visible: true },
    { field: 'STO_ContactName', header: '聯絡人', visible: true },
    { field: 'STO_ContactTel', header: '聯絡人電話', visible: true },
    // 其他欄位
    { field: 'STO_ContactFax', header: '聯絡人傳真', visible: false },
    { field: 'STO_PostCode', header: '郵遞區號', visible: false },
    { field: 'STO_BRN', header: '營業登記證號', visible: false },
    { field: 'STO_Tel', header: '公司電話', visible: false },
    { field: 'STO_Addr', header: '公司(營業處)地址(中文)', visible: false },
    {
      field: 'STO_AddrENG',
      header: '公司(營業處)地址(英文)',
      visible: false,
    },
    { field: 'STO_RegAddr', header: '公司登記地址(中文)', visible: false },
    {
      field: 'STO_RegAddrENG',
      header: '公司登記地址(英文)',
      visible: false,
    },
    { field: 'STO_InvoiceAddr', header: '發票地址', visible: false },
    { field: 'STO_MailTel', header: '郵寄電話', visible: false },
    { field: 'STO_MailFax', header: '郵寄傳真', visible: false },
    { field: 'STO_MailAddr', header: '郵寄地址', visible: false },
    { field: 'STO_Email', header: '電子郵件信箱', visible: false },
    { field: 'STO_URL', header: '公司網址', visible: false },
  ];
  selectedItems: Sysb100m[] = []; // 多選項目

  // ----------------------------------------------------------------
  constructor(private sysb100Service: Sysb100Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB100', 'SYS/SYSB100CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sysb100Service.querySYSB100(frm.value).subscribe({
        next: (response) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || response.Data.length; // 排序需要
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
  onDelete(data: Sysb100m | Sysb100m[]): void {
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

    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };
    this.sysb100Service.deleteSYSB100(deleteBody).subscribe({
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
        this.onSubmit(this.queryForm);
      },
    });

    this.selectedItems = [];
  }
}
