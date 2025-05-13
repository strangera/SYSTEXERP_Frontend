import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Permissions
// import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { apiOption, Sysb300m } from '../module/sysb000.module';
import { Sysb300Service } from '../../../service/API/sys/sysb300.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-sysb300',
  templateUrl: './sysb300.component.html',
  styleUrl: './sysb300.component.scss',
})

// 組織階層設定作業
export class SYSB300Component
  extends BasicQueryPageComponent<Sysb300m>
  implements OnInit {
  upgroup_Options: apiOption[] = [];
  // 查詢
  queryForm = this.formBuilder.group({
    // SYS3000 組織階層設定檔
    level_id: ['', [Validators.maxLength(2)]], // 組織階層代碼
    level_name: ['', [Validators.maxLength(30)]], // 組織階層名稱
    p_level_id: ['', [Validators.maxLength(2)]], // 上層組織階層代碼
    //分頁查詢
    ...createPaginationConfig, // 分頁和排序參數 // 排序需要
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Sysb300m[] = [];
  columns: Column[] = [
    { field: 'level_id', header: '階層代碼', visible: true },
    { field: 'level_name', header: '階層名稱', visible: true },
    {
      field: 'p_level_id',
      header: '上層組織',
      visible: true,
      format: (value: string) =>
        this.upgroup_Options.find((option) => option.No === value)?.Name ||
        value,
    },
  ];
  selectedItems: Sysb300m[] = [];// 多選項目

  // ----------------------------------------------------------------

  constructor(private sysb300Service: Sysb300Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB300', 'SYS/SYSB300CRU', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      this.sysb300Service.querySYSB300(frm.value).subscribe({
        next: (response) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
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
    this.sysb300Service.deleteSYSB300(deleteBody).subscribe({
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

  loadOptions() {
    {
      this.sysb300Service
        .querySYSB300_DropDownList({})
        .subscribe((response) => {
          this.upgroup_Options = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + ' ' + item.Name,
          }));
        });
    }
  }
}
