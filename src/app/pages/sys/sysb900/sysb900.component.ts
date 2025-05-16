import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { SortMeta } from 'primeng/api';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { TableLazyLoadEvent } from 'primeng/table';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string; //大分類代碼
  bus_class: string; //中分類(中分類)代碼
  bus_class_name: string; //中分類(中分類)名稱
  bus_type_name: string; //大分類名稱
  bus_type_desc: string; //大分類說明(不過好像沒用到)
  bus_class_desc: string; //中分類(中分類)說明
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

const storageKey = 'SYSB900';

@Component({
  selector: 'app-sysb900',
  templateUrl: './sysb900.component.html',
  styleUrl: './sysb900.component.scss'
})
// 中分類維護作業
export class SYSB900Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  Options: { value: string, label: string }[] = [];
  queryForm = this.formBuilder.nonNullable.group({
    bus_class: ['', [Validators.maxLength(2)]], // 中分類代號
    bus_class_name: ['', [Validators.maxLength(40)]], // 中分類名稱
    bus_type: [[] as number[]], // 所屬大分類
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'bus_class', order: 1 }] as SortMeta[]],
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: any[] = [
    { field: 'bus_class', header: '中分類代碼', visible: true },
    { field: 'bus_class_name', header: '中分類名稱', visible: true },
    { field: 'bus_type', header: '所屬大分類代碼', visible: true },
    { field: 'bus_type_name', header: '所屬大分類名稱', visible: true },
    { field: 'bus_class_desc', header: '備註', visible: true },

    // 其他欄位
  ];
  totalRecords: number = 0;
  selectedItems: CategoryItem[] = [];
  option: any[] = [];

  constructor(
    private Sysb800DropdownService: Sysb800DropdownService,
    private validationService: ValidationService,
    private apiService: Bas1000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    // this.ProgNo = '410008';
    this.initializePage('SYSB900', '/SYS/SYSB900CRU');

    this.Sysb800DropdownService.getSystemTypes().subscribe({
      next: (response) => {
        this.option = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });

    this.handleQueryRestore(this.queryForm, storageKey, (form) => this.onSubmit(form));

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.querySYSB900(frm.value).subscribe({
        next: (response: any) => {
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

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onDelete(data: CategoryItem | CategoryItem[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    const idList = items
      .filter(item => item && item.id != null && item.id !== undefined)
      .map(item => item.id);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    const requestBody = {
      idList: idList
    };

    console.log('Request body:', JSON.stringify(requestBody));
    this.apiService.deleteSYSB900(requestBody).subscribe({
      next: (response: any) => {
        console.log('API response:', response);
        if (response.Status === '0000') {
          this.messageService.successBubble(`成功刪除 ${idList.length} 個項目`);
          this.onSubmit(this.queryForm);
        } else {
          console.error('API error:', response.Status, response.Message);
          this.messageService.errorBubble(`刪除失敗: ${response.Message || '未知錯誤'}`);
        }
      },
      error: (err: any) => {
        console.error('API error:', err);
        this.messageService.errorBubble('刪除失敗，請檢查網路連線或聯繫管理員');
      },
      complete: () => {
        this.selectedItems = [];
      }
    });
  }

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) { return; }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize + 1;
    form.SortBy = event.multiSortMeta ?? [{ field: 'bus_class', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
