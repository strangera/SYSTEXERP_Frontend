import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Permissions
// import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { Sysb300Service } from '../../../service/sysb/sysb300.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { option, Sysb300m } from '../module/sysb000.module';
import { SortMeta } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'SYSB300';

@Component({
  selector: 'app-sysb300',
  templateUrl: './sysb300.component.html',
  styleUrl: './sysb300.component.scss',
})

// 組織階層設定作業
export class SYSB300Component
  extends BasicQueryPageComponent<Sysb300m>
  implements OnInit
{
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    // SYS3000 組織階層設定檔
    id: [],
    level_id: ['', [Validators.maxLength(2)]], // 組織階層代碼
    level_name: ['', [Validators.maxLength(30)]], // 組織階層名稱
    p_level_id: [, [Validators.maxLength(2)]], // 上層組織階層代碼

    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'level_id', order: 1 }] as SortMeta[]],
  });
  // 表格
  // ----------------------------------------------------------------
  data: Sysb300m[] = [];
  filteredData: Sysb300m[] = [...this.data];
  columns: any[] = [
    { field: 'level_id', header: '階層代碼', visible: true },
    { field: 'level_name', header: '階層名稱', visible: true },
    { field: 'p_level_id', header: '上層組織', visible: true },
    // 其他欄位
  ];

  // // 分頁和排序參數
  // pageSize: number = 10;
  // pageIndex: number = 0;
  totalRecords = 0;
  // lastQueryParams: any = null;
  // sortField: string = 'CAT_LNo';
  // sortOrder: number = 1;

  // 多選項目
  selectedItems: Sysb300m[] = [];

  // ----------------------------------------------------------------
  upgroup_Options: option[] = [];

  constructor(private sysb300Service: Sysb300Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB300', 'SYS/SYSB300CRU');
    this.loadOptions();

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) =>
      this.onSubmit(form),
    );
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const query = {
        level_id: frm.value.level_id || '',
        level_name: frm.value.level_name || '',
        p_level_id: frm.value.p_level_id || '',
      };

      this.sysb300Service.querySYSB300(query).subscribe({
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
  onDelete(data: Sysb300m | Sysb300m[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集所有有效的 ID
    const idList = items
      .filter(
        (item) => item && item.level_id != null && item.level_id !== undefined,
      )
      .map((item) => item.level_id);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };
    this.sysb300Service.deleteSYSB300(deleteBody).subscribe({
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

  loadOptions() {
    {
      const query = {
        level_id: '',
        level_name: '',
        p_level_id: '',
      };

      this.sysb300Service.querySYSB300(query).subscribe((response) => {
        this.upgroup_Options = response.Data.map((item: Sysb300m) => ({
          value: item.level_id,
          label: item.level_name,
        }));
      });
    }
  }

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) {
      return;
    }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize + 1;
    form.SortBy = event.multiSortMeta ?? [{ field: 'level_id', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
