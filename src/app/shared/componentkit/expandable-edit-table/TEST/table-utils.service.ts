import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
// table-utils.service.ts
// 🎯 表格工具服務，處理樣式、寬度計算等輔助功能

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableUtilsService {

  /**
   * 🔧 寬度控制相關方法
   */
  getColumnStyle(col: ColumnDef): any {
    const styles: any = {};
    const screenWidth = window.innerWidth;

    if (col.responsiveWidth) {
      if (screenWidth < 768 && col.responsiveWidth.mobile) {
        styles.width = col.responsiveWidth.mobile;
        styles.minWidth = col.responsiveWidth.mobile;
      } else if (screenWidth < 1024 && col.responsiveWidth.tablet) {
        styles.width = col.responsiveWidth.tablet;
        styles.minWidth = col.responsiveWidth.tablet;
      } else if (col.responsiveWidth.desktop) {
        styles.width = col.responsiveWidth.desktop;
        styles.minWidth = col.responsiveWidth.desktop;
      }
    }
    else if (col.width) {
      styles.width = col.width;
      styles.minWidth = col.width;
    }
    else if (col.autoWidth) {
      const defaultWidth = this.getTypeDefaultWidth(col.type, screenWidth);
      styles.width = defaultWidth;
      styles.minWidth = defaultWidth;
    }
    else if (col.flex) {
      styles.flex = col.flex;
      if (col.minWidth) {
        styles.minWidth = col.minWidth;
      }
    }

    if (col.maxWidth) {
      styles.maxWidth = col.maxWidth;
    }

    if (col.style) {
      if (typeof col.style === 'string') {
        const styleArray = col.style.split(';');
        styleArray.forEach(style => {
          if (style.trim()) {
            const [property, value] = style.split(':').map(s => s.trim());
            if (property && value) {
              styles[this.camelCase(property)] = value;
            }
          }
        });
      }
    }

    return styles;
  }

  /**
   * 🎯 獲取類型預設寬度
   */
  private getTypeDefaultWidth(type: string = 'text', screenWidth: number): string {
    const widthMap: { [key: string]: { desktop: string, tablet: string, mobile: string } } = {
      'checkbox': { desktop: '60px', tablet: '50px', mobile: '45px' },
      'date': { desktop: '150px', tablet: '130px', mobile: '120px' },
      'number': { desktop: '110px', tablet: '100px', mobile: '90px' },
      'dropdown': { desktop: '130px', tablet: '120px', mobile: '110px' },
      'text': { desktop: '120px', tablet: '110px', mobile: '100px' }
    };

    const typeWidth = widthMap[type] || widthMap['text'];

    if (screenWidth < 768) {
      return typeWidth.mobile;
    } else if (screenWidth < 1024) {
      return typeWidth.tablet;
    } else {
      return typeWidth.desktop;
    }
  }

  /**
   * 🎯 響應式欄位樣式
   */
  getResponsiveColumnStyle(col: ColumnDef): any {
    const baseStyle = this.getColumnStyle(col);
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
      if (baseStyle.width && typeof baseStyle.width === 'string' && baseStyle.width.includes('px')) {
        const widthValue = parseInt(baseStyle.width);
        baseStyle.width = Math.max(60, widthValue * 0.8) + 'px';
      }
    } else if (screenWidth < 1024) {
      if (baseStyle.width && typeof baseStyle.width === 'string' && baseStyle.width.includes('px')) {
        const widthValue = parseInt(baseStyle.width);
        baseStyle.width = Math.max(80, widthValue * 0.9) + 'px';
      }
    }

    return baseStyle;
  }

  /**
   * 🎯 轉換為駝峰式命名
   */
  private camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * 🎯 獲取預設欄位寬度
   */
  getDefaultColumnWidth(col: ColumnDef): string {
    if (col.width || col.minWidth) {
      return '';
    }

    switch (col.type) {
      case 'checkbox':
        return '80px';
      case 'date':
        return '140px';
      case 'number':
        return '110px';
      case 'dropdown':
        return '120px';
      case 'text':
        return col.field.includes('name') || col.field.includes('title') ? '200px' : '120px';
      default:
        return '120px';
    }
  }

  /**
   * 🎯 主表格表頭操作欄位樣式
   */
  getActionHeaderStyle(): any {
    return {
      position: 'sticky',
      right: '0',
      zIndex: '3',
      width: '120px',
      minWidth: '120px',
      textAlign: 'center'
    };
  }

  /**
   * 🎯 主表格表身操作欄位樣式
   */
  getActionBodyStyle(): any {
    return {
      position: 'sticky',
      right: '0',
      zIndex: '2',
      backgroundColor: '#fff',
      width: '120px',
      minWidth: '120px',
      textAlign: 'center'
    };
  }

  /**
   * 🎯 詳細資料表格表頭操作欄位樣式
   */
  getDetailActionHeaderStyle(): any {
    return {
      position: 'sticky',
      right: '0',
      zIndex: '3',
      backgroundColor: '#4a69bd',
      width: '120px',
      minWidth: '120px',
      textAlign: 'center',
      color: '#fff'
    };
  }

  /**
   * 🎯 詳細資料表格表身操作欄位樣式
   */
  getDetailActionBodyStyle(): any {
    return {
      position: 'sticky',
      right: '0',
      zIndex: '2',
      backgroundColor: '#f8f9fa',
      width: '120px',
      minWidth: '120px',
      textAlign: 'center'
    };
  }

  /**
   * 🎯 取得數字輸入的設定
   */
  getNumberInputConfig(col: ColumnDef): any {
    const baseConfig = {
      mode: 'decimal',
      useGrouping: true,  // 🎯 這是關鍵，確保千分位顯示
      min: 0
    };

    if (col.allowDecimal) {
      return {
        ...baseConfig,
        minFractionDigits: 0,
        maxFractionDigits: col.decimalPlaces || 2,
        step: col.decimalPlaces === 1 ? 0.1 : 0.01
      };
    }

    return {
      ...baseConfig,
      minFractionDigits: 0,
      maxFractionDigits: 0,
      step: 1
    };
  }

  /**
   * 🎯 計算展開內容的欄位數
   */
  getExpandedColspan(
    showCheckBox: boolean,
    selectionMode: 'multiple' | 'single' | null,
    readonly: boolean,
    detailKey: string,
    mainColumns: ColumnDef[]
  ): number {
    let colspan = 1; // 序號欄

    if (showCheckBox && selectionMode === 'multiple' && !readonly) {
      colspan += 1;
    }

    if (detailKey) {
      colspan += 1;
    }

    colspan += mainColumns.filter(col => !col.hidden).length;

    if (!readonly) {
      colspan += 1;
    }

    return colspan;
  }

  /**
   * 🎯 計算可見欄位數量
   */
  getVisibleColumnsCount(
    showCheckBox: boolean,
    selectionMode: 'multiple' | 'single' | null,
    readonly: boolean,
    detailKey: string,
    mainColumns: ColumnDef[]
  ): number {
    let count = 1; // 序號欄

    // 勾選框欄（只在非 readonly 且啟用時計算）
    if (showCheckBox && selectionMode === 'multiple' && !readonly) {
      count += 1;
    }

    // 展開欄
    if (detailKey) {
      count += 1;
    }

    // 主要欄位數量（排除隱藏的）
    count += mainColumns.filter(col => !col.hidden).length;

    return count;
  }

  /**
   * 🎯 欄位編輯狀態檢查
   */
  isFieldEditable(column: ColumnDef, isEditing: boolean): boolean {
    // 如果欄位設為不可編輯，則永遠不可編輯
    if (column.editable === false) {
      return false;
    }

    // 如果欄位設為可編輯或未設定，則根據當前編輯狀態決定
    return isEditing && (column.editable === true || column.editable === undefined);
  }

  /**
   * 🎯 檢查欄位是否應該顯示為輸入控件
   */
  shouldShowInputControl(column: ColumnDef, isEditing: boolean): boolean {
    if (column.directEdit === true && column.editable !== false) {
      return true;
    }
    return this.isFieldEditable(column, isEditing);
  }

  /**
   * 🎯 檢查欄位是否應該顯示為純文字
   */
  shouldShowDisplayOnly(column: ColumnDef, isEditing: boolean): boolean {
    if (column.directEdit === true && column.editable !== false) {
      return false;
    }
    return !this.isFieldEditable(column, isEditing);
  }

  /**
   * 🎯 獲取下拉選單顯示文字
   */
  getDropdownDisplayText(rowData: any, col: ColumnDef, fieldOptions: any[]): string {
    const value = rowData[col.field];

    if (!value && value !== 0) {
      return '';
    }

    if (!fieldOptions || fieldOptions.length === 0) {
      return value;
    }

    const foundOption = fieldOptions.find(option => {
      if (typeof option === 'object' && option !== null) {
        return option.value === value || option.value === String(value);
      }
      return option === value;
    });

    if (foundOption) {
      return typeof foundOption === 'object' ? foundOption.label : foundOption;
    }

    return value;
  }

  /**
   * 🎯 清理無效的選擇項目
   */
  cleanupInvalidSelections(selectedItems: any[], data: any[], dataKey: string): any[] {
    if (selectedItems.length === 0) {
      return selectedItems;
    }

    return selectedItems.filter(selectedItem => {
      return data.some(dataItem => dataItem[dataKey] === selectedItem[dataKey]);
    });
  }

  /**
   * 🎯 軌跡函數（用於 p-table 的 trackBy）
   */
  createTrackByFn(dataKey: string) {
    return (index: number, item: any) => {
      return item[dataKey] || index;
    };
  }
}
