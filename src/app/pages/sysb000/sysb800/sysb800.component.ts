import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { SortMeta } from 'primeng/api';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { Bas1000Service } from '../../../service/API/SYS0000/bas1000.service';
import { TableLazyLoadEvent } from 'primeng/table';

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
}
const storageKey = 'SYSB800';

@Component({
  selector: 'app-sysb800',
  templateUrl: './sysb800.component.html',
  styleUrl: './sysb800.component.scss'
})
// 業種基本資料維護作業
export class SYSB800Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    bus_type: [, [Validators.maxLength(2)]], // 大分類代號
    bus_type_name: ['', [Validators.maxLength(40)]], // 大分類名稱
    bus_type_desc: ['', [Validators.maxLength(160)]], // 備註
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'bus_type', order: 1 }] as SortMeta[]],
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: any[] = [
    { field: 'bus_type', header: '大分類代號', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'bus_type_desc', header: '備註', visible: true },
    // 其他欄位
  ];

  totalRecords: number = 0;
  selectedItems: CategoryItem[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: Bas1000Service
  ) {
    super();
  }

  ngOnInit(): void {
    // this.ProgNo = '410007';
    this.initializePage('SYSB800', '/SYS/B/SYSB800CRU');

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) => this.onSubmit(form));
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

  // 清空表單：重置表單和表格狀態
  onClearForm(): void {
    this.queryForm.reset();
    this.data = [];
    this.filteredData = [];
    this.totalRecords = 0;
    this.queryStateService.clearQueryState(storageKey);
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
    this.apiService.deleteSYSB800(requestBody).subscribe({
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
    form.SortBy = event.multiSortMeta ?? [{ field: 'bus_type', order: 1 }];
    this.onSubmit(this.queryForm);
  }

}
