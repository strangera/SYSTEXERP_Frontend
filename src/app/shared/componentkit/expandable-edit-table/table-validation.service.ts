// table-validation.service.ts
// 🎯 表格驗證服務，處理所有驗證邏輯

import { Injectable } from '@angular/core';
import { ColumnDef } from './expandable-edit-table.component';
import { ValidationResult, FieldValidationConfig } from './table-validation.interface';

@Injectable({
  providedIn: 'root'
})
export class TableValidationService {

  // 🆕 儲存每一列的驗證錯誤
  private validationErrors: Map<string, string[]> = new Map();

  /**
   * 🎯 檢查欄位是否為必填
   */
  isFieldRequired(column: ColumnDef): boolean {
    return column.required === true;
  }

  /**
   * 🎯 驗證單一欄位
   */
  validateField(rowData: any, column: ColumnDef, value: any, dataKey = 'id'): string | null {
    let errorMessage: string | null = null;

    // 必填驗證
    if (column.required) {
      if (this.isEmpty(value)) {
        errorMessage = column.requiredMessage || `${column.header}為必填欄位`;
      }
    }

    // 長度驗證
    if (!errorMessage && value && typeof value === 'string') {
      if (column.minLength && value.length < column.minLength) {
        errorMessage = `${column.header}最少需要${column.minLength}個字元`;
      }
      if (column.maxLength && value.length > column.maxLength) {
        errorMessage = `${column.header}最多只能${column.maxLength}個字元`;
      }
    }

    // 自定義驗證器
    if (!errorMessage && column.validators && !this.isEmpty(value)) {
      for (const validator of column.validators) {
        const result = validator({ value } as any);
        if (result) {
          errorMessage = result['message'] || '驗證失敗';
          break;
        }
      }
    }

    return errorMessage;
  }

  /**
   * 🎯 驗證整列資料（在按下確認時呼叫）
   */
  validateRow(rowData: any, columns: ColumnDef[], dataKey: string = 'id'): ValidationResult {
    const errors: string[] = [];
    const editableColumns = columns.filter(col =>
      col.editable !== false && (col.required || col.validators)
    );

    for (const column of editableColumns) {
      const value = rowData[column.field];
      const errorMessage = this.validateField(rowData, column, value, dataKey);

      if (errorMessage) {
        errors.push(errorMessage);
      }
    }

    const rowKey = rowData[dataKey];
    if (errors.length > 0) {
      this.validationErrors.set(rowKey, errors);
    } else {
      this.validationErrors.delete(rowKey);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 🎯 取得列的驗證錯誤訊息
   */
  getRowValidationErrors(rowData: any, dataKey = 'id'): string[] {
    const rowKey = rowData[dataKey];
    return this.validationErrors.get(rowKey) || [];
  }

  /**
   * 🎯 檢查列是否有驗證錯誤
   */
  hasRowValidationErrors(rowData: any, dataKey = 'id'): boolean {
    return this.getRowValidationErrors(rowData, dataKey).length > 0;
  }

  /**
   * 🎯 清除列的驗證錯誤
   */
  clearRowValidationErrors(rowData: any, dataKey: string = 'id'): void {
    const rowKey = rowData[dataKey];
    this.validationErrors.delete(rowKey);
  }

  /**
   * 🎯 清除所有驗證錯誤
   */
  clearAllValidationErrors(): void {
    this.validationErrors.clear();
  }

  /**
   * 🎯 格式化驗證錯誤訊息
   */
  formatValidationErrors(errors: string[]): string {
    console.log('🔍 formatValidationErrors 被呼叫:', errors);
    if (errors.length === 0) return '';

    if (errors.length === 1) {
      return errors[0];
    }

    // 🎯 優化多個錯誤的顯示格式
    const errorList = errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
    return `請修正以下問題：\n\n${errorList}`;
  }

  /**
   * 🎯 檢查值是否為空
   */
  private isEmpty(value: any): boolean {
    return value === null ||
      value === undefined ||
      value === '' ||
      (typeof value === 'string' && value.trim() === '');
  }

  /**
   * 🎯 批量驗證多列資料
   */
  validateMultipleRows(dataList: any[], columns: ColumnDef[], dataKey = 'id'): { isValid: boolean; invalidCount: number; totalErrors: string[] } {
    let invalidCount = 0;
    const totalErrors: string[] = [];

    for (const rowData of dataList) {
      const result = this.validateRow(rowData, columns, dataKey);
      if (!result.isValid) {
        invalidCount++;
        totalErrors.push(...result.errors);
      }
    }

    return {
      isValid: invalidCount === 0,
      invalidCount,
      totalErrors
    };
  }

  /**
   * 🎯 重置驗證狀態
   */
  reset(): void {
    this.validationErrors.clear();
  }
}
