import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MNo: string;
  CAT_MName: string;
  CAT_MRemark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CAT_LDisplay?: string; // 組合 CAT_LNo 和 CAT_LName
  CanDel: boolean;
}
// 2.5.1.2  中分類維護作業
@Component({
  selector: 'app-tls51020',
  templateUrl: './tls51020.component.html',
  styleUrl: './tls51020.component.scss'
})
export class TLS51020Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  // ProgNo: string = '250002';
  bigCategoryOptions: { value: string, label: string }[] = []; // 用於下拉選單
  queryForm = this.formBuilder.nonNullable.group({
    CAT_MNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]], // 中分類代碼
    CAT_MName: ['', [Validators.maxLength(32)]], // 中分類名稱
    CAT_LNo: [''], // 大分類代碼 / 名稱
    // CAT_MRemark: [,], // 說明
    ...createPaginationConfig([{ field: 'CAT_MNo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  //篩選表格的欄位
  columns: Column[] = [
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    { field: 'CAT_LDisplay', header: '大分類代碼 / 名稱', visible: true, sortField: 'CAT_LNo' }, // 使用類型斷言
    { field: 'CAT_MRemark', header: '備註', visible: true }, // 說明
  ];

  totalRecords = 0;

  // 多選項目
  selectedItems: CategoryItem[] = [];

  constructor(
    private validationService: ValidationService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private apiService: TLS5000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51020', '/TLS/TLS51020CRU', this.queryForm, (form) => this.onSubmit(form));
    // 獲取大分類代碼
    this.bigCategoryCodeService.getSystemTypes().subscribe({
      next: (response) => {
        this.bigCategoryOptions = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS51020(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            // this.data = response.Data || [];
            this.data = response.Data.map((item: CategoryItem) => ({
              ...item,
              CAT_LDisplay: `${item.CAT_LNo || ''} - ${item.CAT_LName || ''}`
            }));
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
            if (this.data.length === 0) {
              console.log('查詢結果為空');
            }
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
        }
      });
    });
  }
  onDelete(data: CategoryItem | CategoryItem[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;

    // 過濾出 CanDel = true 且 ID 有效的項目
    const deletableItems = items.filter(
      (item) => item && item.id != null && item.id !== undefined && item.CanDel === true
    );
    const nonDeletableItems = items.filter(
      (item) => item && item.id != null && item.id !== undefined && item.CanDel === false
    );

    // 如果沒有可刪除的項目
    if (deletableItems.length === 0) {
      this.messageService.errorBubble('無法刪除：選中的項目有不可刪除的中分類');
      return;
    }

    // 如果有不可刪除的項目，提示用戶
    if (nonDeletableItems.length > 0) {
      this.messageService.warnBubble(
        `${nonDeletableItems.length} 個項目因 CanDel 為 false 無法刪除，將處理其餘 ${deletableItems.length} 個項目`
      );
    }
    // 收集可刪除項目的 ID
    const idList = deletableItems.map((item) => item.id);

    // 構建 API 請求
    const requestBody = {
      idList: idList,
    };

    // 調用 API
    this.apiService.deleteTLS51020(requestBody).subscribe({
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
