import { Signal, TemplateRef } from '@angular/core';
import { SortMeta } from 'primeng/api';
export interface Column<T = Record<string, any>> {
  field: keyof T;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  hidden?: boolean;  // 是否隱藏 (是否為無法篩選欄位)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  exportFormat?: Record<string, string>[];
  groupField?: string;
  isSubTotal?: boolean; // 是否為小計欄位
  isTotal?: boolean; // 是否為總計欄位
  showSort?: boolean;
  sortField?: string; // 排序欄位(預設為 field)
  htmlFormat?: boolean; // 是否為 HTML 格式 (適用於顯示特殊符號或樣式)

  disabled?: (value: any) => boolean;  // 是否禁用 (是否為禁用欄位)

  validate?: ((value: string, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[]; })[]; // 驗證規則(如果是可輸入的欄位)

  dataKey?: string;
  type?: TableTypes; // 欄位類型
  prefix?: string; // 前綴 (適用於 input 類型)
  suffix?: string; // 後綴 (適用於 input 類型)
  fractionDigits?: number;
  useGrouping?: boolean;
  required?: boolean; // 是否為必填欄位 (適用於輸入欄位)

  options?: any | ((rowData: any) => any); // 支持靜態數據或基於 rowData 生成
  optionLabel?: string; // 下拉選單 optionLabel
  optionValue?: string; // 下拉選單 optionValue
  optionShowClear?: boolean; // 下拉選單是否顯示清除按鈕
  templateLabel?: string; // 模板欄位 label
  filter?: boolean;

  buttonLabel?: string; // 選擇按鈕 label
  checkboxTrueLabel?: string; // checkbox 非編輯模式 true 顯示文字（適用於單一布林值）
  checkboxFalseLabel?: string; // checkbox 非編輯模式 false 顯示文字（適用於單一布林值）
  dateFormat?: string; // 日期格式（例如 'yy-mm-dd'，僅適用於 type='date'）
  frozen?: boolean;  // 是否凍結 (是否為凍結欄位)
  alignFrozen?: string; // 凍結欄位對齊方式

  /** 給dropdownTable 用的數值 */
  tableData?: any[]; // 表格數據
  tableColumns?: any[]; // 表格欄位
  tableKey?: string; // 表格數據的唯一鍵值欄位
  tableRows?: number; // 表格顯示的行數
  tableLoading?: boolean; // 載入狀態
  valueKey?: string; // 回傳值欄位
  totalRecords?: number; // 總數
  multiSortMeta?: SortMeta[]; // 多重排序設定
  lazy?: boolean; // 是否啟用懶加載

  tableTemplate?: Signal<TemplateRef<any>>; // TODO: 自定義表格模板
}

export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}

export interface ColumnGroupRow {
  columns: ColumnGroup[];
}

export interface LazyLoadEvent {
  pageIndex: number; // 當前頁碼
  pageSize: number; // 每頁顯示的數量
  SortBy: SortMeta[]; // 排序欄位
}

export const createPaginationConfig = (defaultSortBy?: SortMeta[]) => {
  return {
    pageSize: [20],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [defaultSortBy ?? []],
  };
};

export interface AddButton {
  label: string;
  icon: string;
  action: (rowData: any, event?: Event) => void;
  disabled?: (rowData: any) => boolean;
}

export interface RowEditSaveEvent<T = any> {
  oldData: T;
  newData: T;
  ri: number;
  data: T | T[];
}
// 欄位變更事件
export interface FieldChangeEvent<T = any> {
  rowData: T;
  field: string;
  value: T[keyof T];
  index?: number;
}
//formatDate：會輸出 2024/05/27 格式
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

//formatDateTime：會輸出 2024/05/27 14:30:25 格式
export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

// formatYYYYMM 輸出為 YYYY/MM
export const formatYYYYMM = (value: string | Date | null): string => {
  // 處理空值
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // 檢查輸入是否為 Date 物件
  if (value instanceof Date) {
    const year = value.getFullYear().toString();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }

  // 檢查輸入是否為 YYYYMM 格式的字串
  if (typeof value === 'string' && value.length === 6) {
    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    return `${year}/${month}`;
  }

  // 如果輸入格式不符合預期，回傳空字串
  return '';
};

// formatTimeHHMM 輸出為 HH:MM
export const formatTimeHHMM = (value: string | number | Date): string => {
  if (!value) return '';

  if (value instanceof Date) {
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  const strValue = String(value).padStart(4, '0'); // 確保是4位數，不足補0
  return `${strValue.substring(0, 2)}:${strValue.substring(2, 4)}`;
};

// HH:MM:SS
export const formatTimeHHMMSS = (value: string | number | Date): string => {
  if (!value) return '';

  if (value instanceof Date) {
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    const ss = String(value.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  const strValue = String(value).padStart(6, '0'); // 確保是6位數，不足補0
  return `${strValue.substring(0, 2)}:${strValue.substring(2, 4)}:${strValue.substring(4, 6)}`;
};


// 000,000,000
export const formatAmount = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString(); // eg. 1,000,000
};
export const formatYN = (value: string): string => {
  return value === 'Y' ? '是' : '否';
};

export const formatTimeToHHMMSS = (date: Date): string => {
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};
// formatDateToYYYYMMDD：輸出為 YYYYMMDD
export const formatDateToYYYYMMDD = (value: string | Date): string => {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

// formatDateTimeToHHMMSS：將完整日期時間字串轉為 HH:MM:SS
export const formatDateTimeToHHMMSS = (dateStr: string): string => {
  if (!dateStr) {
    return '';
  }
  const date = new Date(dateStr);
  // 檢查是否為有效的日期
  if (isNaN(date.getTime())) {
    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

// 輸出YYYYMM格式的日期
export const formatYYYYMMToDate = (value: string): Date | null => {
  if (!value || !/^\d{6}$/.test(value)) return null;
  const year = Number(value.substring(0, 4));
  const month = Number(value.substring(4, 6)) - 1; // JS 月份從 0 開始
  return new Date(year, month, 1);
};

// 將 "YYYYMM" 轉為 Date 物件
export function convertYYYYMMToDate(yyyymm: string): Date | null {
  if (!/^\d{6}$/.test(yyyymm)) return null;
  const year = Number(yyyymm.substring(0, 4));
  const month = Number(yyyymm.substring(4, 6)) - 1; // JS 月份從 0 開始
  return new Date(year, month, 1);
}

// 將 Date 轉為 "YYYYMM" 物件
export function convertDateToYYYYMM(date: Date): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份從 1 開始
  return `${year}${month}`;
}
// formatDateToYYYY_MM_DD：輸出為 YYYY-MM-DD（避免 toISOString 造成減一天）
export const formatDateToYYYY_MM_DD = (value: string | Date): string | null => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
// addDaysToDate：增加天數後的日期
export const addDaysToDate = (date: Date, days: number): Date => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// formatPercentage: 格式化為百分比，可指定小數點位數
export const formatPercentage = (value: number | string | null | undefined, fractionDigits = 0): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '';
  }
  // 將輸入值轉為數字，並四捨五入到指定小數點位數
  const num = Number(value);
  const roundedNum = num.toFixed(fractionDigits);
  return `${roundedNum}%`;
};

// formatDivideBy100: 將數字除以 100
export const formatDivideBy100 = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return null;
  }
  const num = Number(value);
  return num / 100;
};
// 金額格式化999,999,999，只取整數
export const formatAmountWithFraction = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 }); // eg. 1,000,000.00
};

// 將時間轉換成YYYY
export const convertDateToYYYY = (date: Date): string => {
  if (!date) return '';
  const year = date.getFullYear();
  return String(year);
};


export type TableTypes =
  'input' |
  'inputNumber' |
  'dropdown' |
  'button' |
  'html' |
  'date' |
  'autoComplete' |
  'image' |
  'default' |
  'dropdownTable' |
  'dropdownTableTemplate';
