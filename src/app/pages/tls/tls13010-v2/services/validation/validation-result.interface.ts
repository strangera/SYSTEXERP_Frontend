/**
 * 驗證結果介面
 */

/**
 * 驗證結果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 欄位驗證錯誤
 */
export interface FieldValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * 詳細驗證結果
 */
export interface DetailedValidationResult extends ValidationResult {
  fieldErrors: FieldValidationError[];
}

/**
 * 建立空白驗證結果
 */
export function createEmptyResult(): DetailedValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: [],
    fieldErrors: []
  };
}

/**
 * 合併多個驗證結果
 */
export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const merged: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  for (const result of results) {
    if (!result.isValid) {
      merged.isValid = false;
    }
    merged.errors.push(...result.errors);
    merged.warnings.push(...result.warnings);
  }

  return merged;
}
