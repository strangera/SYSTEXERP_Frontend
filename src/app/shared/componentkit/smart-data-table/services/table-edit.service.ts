// shared/componentkit/smart-data-table/services/table-edit.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ColumnDef, isEditableColumn, ValidationResult, DropdownOption, NumberConfig } from '../types/column.types';
import { EditContext, DetailEditContext } from '../types/table.types';

@Injectable({
  providedIn: 'root'
})
export class TableEditService {

  // ==================== 欄位驗證 ====================

  /**
   * 驗證單一欄位值
   */
  validateField(value: any, column: ColumnDef, rowData?: any): ValidationResult {
    // 如果欄位不可編輯，跳過驗證
    if (!isEditableColumn(column)) {
      return { isValid: true };
    }

    // 必填檢查
    if (column.required && this.isEmpty(value)) {
      return {
        isValid: false,
        message: `${column.header} 為必填欄位`
      };
    }

    // 如果值為空且非必填，則通過驗證
    if (this.isEmpty(value) && !column.required) {
      return { isValid: true };
    }

    // 根據欄位類型進行驗證
    switch (column.type) {
      case 'text':
        return this.validateTextField(value, column);
      case 'number':
        return this.validateNumberField(value, column);
      case 'dropdown':
        return this.validateDropdownField(value, column, rowData);
      case 'date':
        return this.validateDateField(value, column);
      case 'checkbox':
        return this.validateCheckboxField(value, column);
      default:
        return { isValid: true };
    }
  }

  /**
   * 驗證整行資料
   */
  validateRow(rowData: any, columns: ColumnDef[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    columns.forEach(column => {
      if (isEditableColumn(column)) {
        const value = rowData[column.field];
        const result = this.validateField(value, column, rowData);
        results.push({
          ...result,
          field: column.field,
          header: column.header
        } as any);
      }
    });

    return results;
  }

  /**
   * 檢查整行是否通過驗證
   */
  isRowValid(rowData: any, columns: ColumnDef[]): boolean {
    const results = this.validateRow(rowData, columns);
    return results.every(result => result.isValid);
  }

  // ==================== 欄位選項處理 ====================

  /**
   * 取得下拉選單選項
   */
  getFieldOptions(column: ColumnDef, rowData?: any): DropdownOption[] {
    if (!isEditableColumn(column) || column.type !== 'dropdown') {
      return [];
    }

    if (!column.options) {
      return [];
    }

    // 如果是函數，執行它
    if (typeof column.options === 'function') {
      return column.options(rowData);
    }

    // 如果是陣列，直接返回
    return column.options;
  }

  /**
   * 取得下拉選單顯示文字
   */
  getDropdownDisplayText(value: any, column: ColumnDef, rowData?: any): string {
    if (!value && value !== 0) {
      return '';
    }

    const options = this.getFieldOptions(column, rowData);
    if (!options || options.length === 0) {
      return String(value);
    }

    const foundOption = options.find(option =>
      option.value === value || option.value === String(value)
    );

    return foundOption ? foundOption.label : String(value);
  }

  // ==================== 數字欄位處理 ====================

  /**
   * 取得數字輸入配置
   */
  getNumberInputConfig(column: ColumnDef): any {
    if (!isEditableColumn(column) || column.type !== 'number') {
      return this.getDefaultNumberConfig();
    }

    const config = column.numberConfig || {};

    if (config.allowDecimal) {
      return {
        mode: 'decimal',
        minFractionDigits: 0,
        maxFractionDigits: config.decimalPlaces || 2,
        step: config.step || (config.decimalPlaces === 1 ? 0.1 : 0.01),
        useGrouping: config.useGrouping !== false,
        min: config.min,
        max: config.max
      };
    }

    return {
      mode: 'decimal',
      minFractionDigits: 0,
      maxFractionDigits: 0,
      step: config.step || 1,
      useGrouping: config.useGrouping !== false,
      min: config.min,
      max: config.max
    };
  }

  // ==================== 值處理與轉換 ====================

  /**
   * 處理欄位值變更
   */
  handleFieldChange(context: EditContext, column: ColumnDef): Observable<EditContext> {
    // 執行自定義變更處理
    if (isEditableColumn(column) && column.onChange) {
      try {
        column.onChange(context.newValue, context.oldValue, context.rowData);
      } catch (error) {
        console.error('欄位變更處理器執行錯誤:', error);
      }
    }

    // 可以在這裡添加額外的處理邏輯，比如：
    // - 記錄變更歷史
    // - 觸發相關欄位更新
    // - 執行業務邏輯驗證

    return of(context);
  }

  /**
   * 格式化欄位值用於顯示
   */
  formatValueForDisplay(value: any, column: ColumnDef, rowData?: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    // 如果有自定義格式化器
    if (!isEditableColumn(column) && column.formatter) {
      try {
        return column.formatter(value, rowData);
      } catch (error) {
        console.error('自定義格式化器執行錯誤:', error);
        return String(value);
      }
    }

    // 根據類型進行預設格式化
    switch (column.type) {
      case 'number':
        return this.formatNumber(value);
      case 'checkbox':
        return value ? '是' : '否';
      case 'dropdown':
        return this.getDropdownDisplayText(value, column, rowData);
      default:
        return String(value);
    }
  }

  // ==================== 私有驗證方法 ====================

  private validateTextField(value: any, column: ColumnDef): ValidationResult {
    const strValue = String(value);

    // 檢查最大長度
    if (isEditableColumn(column) && column.maxLength && strValue.length > column.maxLength) {
      return {
        isValid: false,
        message: `${column.header} 不能超過 ${column.maxLength} 個字元`
      };
    }

    // 執行自定義驗證
    if (isEditableColumn(column) && column.validator) {
      return column.validator(value);
    }

    return { isValid: true };
  }

  private validateNumberField(value: any, column: ColumnDef): ValidationResult {
    const numValue = Number(value);

    // 檢查是否為有效數字
    if (isNaN(numValue)) {
      return {
        isValid: false,
        message: `${column.header} 必須為有效數字`
      };
    }

    // 檢查範圍
    if (isEditableColumn(column) && column.numberConfig) {
      const config = column.numberConfig;

      if (config.min !== undefined && numValue < config.min) {
        return {
          isValid: false,
          message: `${column.header} 不能小於 ${config.min}`
        };
      }

      if (config.max !== undefined && numValue > config.max) {
        return {
          isValid: false,
          message: `${column.header} 不能大於 ${config.max}`
        };
      }
    }

    // 執行自定義驗證
    if (isEditableColumn(column) && column.validator) {
      return column.validator(value);
    }

    return { isValid: true };
  }

  private validateDropdownField(value: any, column: ColumnDef, rowData?: any): ValidationResult {
    const options = this.getFieldOptions(column, rowData);

    // 檢查值是否在選項中
    const isValidOption = options.some(option =>
      option.value === value || option.value === String(value)
    );

    if (!isValidOption && options.length > 0) {
      return {
        isValid: false,
        message: `${column.header} 的值不在可選範圍內`
      };
    }

    // 執行自定義驗證
    if (isEditableColumn(column) && column.validator) {
      return column.validator(value, rowData);
    }

    return { isValid: true };
  }

  private validateDateField(value: any, column: ColumnDef): ValidationResult {
    // 日期驗證邏輯可以委託給 DateFormatterService
    // 這裡做基本檢查
    if (value && !(value instanceof Date) && isNaN(Date.parse(value))) {
      return {
        isValid: false,
        message: `${column.header} 格式不正確`
      };
    }

    // 執行自定義驗證
    if (isEditableColumn(column) && column.validator) {
      return column.validator(value);
    }

    return { isValid: true };
  }

  private validateCheckboxField(value: any, column: ColumnDef): ValidationResult {
    // Checkbox 通常不需要特殊驗證，除非有自定義驗證器
    if (isEditableColumn(column) && column.validator) {
      return column.validator(value);
    }

    return { isValid: true };
  }

  // ==================== 工具方法 ====================

  private isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  private getDefaultNumberConfig(): any {
    return {
      mode: 'decimal',
      minFractionDigits: 0,
      maxFractionDigits: 0,
      step: 1,
      useGrouping: false
    };
  }

  private formatNumber(value: any): string {
    const num = Number(value);
    if (isNaN(num)) return String(value);

    // 可以根據需要調整數字格式化邏輯
    return num.toLocaleString();
  }
}
