import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { SortMeta } from 'primeng/api';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { TableLazyLoadEvent } from 'primeng/table';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string; //大分類代碼
  bus_class: string; //中分類(商品類別)代碼
  bus_class_name: string; //中分類(商品類別)名稱
  bus_type_name: string; //大分類名稱
  bus_type_desc: string; //大分類說明(不過好像沒用到)
  bus_class_desc: string; //中分類(商品類別)說明
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CanDel: boolean;
}


@Component({
  selector: 'app-sysb900',
  templateUrl: './sysb900.component.html',
  styleUrl: './sysb900.component.scss'
})
// 商品類別維護作業
export class SYSB900Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  Options: { value: string, label: string }[] = [];
  queryForm = this.formBuilder.nonNullable.group({
    bus_class: ['', [Validators.maxLength(2)]], // 中分類代號
    bus_class_name: ['', [Validators.maxLength(40)]], // 中分類名稱
    bus_type: [[] as number[]], // 所屬業種
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
    ...createPaginationConfig([{ field: 'bus_class', order: 1 }]), // 分頁和排序參數

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
  totalRecords = 0;
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
    this.initializePage('SYSB900', '/SYS/SYSB900CRU', this.queryForm, (form) => this.onSubmit(form));

    this.Sysb800DropdownService.getSystemTypes().subscribe({
      next: (response) => {
        this.option = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });
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
    this.apiService.deleteSYSB900(requestBody).subscribe({
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
