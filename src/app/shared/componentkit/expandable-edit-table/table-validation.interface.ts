// table-validation.interface.ts
// 表格驗證相關的接口定義

import { ValidatorFn } from '@angular/forms';

/**
 * 驗證結果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 欄位驗證配置接口
 */
export interface FieldValidationConfig {
  required?: boolean;                    // 是否為必填欄位
  requiredMessage?: string;              // 自定義必填錯誤訊息
  validators?: ValidatorFn[];            // 自定義驗證器陣列
  minLength?: number;                    // 最小長度
  maxLength?: number;                    // 最大長度
}

/**
 * 驗證器工廠類別
 */
export class TableValidators {

  /**
   * 數值範圍驗證器
   */
  static range(min?: number, max?: number, message?: string): ValidatorFn {
    return (control: any) => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null; // 空值交給 required 驗證器處理
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { message: message || '必須是有效數字' };
      }

      if (min !== undefined && numValue < min) {
        return { message: message || `數值不能小於 ${min}` };
      }

      if (max !== undefined && numValue > max) {
        return { message: message || `數值不能大於 ${max}` };
      }

      return null;
    };
  }

  /**
   * 正數驗證器
   */
  static positive(message?: string): ValidatorFn {
    return (control: any) => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numValue = Number(value);
      if (isNaN(numValue) || numValue <= 0) {
        return { message: message || '必須是正數' };
      }

      return null;
    };
  }

  /**
   * 非負數驗證器
   */
  static nonNegative(message?: string): ValidatorFn {
    return (control: any) => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return { message: message || '不能是負數' };
      }

      return null;
    };
  }

  /**
   * 自定義模式驗證器
   */
  static pattern(pattern: RegExp, message?: string): ValidatorFn {
    return (control: any) => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }

      if (!pattern.test(value)) {
        return { message: message || '格式不正確' };
      }

      return null;
    };
  }
}
