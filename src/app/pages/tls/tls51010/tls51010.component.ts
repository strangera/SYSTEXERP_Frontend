import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

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
}
@Component({
  selector: 'app-tls51010',
  templateUrl: './tls51010.component.html',
  styleUrl: './tls51010.component.scss',
})
export class TLS51010Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  // 查詢表單：包含大分類代碼和名稱
  queryForm = this.formBuilder.group({
    CAT_LNo: ['', [Validators.maxLength(2), this.validationService.numberValidator]],
    CAT_LName: ['', [Validators.maxLength(32)]],
    ...createPaginationConfig([{ field: 'CAT_LNo', order: 1 }]), // 分頁和排序參數
  });
  data: CategoryItem[] = [];// 表格數據和篩選數據
  columns: Column[] = [// 表格欄位定義
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_LRemark', header: '備註', visible: true, type: 'html' },
  ];
  totalRecords = 0;// 分頁和排序參數
  selectedItems: CategoryItem[] = [];// 多選項目

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS51010', '/TLS/TLS51010CRU', this.queryForm, (form) => this.onSubmit(form));
  }
  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    console.log('呼叫查詢 API');
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS51010(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }
  // 刪除項目
  onDelete(data: CategoryItem | CategoryItem[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;
    // 收集所有有效的 ID
    const idList = items.filter((item) => item && item.id != null && item.id !== undefined).map((item) => item.id);
    if (idList.length === 0) {
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }
    // 構建新的 requestBody 格式
    const requestBody = {
      idList: idList, // 符合 API 的 idList 格式
    };
    // 調用 API
    this.apiService.deleteTLS51010(requestBody).subscribe({
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
