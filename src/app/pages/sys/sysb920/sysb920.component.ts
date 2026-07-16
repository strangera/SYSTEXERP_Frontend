import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { debounceTime } from 'rxjs';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { MiddleCategoryItem, Sysb900DropdownService } from '../../../service/api/sys/sysb900-dropdown.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string; //大分類代碼
  bus_type_name: string; //大分類名稱
  bus_class: string; //中分類(中分類)代碼
  bus_class_name: string; //中分類(中分類)名稱
  bus_sclass: string; //小分類代碼
  bus_sclass_name: string; //小分類名稱
  bus_sclass_desc: string; //備註
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}


@Component({
  selector: 'app-sysb920',
  templateUrl: './sysb920.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, MultiSelectComponent, TableReportComponent, TranslateModule]
})
// 小分類維護作業
export class SYSB920Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  bigCategoryOptions: { value: string, label: string }[] = [];
  // 分組的中分類選項，value 現在是 [大分類代碼, 中分類代碼] 格式
  middleCategoryOptions: {
    label: string,
    items: { value: string[], label: string }[]
  }[] = [];
  queryForm = this.formBuilder.nonNullable.group({
    bus_sclass: ['', [Validators.maxLength(2)]], // 小分類
    bus_sclass_name: ['', [Validators.maxLength(40)]], // 小分類名稱
    bus_type: [[] as string[]], // 大分類代碼
    bus_class: [[] as string[][]],// 中分類代碼
    bus_sclass_desc: ['', [Validators.maxLength(200)]], // 備註
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'bus_sclass', order: 1 }]],
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: ReportColumn[] = [
    { field: 'bus_sclass', header: '小分類代碼', visible: true },
    { field: 'bus_sclass_name', header: '小分類名稱', visible: true },
    { field: 'bus_type', header: '所屬大分類代碼', visible: true },
    { field: 'bus_type_name', header: '所屬大分類', visible: true },
    { field: 'bus_class', header: '中分類代碼', visible: true },
    { field: 'bus_class_name', header: '中分類名稱', visible: true },
    { field: 'bus_sclass_desc', header: '備註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  industryTypeOptions: any[] = [];
  productTypeOptions: any[] = [];
  lastQueryBody: any;
  totalRecords = 0;
  selectedItems: CategoryItem[] = [];

  constructor(
    private readonly Sysb800DropdownService: Sysb800DropdownService,
    private readonly Sysb900DropdownService: Sysb900DropdownService,
    public readonly apiService: Bas1000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB920', '/SYS/SYSB920CRU', this.queryForm, (form) => this.onSubmit(form));

    // 載入大分類代碼
    this.Sysb800DropdownService.getSystemTypes().subscribe({
      next: (response) => {
        this.bigCategoryOptions = response;

        // 檢查是否需要載入中分類
        const currentBusType = this.queryForm.controls.bus_type.value;
        if (currentBusType && Array.isArray(currentBusType) && currentBusType.length > 0) {
          this.loadMiddleCategoriesByMultipleBusType(currentBusType);
        }
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });

    // 監聽 bus_type 變化，動態載入中分類代碼（支援多選陣列）
    this.queryForm.controls.bus_type.valueChanges.pipe(debounceTime(300)).subscribe(busTypes => {
      if (busTypes && Array.isArray(busTypes) && busTypes.length > 0) {
        // 使用多選方法載入所有相關的中分類
        this.loadMiddleCategoriesByMultipleBusType(busTypes);
      } else {
        // 清空中分類選項，但不清空已選擇的值
        this.middleCategoryOptions = [];
      }
    });

  }


  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 處理多選參數
      const queryParams = { ...frm.value };

      // 處理大分類代碼多選陣列
      if (queryParams.bus_type && Array.isArray(queryParams.bus_type)) {
        if (queryParams.bus_type.length === 0) {
          queryParams.bus_type = null; // 或 delete queryParams.bus_type;
        }
      }

      // 處理中分類代碼多選陣列，使用二維陣列 [大分類代碼, 中分類代碼][]
      if (queryParams.bus_class && Array.isArray(queryParams.bus_class)) {
        if (queryParams.bus_class.length === 0) {
          queryParams.bus_class = null; // 或 delete queryParams.bus_class;
        }
      }

      console.log('查詢參數:', queryParams); // 除錯用

      this.apiService.querySYSB920(queryParams).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.lastQueryBody = queryParams;
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            // 儲存查詢條件（成功查詢後）
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
            if (this.data.length === 0) {
              console.log('查詢結果為空');
              this.messageService.infoBubble('查詢結果為空');
            }
          } else {
            console.error('API error:', response.Status, response.Message);
            this.messageService.errorBubble(`查詢失敗: ${response.Message || '未知錯誤'}`);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.messageService.errorBubble(`查詢失敗: ${err || '請檢查網路連線或聯繫管理員'}`);
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
        this.apiService.deleteSYSB920({ idList }).subscribe({
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

  private loadMiddleCategoriesByMultipleBusType(busTypes: string[]): void {
    this.Sysb900DropdownService.getSystemTypesByMultipleBusType(busTypes).subscribe({
      next: (response: MiddleCategoryItem[]) => {
        // 將中分類依據大分類分組
        // 修正: 明確定義 groupedOptions 中的 value 型別
        const groupedOptions: Record<string, { value: string[], label: string }[]> = {};

        response.forEach(item => {
          // 取得大分類代碼和名稱
          const busType = item.bus_type;

          // 初始化分組
          if (!groupedOptions[busType]) {
            groupedOptions[busType] = [];
          }

          // 加入到對應的分組，確保 value 是字串陣列
          // 修正: 明確指定 value 為字串陣列
          const arrayValue: string[] = [busType, item.bus_class];

          groupedOptions[busType].push({
            value: arrayValue,   // 確保是 string[] 型別
            label: item.label    // 顯示完整路徑 (如: 001 - 中分類名稱)
          });
        });

        // 轉換為 PrimeNG 分組格式
        this.middleCategoryOptions = busTypes
          .filter(busType => groupedOptions[busType] && groupedOptions[busType].length > 0)
          .map(busType => {
            // 取得大分類名稱
            const bigCategoryOption = this.bigCategoryOptions.find(opt => opt.value === busType);
            let bigCategoryName = busType; // 預設值

            if (bigCategoryOption) {
              const labelParts = bigCategoryOption.label.split(' - ');
              bigCategoryName = labelParts.length > 1 ? labelParts[1] : labelParts[0];
            }

            return {
              label: `${busType}-${bigCategoryName}`, // 分組標題：10-物販
              items: groupedOptions[busType].sort((a, b) => a.label.localeCompare(b.label))
            };
          });

        console.log('分組後的中分類選項:', this.middleCategoryOptions);

        // 選項驗證邏輯 - 適應陣列格式 [大分類代碼, 中分類代碼]
        const currentBusClass = this.queryForm.controls.bus_class.value;
        if (currentBusClass && Array.isArray(currentBusClass) && currentBusClass.length > 0) {
          const allValidOptions = this.middleCategoryOptions.flatMap(group =>
            group.items.map(item => item.value)
          );

          const validBusClass = currentBusClass.filter(value =>
            allValidOptions.some(validOption =>
              Array.isArray(validOption) && Array.isArray(value) &&
              validOption[0] === value[0] && validOption[1] === value[1]
            )
          );

          if (validBusClass.length !== currentBusClass.length) {
            this.queryForm.controls.bus_class.setValue(validBusClass);

            const removedCount = currentBusClass.length - validBusClass.length;
            if (removedCount > 0) {
              this.messageService.warnBubble(`有 ${removedCount} 個中分類選項因大分類變更而被移除`);
            }
          }
        }
      },
      error: (error) => {
        console.error('獲取中分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入中分類代碼，請稍後重試');
        this.middleCategoryOptions = [];
      }
    });
  }
}
