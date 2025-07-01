import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Sysb500m } from '../../../shared/models/sys/sysb000.module';
import { Sysb500Service } from '../../../service/api/sys/sysb500.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-sysb500',
  templateUrl: './sysb500.component.html',
  styleUrl: './sysb500.component.scss',
})
// 區域基本資料維護作業
export class SYSB500Component
  extends BasicQueryPageComponent<Sysb500m>
  implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    area_no: ['', [Validators.maxLength(2)]], // 區域別編號
    area_desc: ['', [Validators.maxLength(30)]], // 區域別名稱

    //分頁查詢
    ...createPaginationConfig([{ field: 'area_no', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Sysb500m[] = [];
  columns: Column[] = [
    { field: 'area_no', header: '區域別編號', visible: true },
    { field: 'area_desc', header: '區域別名稱', visible: true },
  ];
  // 多選項目
  selectedItems: Sysb500m[] = [];

  // ----------------------------------------------------------------

  constructor(private sysb500Service: Sysb500Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB500', 'SYS/SYSB500cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('queryForm', frm.value);
      this.sysb500Service.querySYSB500(frm.value).subscribe({
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
