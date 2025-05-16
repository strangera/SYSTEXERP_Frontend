import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { SortMeta } from 'primeng/api';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { TableLazyLoadEvent } from 'primeng/table';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string;
  bus_type_name: string;
  bus_type_desc: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CanDel: boolean;
}

@Component({
  selector: 'app-sysb800',
  templateUrl: './sysb800.component.html',
  styleUrl: './sysb800.component.scss'
})
// 大分類基本資料維護作業
export class SYSB800Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    bus_type: [, [Validators.maxLength(2)]], // 大分類代號
    bus_type_name: ['', [Validators.maxLength(40)]], // 大分類名稱
    bus_type_desc: ['', [Validators.maxLength(160)]], // 備註
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
    ...createPaginationConfig([{ field: 'bus_type', order: 1 }]), // 分頁和排序參數

  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: Column[] = [
    { field: 'bus_type', header: '大分類代號', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'bus_type_desc', header: '備註', visible: true, type: 'html' },
    // 其他欄位
  ];

  totalRecords = 0;
  selectedItems: CategoryItem[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: Bas1000Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB800', '/SYS/SYSB800CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.querySYSB800(frm.value).subscribe({
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
      this.messageService.errorBubble('無法刪除：選中的項目有不可刪除的大分類');
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

    // 調用刪除 API
    this.apiService.deleteSYSB800(requestBody).subscribe({
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
        this.onSubmit(this.queryForm); // 刷新數據
      },
    });

    this.selectedItems = [];
  }
}
