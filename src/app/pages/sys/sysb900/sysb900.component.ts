import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string; //大分類代碼
  bus_class: string; //中分類(中分類)代碼
  bus_class_name: string; //中分類(中分類)名稱
  bus_type_name: string; //大分類名稱
  bus_type_desc: string; //大分類說明(不過好像沒用到)
  bus_class_desc: string; //中分類(中分類)說明
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CanDel: boolean;
}


@Component({
  selector: 'app-sysb900',
  templateUrl: './sysb900.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, MultiSelectComponent, TableReportComponent, TranslateModule]
})
// 中分類維護作業
export class SYSB900Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  Options: { value: string, label: string }[] = [];
  queryForm = this.formBuilder.nonNullable.group({
    bus_class: ['', [Validators.maxLength(2)]], // 中分類代號
    bus_class_name: ['', [Validators.maxLength(40)]], // 中分類名稱
    bus_type: [[] as string[]], // 所屬大分類
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'bus_class', order: 1 }]],

  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: any[] = [
    { field: 'bus_class', header: '中分類代碼', visible: true },
    { field: 'bus_class_name', header: '中分類名稱', visible: true },
    { field: 'bus_type', header: '所屬大分類代碼', visible: true },
    { field: 'bus_type_name', header: '所屬大分類名稱', visible: true },
    { field: 'bus_class_desc', header: '備註', visible: true },

    // 其他欄位
  ];
  lastQueryBody: any;
  totalRecords = 0;
  selectedItems: CategoryItem[] = [];
  option: any[] = [];

  constructor(
    private readonly Sysb800DropdownService: Sysb800DropdownService,
    public readonly apiService: Bas1000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB900', '/SYS/SYSB900cru', this.queryForm, (form) => this.onSubmit(form));

    this.Sysb800DropdownService.getSystemTypes().subscribe({
      next: (response) => {
        this.option = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.querySYSB900(frm.value).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.lastQueryBody = frm.value;
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            // 儲存查詢條件（成功查詢後）
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
      header: '刪除確認',
      message: `是否確定刪除所選的 ${idList.length} 筆項目?`,
      accept: () => {
        this.apiService.deleteSYSB900({ idList }).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('選中項目刪除成功');
              this.selectedItems = [];
              this.onSubmit(this.queryForm); // 刷新資料
            } else {
              console.error('API error:', response.Status, response.Message);
              this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
            }
          },
          error: (err: string) => {
            console.error('API error:', err);
            this.messageService.errorBubble('刪除失敗');
          },
        });
      }
    });
  }

  isRowSelectable(rowData: CategoryItem): boolean {
    return rowData.CanDel
  }
}
