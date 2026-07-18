import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '@shared/service/validation.service';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { Sysb600Service } from '../../../service/api/sys/sysb600.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column, createPaginationConfig } from '../../../others/component/table/table.model';
import { Sysb600m } from '../../../shared/models/sys/sysb000.model';

@Component({
  selector: 'app-sysb600',
  templateUrl: './sysb600.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableComponent,
    TranslateModule,
  ],
})
// 樓層基本資料維護作業
export class SYSB600Component
  extends BasicQueryPageComponent<Sysb600m>
  implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    floor_no: ['', [Validators.maxLength(2), this.validationService.alphanumericValidator]], // 樓層編號(半形英文+數字)
    floor_desc: ['', [Validators.maxLength(20)]], //樓層名稱

    //分頁查詢
    ...createPaginationConfig([{ field: 'floor_no', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Sysb600m[] = [];
  columns: Column[] = [
    { field: 'floor_no', header: '樓層編號', visible: true },
    { field: 'floor_desc', header: '樓層名稱', visible: true },
  ];
  // 多選項目
  selectedItems: Sysb600m[] = [];
  // ----------------------------------------------------------------

  constructor(
    private sysb600Service: Sysb600Service,
    private validationService: ValidationService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB600', 'SYS/SYSB600cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('queryForm', frm.value);
      this.sysb600Service.querySYSB600(frm.value).subscribe({
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
  onDelete(data: Sysb600m | Sysb600m[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的樓層基本資料?`,
      header: `確認刪除`,
      accept: () => {
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

        this.sysb600Service.deleteSYSB600(deleteBody).subscribe({
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
      },
    });
  }
}
