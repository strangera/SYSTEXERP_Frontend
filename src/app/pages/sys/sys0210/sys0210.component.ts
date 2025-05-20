import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { tblRole } from '../../../shared/models/sys/sysb000.module';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-sys0210',
  templateUrl: './sys0210.component.html',
  styleUrls: ['./sys0210.component.scss'],
})
// 4-2-2-1角色基本資料維護
export class SYS0210Component extends BasicQueryPageComponent<tblRole>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    role_no: ['', [Validators.maxLength(10)]], // 角色代號
    role_name: ['', [Validators.maxLength(30)]], // 角色名稱
    description: ['', [Validators.maxLength(50)]], // 角色註記

    //分頁查詢
    ...createPaginationConfig([{ field: 'role_no', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: tblRole[] = [];
  columns: Column[] = [
    { field: 'role_no', header: '角色代號', visible: true },
    { field: 'role_name', header: '角色名稱', visible: true },
    { field: 'description', header: '角色註記', visible: true },
  ];
  // 多選項目
  selectedItems: tblRole[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0210', 'SYS/SYS0210CRU', this.queryForm, (form) => this.onSubmit(form));
    // this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      // this.sysb300Service.querySYSB300(frm.value).subscribe({
      //   next: (response) => {
      //     // console.log('回傳階層:', response.Data);
      //     if (response.Status === '0000') {
      //       this.data = response.Data || [];
      //       this.totalRecords = response.TotalCount || response.Data.length;
      //       this.queryStateService.setQueryState(this.ProgNo, frm.value);
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //     }
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      // });
    });
  }

  // 刪除項目
  onDelete(data: tblRole | tblRole[]): void {
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

    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };

    console.log('Delete body:', JSON.stringify(deleteBody, null, 2));
    // this.sysb300Service.deleteSYSB300(deleteBody).subscribe({
    //   next: (response) => {
    //     if (response.Status === '0000') {
    //       this.messageService.successBubble('選中項目刪除成功');
    //     } else {
    //       console.error('API error:', response.Status, response.Message);
    //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
    //     }
    //   },
    //   error: (err: string) => {
    //     console.error('API error:', err);
    //     this.messageService.errorBubble('刪除失敗');
    //   },
    //   complete: () => {
    //     this.onSubmit(this.queryForm);
    //   },
    // });

    this.selectedItems = [];
  }
}
