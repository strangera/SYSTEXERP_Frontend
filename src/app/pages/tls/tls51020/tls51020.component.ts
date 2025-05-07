import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { TableLazyLoadEvent } from 'primeng/table';
import { SortMeta } from 'primeng/api';
import { Column } from '../../../shared/componentkit/table/table.model';

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
}

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'TLS51020';

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
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'CAT_MNo', order: 1 }] as SortMeta[]],
  });
  // 表格
  // ----------------------------------------------------------------
  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  //篩選表格的欄位
  columns: Column[] = [
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    // { field: 'CAT_LDisplay', header: '大分類代碼 / 名稱', visible: true },
    {
      field: 'CAT_LDisplay',
      header: '大分類代碼 / 名稱',
      visible: true,
      sortField: 'CAT_LNo' // 強制添加 sortField
    } as Column & { sortField: string }, // 使用類型斷言
    { field: 'CAT_MRemark', header: '備註', visible: true },
    // 其他欄位CAT_MRemark
  ];

  totalRecords: number = 0;

  // bigCategoryOptions: any[] = [];
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
    this.initializePage('TLS51020', '/TLS/TLS51020CRU');
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

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS51020(frm.value).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            // this.data = response.Data || [];
            this.data = (response.Data || []).map((item: CategoryItem) => ({
              ...item,
              CAT_LDisplay: `${item.CAT_LNo || ''} - ${item.CAT_LName || ''}`
            }));
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(storageKey, frm.value);
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


  // 查詢按鈕：重置分頁並提交查詢
  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset();
    this.data = [];
    this.filteredData = [];
    this.totalRecords = 0;
    // 清空儲存的查詢狀態
    this.queryStateService.clearQueryState(storageKey);
  }

  onDelete(data: CategoryItem | CategoryItem[]): void {

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    items.forEach((item, index) => {
      if (!item || item.id == null || item.id === undefined) {
        console.error('ID is missing or invalid for item:', item);
        this.messageService.errorBubble(`無法刪除項目 ${item?.CAT_LNo || '未知'}：缺少 ID`);
        return;
      }

      const requestBody = {
        id: item.id // 保持 number 型別
      };
      this.apiService.deleteTLS51020(requestBody).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.messageService.successBubble(`項目 ${item.CAT_LNo} 刪除成功`);
          } else {
            console.error('API error:', response.Status, response.Message);
            this.messageService.errorBubble(`項目 ${item.CAT_LNo} 刪除失敗: ${response.Message}`);
          }
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.messageService.errorBubble(`項目 ${item.CAT_LNo} 刪除失敗`);
        },
        complete: () => {
          if (index === items.length - 1) {
            this.onSubmit(this.queryForm);
          }
        }
      });
    });

    this.selectedItems = [];
  }

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) { return; }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize + 1;
    // form.SortBy = event.multiSortMeta ?? [{ field: 'CAT_MNo', order: 1 }];
    form.SortBy = (event.multiSortMeta ?? [{ field: 'CAT_MNo', order: 1 }]).map(sort => ({
      ...sort,
      field: sort.field === 'CAT_LDisplay' ? 'CAT_LNo' : sort.field // 將 CAT_LDisplay 替換為 CAT_LNo
    }));
    this.onSubmit(this.queryForm);
  }
}
