import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { debounceTime } from 'rxjs';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls51020DropDownService } from '../../../service/api/tls/tls51020-dropdown.service';
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
  CAT_LName?: string;
  CAT_MNo: string;
  CAT_MName?: string;
  CAT_SNo: string;
  CAT_SName: string;
  CAT_SRemark: string | null;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CAT_LDisplay?: string;
  CAT_MDisplay?: string;
  CanDel: boolean; // 是否可以刪除
}
@Component({
  selector: 'app-tls51030',
  templateUrl: './tls51030.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, MultiSelectComponent, TableComponent, TranslateModule]
})
export class TLS51030Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CAT_SNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]],
    CAT_SName: ['', [Validators.maxLength(32)]],
    CAT_LNo: [[] as string[]],
    CAT_MNo: [[] as string[][]],
    ...createPaginationConfig([{ field: 'CAT_SNo', order: 1 }]), // 分頁和排序參數
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: Column[] = [
    { field: 'CAT_SNo', header: '小分類代碼', visible: true },
    { field: 'CAT_SName', header: '小分類名稱', visible: true },
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_SRemark', header: '說明', visible: true }
  ];

  totalRecords = 0;
  selectedItems: CategoryItem[] = [];
  bigCategoryOptions: { value: string, label: string }[] = [];
  middleCategoryOptions: {
    label: string,
    items: { value: string[], label: string }[]
  }[] = [];

  constructor(
    private validationService: ValidationService,
    private bigCategoryCodeService: Tls51010DropDownListService,
    private middleCategoryCodeService: Tls51020DropDownService,
    private apiService: TLS5000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51030', '/TLS/TLS51030cru', this.queryForm, (form) => this.onSubmit(form));

    // 載入大分類代碼
    this.bigCategoryCodeService.getSystemTypes().subscribe({
      next: (response) => {
        this.bigCategoryOptions = response;

        //  修正：大分類載入完成後，檢查是否需要載入中分類
        const currentCatLNo = this.queryForm.controls.CAT_LNo.value;
        if (currentCatLNo && Array.isArray(currentCatLNo) && currentCatLNo.length > 0) {
          this.loadMiddleCategoriesByMultipleCatLNo(currentCatLNo);
        }
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });

    // 監聽 CAT_LNo 變化，動態載入中分類代碼（支援多選陣列）
    this.queryForm.controls.CAT_LNo.valueChanges.pipe(debounceTime(300)).subscribe(catLNoArray => {
      if (catLNoArray && Array.isArray(catLNoArray) && catLNoArray.length > 0) {
        // 使用多選方法載入所有相關的中分類
        this.loadMiddleCategoriesByMultipleCatLNo(catLNoArray);
      } else {
        // 清空中分類選項，但不清空已選擇的值（讓用戶手動清除）
        this.middleCategoryOptions = [];
        // ❌ 不要自動清空用戶選擇的值
        // this.queryForm.controls.CAT_MNo.setValue([]);
      }
    });

    //  新增：查詢條件恢復機制（像 SYSB920 一樣）
    this.handleQueryRestore(this.queryForm, 'TLS51030', (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 處理多選參數
      const queryParams = { ...frm.value };

      // 處理大分類代碼多選陣列
      if (queryParams.CAT_LNo && Array.isArray(queryParams.CAT_LNo)) {
        if (queryParams.CAT_LNo.length === 0) {
          queryParams.CAT_LNo = null; // 或 delete queryParams.CAT_LNo;
        }
      }

      // 處理中分類代碼多選陣列
      if (queryParams.CAT_MNo && Array.isArray(queryParams.CAT_MNo)) {
        if (queryParams.CAT_MNo.length === 0) {
          queryParams.CAT_MNo = null; // 或 delete queryParams.CAT_MNo;
        }
      }

      console.log('查詢參數:', queryParams); // 除錯用

      this.apiService.queryTLS51030(queryParams).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data.map((item: CategoryItem) => {
              const catLDisplay = this.getCategoryDisplayName(item.CAT_LNo, this.bigCategoryOptions);
              const catMDisplay = item.CAT_MName ? `${item.CAT_MNo} - ${item.CAT_MName}` : item.CAT_MNo;
              return {
                ...item,
                CAT_LDisplay: catLDisplay,
                CAT_MDisplay: catMDisplay
              };
            });
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
            if (this.data.length === 0) {
              console.log('查詢結果為空');
              this.messageService.infoBubble('查詢結果為空');
            }
          } else {
            console.error('API error:', response.Status, response.Message, response.Error);
            this.messageService.errorBubble(`查詢失敗: ${response.Message || '未知錯誤'}`);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('API error:', err.status, err.message, err.error);
          this.messageService.errorBubble(`查詢失敗: ${err.message || '請檢查網路連線或聯繫管理員'}`);
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  private getCategoryDisplayName(code: string, options: { value: string, label: string }[]): string {
    const option = options.find(opt => opt.value === code);
    return option ? option.label : code;
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

    this.apiService.deleteTLS51030({ idList }).subscribe({
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
        this.onSubmit(this.queryForm); // 刷新資料
      },
    });

    this.selectedItems = [];
  }

  isRowSelectable(rowData: CategoryItem): boolean {
    return rowData.CanDel
  }

  private loadMiddleCategoriesByMultipleCatLNo(catLNoArray: string[]): void {
    this.middleCategoryCodeService.getSystemTypesByMultipleCatLNo(catLNoArray).subscribe({
      next: (response) => {
        // 將中分類依據大分類分組
        const groupedOptions: { [key: string]: { value: string[], label: string }[] } = {};

        response.forEach(item => {
          // 取得大分類代碼和名稱
          let catLNo = item.CAT_LNo;
          let catLName = item.CAT_LName;

          // 如果API沒有直接提供大分類資訊，從其他地方推斷
          if (!catLNo && item.value) {
            catLNo = item.value.substring(0, 3); // 假設大分類代碼是3位數
          }

          if (!catLNo) {
            catLNo = catLNoArray.find(selectedCatLNo => {
              return item.value.startsWith(selectedCatLNo);
            }) || catLNoArray[0];
          }

          // 從大分類選項中取得大分類名稱
          if (!catLName) {
            const bigCategoryOption = this.bigCategoryOptions.find(opt => opt.value === catLNo);
            if (bigCategoryOption) {
              // 假設bigCategoryOption.label格式是 "01 - 化妝品"，提取名稱部分
              const labelParts = bigCategoryOption.label.split(' - ');
              catLName = labelParts.length > 1 ? labelParts[1] : labelParts[0];
            }
          }

          // 初始化分組
          if (!groupedOptions[catLNo]) {
            groupedOptions[catLNo] = [];
          }

          //  修改：直接使用陣列格式作為 value
          const originalLabel = item.label; // 例如: "001 - 彩妝品"
          const middleCategoryCode = item.value; // 例如: "001"
          const middleCategoryName = originalLabel.includes(' - ')
            ? originalLabel.split(' - ')[1]
            : originalLabel;

          // 顯示格式：001-彩妝品 (不顯示大分類代碼)
          const fullDisplayLabel = `${middleCategoryCode}-${middleCategoryName}`;

          //  新的 value 格式：使用陣列 [大分類代碼, 中分類代碼]
          const arrayValue = [catLNo, middleCategoryCode];

          // 加入到對應的分組
          groupedOptions[catLNo].push({
            value: arrayValue,        // 使用陣列格式：["01", "001"]
            label: fullDisplayLabel   // 顯示完整路徑
          });
        });

        // 轉換為 PrimeNG 分組格式
        this.middleCategoryOptions = catLNoArray
          .filter(catLNo => groupedOptions[catLNo] && groupedOptions[catLNo].length > 0)
          .map(catLNo => {
            // 取得大分類名稱
            const bigCategoryOption = this.bigCategoryOptions.find(opt => opt.value === catLNo);
            let bigCategoryName = catLNo; // 預設值

            if (bigCategoryOption) {
              const labelParts = bigCategoryOption.label.split(' - ');
              bigCategoryName = labelParts.length > 1 ? labelParts[1] : labelParts[0];
            }

            return {
              label: `${catLNo}-${bigCategoryName}`, // 分組標題：01-化妝品
              items: groupedOptions[catLNo].sort((a, b) => a.label.localeCompare(b.label))
            };
          });

        console.log('分組後的中分類選項:', this.middleCategoryOptions);

        //  選項驗證邏輯需要相應調整
        const currentCatMNo = this.queryForm.controls.CAT_MNo.value;
        if (currentCatMNo && Array.isArray(currentCatMNo) && currentCatMNo.length > 0) {
          const allValidOptions = this.middleCategoryOptions.flatMap(group =>
            group.items.map(item => item.value)
          );

          const validCatMNo = currentCatMNo.filter(value =>
            allValidOptions.some(validOption =>
              Array.isArray(validOption) && Array.isArray(value) &&
              validOption[0] === value[0] && validOption[1] === value[1]
            )
          );

          if (validCatMNo.length !== currentCatMNo.length) {
            this.queryForm.controls.CAT_MNo.setValue(validCatMNo);

            const removedCount = currentCatMNo.length - validCatMNo.length;
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
