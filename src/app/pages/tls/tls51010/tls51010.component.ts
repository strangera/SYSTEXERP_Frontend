import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TableLazyLoadEvent } from 'primeng/table';
import { SortMeta } from 'primeng/api';

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
  styleUrl: './tls51010.component.scss',
})
export class TLS51010Component
  extends BasicQueryPageComponent<CategoryItem>
  implements OnInit
{
  // 查詢表單：包含大分類代碼和名稱
  queryForm = this.formBuilder.nonNullable.group({
    CAT_LNo: [
      '',
      [Validators.maxLength(2), this.validationService.numberValidator],
    ],
    CAT_LName: ['', [Validators.maxLength(32)]],
    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'CAT_LNo', order: 1 }] as SortMeta[]],
  });

  // 表格數據和篩選數據
  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];

  // 表格欄位定義
  columns: any[] = [
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_LRemark', header: '備註', visible: true },
  ];

  // // 分頁和排序參數
  // pageSize: number = 10;
  // pageIndex: number = 0;
  totalRecords: number = 0;
  // lastQueryParams: any = null;
  // sortField: string = 'CAT_LNo';
  // sortOrder: number = 1;

  // 多選項目
  selectedItems: CategoryItem[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面：設置程式編號和 CRUD 頁面路徑
    this.initializePage('TLS51010', '/TLS/TLS51010CRU');

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) =>
      this.onSubmit(form),
    );

    // 監聽表單變化，延遲儲存有效值
    // this.queryForm.valueChanges
    //   .pipe(debounceTime(500)) // 延遲 500ms 減少頻繁儲存
    //   .subscribe(value => {
    //     if (this.queryForm.valid) {
    //       this.queryStateService.setQueryState(storageKey, value);
    //     }
    //   });
  }

  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS51010(frm.value).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            // 儲存查詢條件（成功查詢後）
            this.queryStateService.setQueryState(storageKey, frm.value);
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

  // 查詢按鈕：重置分頁並提交查詢
  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  // 清空表單：重置表單和表格狀態
  onClearForm(): void {
    this.queryForm.reset();
    // this.pageIndex = 0;
    this.data = [];
    this.filteredData = [];
    // this.lastQueryParams = null;
    this.totalRecords = 0;
    // this.sortField = 'CAT_LNo';
    // this.sortOrder = 1;
    // 清空儲存的查詢狀態
    this.queryStateService.clearQueryState(storageKey);
  }

  // 刪除項目
  onDelete(data: CategoryItem | CategoryItem[]): void {
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

    // 構建新的 requestBody 格式
    const requestBody = {
      idList: idList, // 符合 API 的 idList 格式
    };
    // 調用 API
    this.apiService.deleteTLS51010(requestBody).subscribe({
      next: (response: any) => {
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

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) {
      return;
    }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize + 1;
    form.SortBy = event.multiSortMeta ?? [{ field: 'CAT_LNo', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
