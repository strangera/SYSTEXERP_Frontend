import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
// selector-handler.service.ts
// 🎯 選擇器處理服務，專門處理 selector-panel 相關邏輯
import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SelectorHandlerService implements OnDestroy {

  // selector 相關的控制項和資料
  private selectorControls = new Map<string, FormControl>();
  private selectorSuggestions = new Map<string, any[]>();
  private selectorSearchForms = new Map<string, FormGroup>();

  constructor(private fb: FormBuilder) { }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * 🎯 獲取 selector 控制項
   */
  getSelectorControl(rowData: any, fieldName: string, dataKey: string = 'id'): FormControl {
    const key = `${rowData[dataKey]}_${fieldName}`;

    if (!this.selectorControls.has(key)) {
      const control = new FormControl(rowData[fieldName] || '');
      this.selectorControls.set(key, control);

      // 🎯 注意：不要在這裡監聽 valueChanges
      // 因為 selector-panel 的事件會直接處理值的更新
      // 避免重複觸發 onDirectEditChange
    }

    return this.selectorControls.get(key)!;
  }

  /**
   * 🎯 獲取 selector 建議項目
   */
  getSelectorSuggestions(rowData: any, fieldName: string, dataKey: string = 'id'): any[] {
    const key = `${rowData[dataKey]}_${fieldName}`;
    return this.selectorSuggestions.get(key) || [];
  }

  /**
   * 🎯 處理 selector 搜尋輸入變更
   */
  onSelectorSearchInputChanged(searchParams: any, rowData: any, column: ColumnDef, dataKey: string = 'id'): void {
    const key = `${rowData[dataKey]}_${column.field}`;

    if (column.selectorConfig?.searchMethod) {
      column.selectorConfig.searchMethod(searchParams).subscribe(suggestions => {
        this.selectorSuggestions.set(key, suggestions);
      });
    }
  }

  /**
   * 🎯 處理 selector 搜尋表單變更
   */
  onSelectorSearchFormChanged(formValue: any, rowData: any, column: ColumnDef, dataKey: string = 'id'): void {
    console.log('🚨 表格收到搜尋表單變更:', formValue);
    console.log('🔍 表單值詳細:', JSON.stringify(formValue, null, 2));

    if (column.selectorConfig?.searchMethod) {
      console.log('🚀 準備執行搜尋:', formValue);

      column.selectorConfig.searchMethod(formValue).subscribe({
        next: (results) => {
          console.log('✅ 搜尋成功，結果數量:', results.length);

          if (column.selectorConfig) {
            column.selectorConfig.panelDataSource = results;

            // 🎯 關鍵：從 LocationService 的特殊物件中取得分頁資訊
            const paginationInfo = (results as any).__paginationInfo;

            if (paginationInfo) {
              // 有分頁資訊，使用後端提供的總筆數
              column.selectorConfig.totalDataCount = paginationInfo.totalCount;
              console.log('📊 使用後端分頁資訊:', {
                總筆數: paginationInfo.totalCount,
                總頁數: paginationInfo.totalPages,
                當前頁: paginationInfo.currentPage,
                每頁筆數: paginationInfo.pageSize
              });
            } else {
              // 沒有分頁資訊，使用估算
              this.updateTotalCount(column.selectorConfig, results, formValue);
            }
          }

          console.log('📊 面板資料已更新:', {
            資料筆數: results.length,
            總筆數: column.selectorConfig?.totalDataCount
          });
        },
        error: (error) => {
          console.error('❌ 搜尋失敗:', error);
          if (column.selectorConfig) {
            column.selectorConfig.panelDataSource = [];
            column.selectorConfig.totalDataCount = 0;
          }
        }
      });
    }
  }

  /**
   * 🎯 獲取 selector 搜尋表單
   */
  getSelectorSearchForm(rowData: any, column: ColumnDef, dataKey: string = 'id'): FormGroup {
    const key = `${rowData[dataKey]}_${column.field}`;

    if (!this.selectorSearchForms.has(key)) {
      const form = this.createSelectorSearchForm(column);
      this.selectorSearchForms.set(key, form);
    }

    return this.selectorSearchForms.get(key)!;
  }

  /**
   * 🎯 建立 selector 搜尋表單
   */
  private createSelectorSearchForm(column: ColumnDef): FormGroup {
    const formConfig: { [key: string]: any } = {};

    if (column.selectorConfig?.searchFormFields) {
      column.selectorConfig.searchFormFields.forEach(field => {
        formConfig[field.name] = [''];
      });
    }

    // 🎯 修正：統一使用大寫 SortBy
    formConfig['pageSize'] = [10];
    formConfig['pageIndex'] = [1];
    formConfig['SortBy'] = [[]];  // 用大寫，預設空陣列

    return this.fb.group(formConfig);
  }

  /**
   * 🎯 更新總筆數的方法（簡化邏輯）
   */
  private updateTotalCount(selectorConfig: any, results: any[], searchParams: any): void {
    const pageSize = searchParams.pageSize || 10;
    const pageIndex = searchParams.pageIndex || 0;

    // 🎯 簡化邏輯：如果回傳的資料少於 pageSize，表示是最後一頁
    if (results.length < pageSize) {
      // 最後一頁：計算總筆數
      selectorConfig.totalDataCount = pageIndex * pageSize + results.length;
      console.log('📊 總筆數 (最後頁):', selectorConfig.totalDataCount);
    } else {
      // 不是最後一頁：估算總筆數（至少還有下一頁）
      selectorConfig.totalDataCount = (pageIndex + 1) * pageSize + 1;
      console.log('📊 總筆數 (估計):', selectorConfig.totalDataCount);
    }
  }

  /**
   * 🎯 處理項目選擇事件
   */
  onSelectorItemSelected(
    selectedItem: any,
    rowData: any,
    column: ColumnDef,
    dataKey: string = 'id',
    onDropdownChange?: (event: any) => void
  ): void {
    console.log('🎯 表格收到 selector item selected:', {
      selectedItem,
      rowDataId: rowData.id || rowData[dataKey],
      field: column.field
    });

    const oldValue = rowData[column.field];
    const newValue = selectedItem[column.selectorConfig?.valuePropertyName || 'value'];

    // 🎯 更新 rowData
    rowData[column.field] = newValue;

    // 🎯 更新對應的 FormControl
    const control = this.getSelectorControl(rowData, column.field, dataKey);
    if (control) {
      control.setValue(newValue, { emitEvent: false }); // 不觸發 valueChanges
    }

    // 🚨 關鍵：發出 dropdownChange 事件，包含完整的 selectedItem
    onDropdownChange?.({
      rowData,
      field: column.field,
      newValue,
      oldValue,
      selectedOption: selectedItem // 🎯 這裡傳遞完整的選擇項目資料
    });

    console.log('✅ 表格發出 dropdownChange 事件，包含 selectedOption');
  }

  /**
   * 🎯 處理值變更事件
   */
  onSelectorValueChanged(
    event: { oldValue: any, newValue: any, selectedItem: any },
    rowData: any,
    column: ColumnDef,
    dataKey: string = 'id',
    onDropdownChange?: (event: any) => void
  ): void {
    console.log('📄 表格收到 selector value changed:', {
      event,
      rowDataId: rowData.id || rowData[dataKey],
      field: column.field
    });

    // 🎯 更新 rowData
    rowData[column.field] = event.newValue;

    // 🎯 發出 dropdownChange 事件
    onDropdownChange?.({
      rowData,
      field: column.field,
      newValue: event.newValue,
      oldValue: event.oldValue,
      selectedOption: event.selectedItem // 🎯 傳遞完整的選擇項目資料
    });
  }

  /**
   * 🎯 處理選擇變更事件
   */
  onSelectorSelectionChanged(
    selectedItem: any,
    rowData: any,
    column: ColumnDef,
    dataKey: string = 'id',
    onDropdownChange?: (event: any) => void
  ): void {
    console.log('🎯 表格收到 selector selection changed:', selectedItem);

    // 🎯 與 itemSelected 使用相同的處理邏輯
    this.onSelectorItemSelected(selectedItem, rowData, column, dataKey, onDropdownChange);
  }

  /**
   * 🎯 清理 selector 相關資源
   */
  cleanup(): void {
    this.selectorControls.clear();
    this.selectorSuggestions.clear();
    this.selectorSearchForms.clear();
  }

  /**
   * 🎯 清理特定行的 selector 資源
   */
  cleanupRowSelectorResources(rowData: any, dataKey: string = 'id'): void {
    const rowKey = rowData[dataKey];
    const keysToDelete: string[] = [];

    // 清理 controls
    this.selectorControls.forEach((control, key) => {
      if (key.startsWith(`${rowKey}_`)) {
        keysToDelete.push(key);
      }
    });

    // 清理 suggestions
    this.selectorSuggestions.forEach((suggestions, key) => {
      if (key.startsWith(`${rowKey}_`)) {
        keysToDelete.push(key);
      }
    });

    // 清理 search forms
    this.selectorSearchForms.forEach((form, key) => {
      if (key.startsWith(`${rowKey}_`)) {
        keysToDelete.push(key);
      }
    });

    // 執行清理
    keysToDelete.forEach(key => {
      this.selectorControls.delete(key);
      this.selectorSuggestions.delete(key);
      this.selectorSearchForms.delete(key);
    });
  }

  /**
   * 🎯 重置服務狀態
   */
  reset(): void {
    this.cleanup();
  }
}
