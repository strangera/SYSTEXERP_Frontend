/**
 * 通用介面定義
 */

/**
 * 下拉選項
 */
export interface DropdownOption {
  label: string;
  value: string;
  sort?: number;
}

/**
 * 操作結果
 */
export interface OperationResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * 日期範圍
 */
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * 標籤頁選項
 */
export interface TabOption {
  id: string;
  label: string;
  allowAdd?: boolean;
  allowBatchDelete?: boolean;
  showCheckbox?: boolean;
}
