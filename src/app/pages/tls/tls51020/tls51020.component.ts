import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls51010DropDownListService } from '../../../service/api/tls/tls51010-dropdown.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MNo: string;
  CAT_MName: string;
  CAT_MRemark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CAT_LDisplay?: string; // 組合 CAT_LNo 和 CAT_LName
  CanDel: boolean;
}
// 2.5.1.2  中分類維護作業
@Component({
  selector: 'app-tls51020',
  templateUrl: './tls51020.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, MultiSelectComponent, TableComponent, TranslateModule]
})
export class TLS51020Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  // ProgNo: string = '250002';
  bigCategoryOptions: { value: string, label: string }[] = []; // 用於下拉選單
  queryForm = this.formBuilder.nonNullable.group({
    CAT_MNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]], // 中分類代碼
    CAT_MName: ['', [Validators.maxLength(32)]], // 中分類名稱
    CAT_LNo: [[] as string[]],  //大分類代碼
    // CAT_MRemark: [,], // 說明
    ...createPaginationConfig([{ field: 'CAT_MNo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  //篩選表格的欄位
  columns: Column[] = [
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_MRemark', header: '備註', visible: true }, // 說明
  ];

  totalRecords = 0;

  // 多選項目
  selectedItems: CategoryItem[] = [];

  constructor(
    private validationService: ValidationService,
    private dropdownListService: Tls51010DropDownListService,
    private apiService: TLS5000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51020', '/TLS/TLS51020cru', this.queryForm, (form) => this.onSubmit(form));
    // 獲取大分類代碼
    this.dropdownListService.getSystemTypes().subscribe({
      next: (response) => {
        this.bigCategoryOptions = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 處理多選大分類代碼的查詢參數
      const queryParams = { ...frm.value };

      // 處理多選大分類代碼陣列
      if (queryParams.CAT_LNo && Array.isArray(queryParams.CAT_LNo)) {
        // 如果是空陣列，根據後端需求處理
        if (queryParams.CAT_LNo.length === 0) {
          // 選擇以下其中一種處理方式（根據您的後端 API 需求）：
          queryParams.CAT_LNo = null; // 設為 null
          // delete queryParams.CAT_LNo; // 或刪除參數
        }
        // 如果有值，保持陣列格式不變
      }

      console.log('查詢參數:', queryParams); // 除錯用，上線時可移除

      this.apiService.queryTLS51020(queryParams).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data.map((item: CategoryItem) => ({
              ...item,
              CAT_LDisplay: `${item.CAT_LNo || ''} - ${item.CAT_LName || ''}`
            }));
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
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
      message: '是否確認刪除所選中分類資料?',
      header: '確認刪除',
      accept: () => {
        this.loading = true;
        this.apiService.deleteTLS51020({ idList }).subscribe({
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
