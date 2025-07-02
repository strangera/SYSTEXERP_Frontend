import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { tblRole } from '../../../shared/models/sys/sysb000.module';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
// 4-2-2-2角色之使用者設定維護
@Component({
  selector: 'app-sys0230',
  templateUrl: './sys0230.component.html',
  styleUrls: ['./sys0230.component.scss'],
})

export class SYS0230Component extends BasicQueryPageComponent<tblRole>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.maxLength(10)]], // 角色代號
    Role_Name: ['', [Validators.maxLength(30)]], // 角色名稱

    //分頁查詢
    ...createPaginationConfig([{ field: 'Role_No', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: tblRole[] = [];
  columns: Column[] = [
    { field: 'Role_No', header: '角色代號', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true },
    { field: 'Description', header: '角色註記', visible: true },
  ];
  // 多選項目
  selectedItems: tblRole[] = [];

  // 選項
  roleCodeOptions: any[] = [];

  constructor(
    private sys0210Service: Sys0210Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0230', 'SYS/SYS0230cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      this.sys0210Service.queryRole(frm.value).subscribe({
        next: (response) => {
          console.log('回傳Role:', response.Data);
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
      ids: idList, // 符合 API 的 idList 格式
    };

    console.log('Delete body:', JSON.stringify(deleteBody, null, 2));
    // this.sys0210Service.deleteRole(deleteBody).subscribe({
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
