import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ValidationService } from '../../../shared/service/validation.service';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MRemark: string | null;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  CanDel: boolean;
}
@Component({
  selector: 'app-tls51010',
  templateUrl: './tls51010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    TableReportComponent
  ],
})
export class TLS51010Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  // 查詢表單：包含大分類代碼和名稱
  queryForm = this.formBuilder.group({
    CAT_LNo: ['', [Validators.maxLength(2), this.validationService.numberValidator]],
    CAT_LName: ['', [Validators.maxLength(32)]],
    ...createPaginationConfig([{ field: 'CAT_LNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  lastQueryBody: any = null;// 上次查詢的表單數據
  data: CategoryItem[] = [];// 表格數據和篩選數據
  columns: Column[] = [// 表格欄位定義
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_LRemark', header: '備註', visible: true, type: 'html' },
  ];
  selectedItems: CategoryItem[] = [];// 多選項目

  constructor(
    private readonly validationService: ValidationService,
    public readonly apiService: TLS5000Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS51010', '/TLS/TLS51010cru', this.queryForm, (form) => this.onSubmit(form));
  }
  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS51010(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Status === '0000') {
          this.lastQueryBody = frm.value;
          this.data = response.Data || [];
          this.totalRecords = response.TotalCount || response.Data.length; // 排序需要
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        }
      });
    });
  }
  // 刪除項目
  onDelete(data: CategoryItem | CategoryItem[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;

    const idList = items
      .filter(item => item && item.id != null)
      .map(item => item.id);

    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.messageService.confirm({
      message: '是否確認刪除所選大分類資料?',
      header: '確認刪除',
      accept: () => {
        this.loading = true;
        this.apiService.deleteTLS51010({ idList }).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('刪除成功');
              this.selectedItems = [];
              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
            }
          },
          error: () => {
            this.messageService.errorBubble('刪除失敗');
          },
          complete: () => {
            this.loading = false;
          },
        });
      }
    });
  }


  isRowSelectable(rowData: CategoryItem): boolean {
    return rowData.CanDel
  }
}
