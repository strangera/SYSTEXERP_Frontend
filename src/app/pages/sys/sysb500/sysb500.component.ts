import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Sysb500m } from '../module/sysb000.module';
import { TableLazyLoadEvent } from 'primeng/table';
import { Sysb500Service } from '../../../service/sysb/sysb500.service';
import { SortMeta } from 'primeng/api';

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'SYSB500';

@Component({
  selector: 'app-sysb500',
  templateUrl: './sysb500.component.html',
  styleUrl: './sysb500.component.scss',
})
// 區域基本資料維護作業
export class SYSB500Component
  extends BasicQueryPageComponent<Sysb500m>
  implements OnInit
{
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    area_no: ['', [Validators.maxLength(2)]], // 區域別編號
    area_desc: ['', [Validators.maxLength(30)]], // 區域別名稱

    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'area_no', order: 1 }] as SortMeta[]],
  });
  // 表格
  // ----------------------------------------------------------------
  data: Sysb500m[] = [];
  filteredData: Sysb500m[] = [...this.data];
  columns: any[] = [
    { field: 'area_no', header: '區域別編號', visible: true },
    { field: 'area_desc', header: '區域別名稱', visible: true },
    // 其他欄位
  ];

  // 表格數據和篩選數據
  // // 分頁和排序參數
  // pageSize: number = 10;
  // pageIndex: number = 0;
  totalRecords = 0;
  // lastQueryParams: any = null;
  // sortField: string = 'CAT_LNo';
  // sortOrder: number = 1;

  // 多選項目
  selectedItems: Sysb500m[] = [];

  // ----------------------------------------------------------------

  constructor(private sysb500Service: Sysb500Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB500', 'SYS/SYSB500CRU');

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) =>
      this.onSubmit(form),
    );
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const query = {
        area_no: frm.value.area_no || '',
        area_desc: frm.value.area_desc || '',
      };
      this.sysb500Service.querySYSB500(query).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
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

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();
    // this.pageIndex = 0;
    this.data = [];
    this.filteredData = [];
    // this.lastQueryParams = null;
    this.totalRecords = 0;
    // this.sortField = 'SYS_StoreNo';
    // this.sortOrder = 1;
    // 清空儲存的查詢狀態
    this.queryStateService.clearQueryState(storageKey);
  }

  // 刪除項目
  onDelete(data: Sysb500m | Sysb500m[]): void {
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

    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };

    this.sysb500Service.deleteSYSB500(deleteBody).subscribe({
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
    form.SortBy = event.multiSortMeta ?? [{ field: 'area_no', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
