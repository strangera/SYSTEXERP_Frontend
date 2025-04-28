import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

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

// 導航狀態：用於保留分頁和查詢參數
interface NavigationState {
  crudstatus?: CRUDStatus;
  rowdata?: any;
  queryParams?: any;
  pageIndex?: number;
  pageSize?: number;
  totalRecords?: number;
  sortField?: string;
  sortOrder?: number;
}

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'TLS51010';

@Component({
  selector: 'app-tls51010',
  templateUrl: './tls51010.component.html',
  styleUrl: './tls51010.component.scss'
})
export class TLS51010Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  // 查詢表單：包含大分類代碼和名稱
  queryForm = this.formBuilder.group({
    CAT_LNo: ['', [Validators.maxLength(2), this.validationService.numberValidator]],
    CAT_LName: ['', [Validators.maxLength(32)]]
  });

  // 表格數據和篩選數據
  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];

  // 表格欄位定義
  columns: any[] = [
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_LRemark', header: '備註', visible: true }
  ];

  // 分頁和排序參數
  pageSize: number = 10;
  pageIndex: number = 0;
  totalRecords: number = 0;
  lastQueryParams: any = null;
  sortField: string = 'CAT_LNo';
  sortOrder: number = 1;

  // 多選項目
  selectedItems: CategoryItem[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面：設置程式編號和 CRUD 頁面路徑
    this.initializePage('250001', '/TLS5000/TLS51010CRU');

    // 調試：輸出權限和功能資訊
    console.log('funInfo:', this.funInfo);
    console.log('queryPermission:', this.queryPermission);

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) => this.onSubmit(form));

    // 監聽表單變化，延遲儲存有效值
    this.queryForm.valueChanges
      .pipe(debounceTime(500)) // 延遲 500ms 減少頻繁儲存
      .subscribe(value => {
        if (this.queryForm.valid) {
          this.queryStateService.setQueryState(storageKey, value);
        }
      });
  }

  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    console.log('Form value:', frm.value);
    this.handleSubmit(frm, () => {
      const queryParams = {
        CAT_LNo: frm.value.CAT_LNo || '',
        CAT_LName: frm.value.CAT_LName || '',
        PageSize: this.pageSize,
        PageIndex: '1',
        SortBy: [{ field: this.sortField || 'CAT_LNo', order: this.sortOrder || 1 }]
      };
      console.log('Query params:', queryParams);

      this.apiService.queryTLS51010(queryParams).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            // 儲存查詢條件（成功查詢後）
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
    console.log('onSubmitQuery triggered');
    this.pageIndex = 0;
    this.onSubmit(frm);
  }

  // 清空表單：重置表單和表格狀態
  onClearForm(): void {
    this.queryForm.reset();
    this.pageIndex = 0;
    this.data = [];
    this.filteredData = [];
    this.lastQueryParams = null;
    this.totalRecords = 0;
    this.sortField = 'CAT_LNo';
    this.sortOrder = 1;
    // 清空儲存的查詢狀態
    this.queryStateService.clearQueryState(storageKey);
  }

  // 分頁變更：更新分頁參數並重新查詢
  onPageChange(event: any): void {
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.onSubmit(this.queryForm);
  }

  // 排序變更：更新排序參數並重新查詢
  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.onSubmit(this.queryForm);
  }

  // 刪除項目：支援單個或多個項目刪除
  //TODO:看未來刪除API是否支援多id再來看看是否需要更改
  onDelete(data: CategoryItem | CategoryItem[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    items.forEach((item, index) => {
      console.log('Processing item:', JSON.stringify(item, null, 2));
      if (!item || item.id == null || item.id === undefined) {
        console.error('ID is missing or invalid for item:', item);
        this.messageService.errorBubble(`無法刪除項目 ${item?.CAT_LNo || '未知'}：缺少 ID`);
        return;
      }

      const requestBody = {
        id: item.id // 保持 number 型別
      };
      console.log('Request body:', JSON.stringify(requestBody));
      this.apiService.deleteTLS51010(requestBody).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
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
}
