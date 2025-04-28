import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { debounceTime } from 'rxjs';
import { SortMeta } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_MNo: string;
  CAT_SNo: string;
  CAT_SName: string;
  CAT_SRemark: string | null;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'TLS51030';

// 2.5.1.3  小分類維護作業
@Component({
  selector: 'app-tls51030',
  templateUrl: './tls51030.component.html',
  styleUrl: './tls51030.component.scss'
})
export class TLS51030Component extends BasicQueryPageComponent<CategoryItem> {
  queryForm = this.formBuilder.nonNullable.group({
    CAT_SNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]], // Input serial number
    CAT_SName: ['', [Validators.maxLength(32)]], // Input Text
    CAT_LNo: [''], // DropDown
    CAT_MNo: [''], // DropDown
    // editortext: [''], // editor text
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'CAT_SNo', order: 1 }] as SortMeta[]],
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'CAT_SNo', header: '小分類代碼', visible: true },
    { field: 'CAT_SName', header: '小分類名稱', visible: true },
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_SRemark', header: '說明', visible: true },
    // 其他欄位
  ];
  totalRecords: number = 0;
  // 多選項目
  selectedItems: CategoryItem[] = [];
  // ----------------------------------------------------------------
  bigCategoryOptions: any[] = [];
  middleCategoryOptions: any[] = [];

  constructor(
    private validationService: ValidationService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private apiService: TLS5000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('250003', '/TLS5000/TLS51030CRU');
    // 調試：輸出權限和功能資訊
    console.log('funInfo:', this.funInfo);
    console.log('queryPermission:', this.queryPermission);

    this.handleQueryRestore(this.queryForm, storageKey, (form) => this.onSubmit(form));

    // 獲取大分類代碼
    this.bigCategoryCodeService.getSystemTypes().subscribe({
      next: (response) => {
        this.bigCategoryOptions = response;
        console.log('大分類代碼:', response);
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });

    // 監聽表單變化，延遲儲存有效值
    this.queryForm.valueChanges
      .pipe(debounceTime(500)) // 延遲 500ms 減少頻繁儲存
      .subscribe(value => {
        if (this.queryForm.valid) {
          this.queryStateService.setQueryState(storageKey, value);
        }
      });
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup): void {
    console.log('Form value:', frm.value);
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS51030(frm.value).subscribe({
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
        this.messageService.errorBubble(`無法刪除項目 ${item?.CAT_MNo || '未知'}：缺少 ID`);
        return;
      }

      const requestBody = {
        id: item.id // 保持 number 型別
      };
      console.log('Request body:', JSON.stringify(requestBody));
      this.apiService.deleteTLS51030(requestBody).subscribe({
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

  onSubmitQuery(frm: FormGroup) {
    console.log('onSubmitQuery triggered');
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

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) { return; }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize;
    form.SortBy = event.multiSortMeta ?? [{ field: 'CAT_MNo', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
