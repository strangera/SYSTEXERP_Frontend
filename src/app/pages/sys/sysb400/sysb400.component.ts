import { Sysb400Service } from './../../../service/sysb/sysb400.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { option, Sysb400m } from '../module/sysb000.module';
import { TableLazyLoadEvent } from 'primeng/table';
import { SortMeta } from 'primeng/api';
import { Sysb300Service } from '../../../service/sysb/sysb300.service';

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'SYSB400';

@Component({
  selector: 'app-sysb400',
  templateUrl: './sysb400.component.html',
  styleUrls: ['./sysb400.component.scss'],
})
export class SYSB400Component
  extends BasicQueryPageComponent<Sysb400m>
  implements OnInit
{
  data: Sysb400m[] = [];
  filteredData: Sysb400m[] = [...this.data];
  columns: any[] = [
    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    {
      field: 'level_id',
      header: '組織階層代碼',
      visible: true,
      format: (value: string) =>
        this.level_nameOptions.find((option) => option.value === value)
          ?.label || value,
    },
    { field: 'p_org_id', header: '上層組織代碼', visible: true },
    { field: 'p_level_id', header: '上層組織階層代碼', visible: true },
    { field: 'stop_flag', header: '是否停用', visible: true },
  ];

  queryForm = this.formBuilder.group({
    // SYS3100 + SYS3000
    org_id: ['', Validators.maxLength(20)], // 組織代碼
    org_name: ['', Validators.maxLength(40)], // 組織名稱
    level_id: ['', Validators.maxLength(2)], // 組織階層代碼

    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'org_id', order: 1 }] as SortMeta[]],
  });

  level_nameOptions: option[] = [];
  whetherOptions: option[] = [];

  // // 分頁和排序參數
  // pageSize: number = 10;
  // pageIndex: number = 0;
  totalRecords = 0;
  // lastQueryParams: any = null;
  // sortField: string = 'CAT_LNo';
  // sortOrder: number = 1;

  // 多選項目
  selectedItems: Sysb400m[] = [];

  constructor(
    private sysb300Service: Sysb300Service,
    private sysb400Service: Sysb400Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB400', 'SYS/SYSB400CRU');
    this.loadOptions();

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) =>
      this.onSubmit(form),
    );
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.sysb400Service.querySYSB400(frm.value).subscribe({
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
    this.data = [];
    this.filteredData = [];
    this.totalRecords = 0;
    this.queryStateService.clearQueryState(storageKey);
  }

  // 刪除項目
  onDelete(data: Sysb400m | Sysb400m[]): void {
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
    this.sysb400Service.deleteSYSB400(deleteBody).subscribe({
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
    //階層作業
    const queryLevel = {
      level_id: '',
      level_name: '',
      p_level_id: '',
    };
    this.sysb300Service.querySYSB300(queryLevel).subscribe({
      next: (response: any) => {
        console.log('API response:', response);
        if (response.Status === '0000') {
          this.level_nameOptions = response.Data || [];
          console.log('取得內容', this.level_nameOptions);
        } else {
          console.error('API error:', response.Status, response.Message);
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.loading = false;
        this.messageService.unblockUi();
      },
    });

    this.whetherOptions = [
      { value: 'Y', label: '是' },
      { value: 'N', label: '否' },
    ];
  }

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) {
      return;
    }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize + 1;
    form.SortBy = event.multiSortMeta ?? [{ field: 'org_id', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
