import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { Column } from '../../../others/component/table/table.model';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string;
  bus_type_name: string;
  bus_type_desc: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CanDel: boolean;
}

@Component({
  selector: 'app-sysb800',
  templateUrl: './sysb800.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TableReportComponent, TranslateModule]
})
// 大分類基本資料維護作業
export class SYSB800Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    bus_type: [, [Validators.maxLength(2)]], // 大分類代號
    bus_type_name: ['', [Validators.maxLength(40)]], // 大分類名稱
    bus_type_desc: ['', [Validators.maxLength(160)]], // 備註
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'bus_type', order: 1 }]],
  });

  data: CategoryItem[] = [];
  columns: Column[] = [
    { field: 'bus_type', header: '大分類代號', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'bus_type_desc', header: '備註', visible: true },
    // 其他欄位
  ];
  lastQueryBody: any;
  totalRecords = 0;
  selectedItems: CategoryItem[] = [];

  constructor(
    public readonly apiService: Bas1000Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB800', '/SYS/SYSB800cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.querySYSB800(frm.value).pipe(finalize(() => this.loading = false)).subscribe((response: any) => {
        this.lastQueryBody = frm.value;
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || response.Data.length;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
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
      header: '刪除確認',
      message: `是否確定刪除所選的 ${idList.length} 筆項目?`,
      accept: () => {
        this.apiService.deleteSYSB800({ idList }).subscribe((response) => {
          this.messageService.successBubble(response.Message || '選中項目刪除成功');
          this.selectedItems = [];
          this.onSubmit(this.queryForm); // 刷新資料
        });
      }
    });
  }

  isRowSelectable(rowData: CategoryItem): boolean {
    return rowData.CanDel
  }
}
