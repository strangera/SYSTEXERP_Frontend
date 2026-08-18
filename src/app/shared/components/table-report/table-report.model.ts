/* eslint-disable @typescript-eslint/no-explicit-any */
import { SortMeta } from 'primeng/api';
export interface ReportColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  width?: string;    // 欄位寬度，例如 '80px'、'10rem'
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  exportFormat?: 'percentage' | 'decimal2' | Record<string, string>[];
  groupField?: string; //
  topGroupField?: string; // 選用的第三層表頭分組（在 groupField 之上再包一層，例如「比較期/基準期/差異」），需搭配 [topColumnGroup] 一起使用
  isSubTotal?: boolean; // 是否為小計欄位
  isTotal?: boolean; // 是否為總計欄位
  showSort?: boolean;
  sortField?: string; // 排序欄位(預設為 field)
  align?: 'left' | 'center' | 'right';
  reportType?: reportType; // 共通匯出格式類型
  type?: TableTypes; // 欄位類型
  buttonLabel?: string;
  cellClass?: (rowData: any, field?: string) => string;// 新增動態樣式 Callback，不影響舊邏輯
  link?: boolean; // 是否為連結
  linkDisabled?: (rowData: any) => boolean;
}

export type reportType =
  'string' | // string 類型，匯出時直接輸出原始值
  'percentage' // percentage 類型，匯出時將數值乘以 100 並添加百分號，保留兩位小數

export type TableTypes =
  'input' |
  'inputNumber' |
  'percent' |
  'dropdown' |
  'button' |
  'html' |
  'date' |
  'autoComplete' |
  'image' |
  'default' |
  'dropdownTable' |
  'dropdownTableTemplate' |
  'template' |
  'detail' |
  'link';

export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}
export interface AddButton {
  label: string | ((rowData: any) => string);
  icon?: string;
  action: (rowData: any, event?: Event) => void;
  disabled?: (rowData: any) => boolean;
}
/**
 * 通用的表格資料與排序酬載 (Payload)
 * 常用於匯出報表或向後端發送排序請求
 */
export interface TableQueryPayload {
  data: any;
  mode: 'single' | 'multiple';
  multiSortMeta: SortMeta[];
}
// formatDate：會輸出 2024/05/27 格式
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  let processedStr = dateStr;
  // 新增判斷：處理 YYYYMMDD 格式 (例如 20260114)
  const yyyymmddRegex = /^(\d{4})(\d{2})(\d{2})$/;
  if (yyyymmddRegex.test(dateStr)) {
    processedStr = dateStr.replace(yyyymmddRegex, '$1-$2-$3');
  }
  const date = new Date(processedStr);
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

/**
 * 將小數轉換為百分比字串 (例如: 0.12000 -> '12%')
 * 如果需要保留小數點，例如 12.00%，可以改成 (value * 100).toFixed(2) + '%'
 */
export const formatPercentage = (value: any): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '';
  }
  const num = Number(value) * 100;
  // 使用 Math.round 或 toFixed 根據你的業務需求決定
  // 範例 A (無條件捨入到整數，如 12%):
  // return `${Math.round(num)}%`;
  // 範例 B (如果需要保留兩位小數，如 12.00%):
  return `${num.toFixed(2)}%`;
}

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
    console.log(year, month);
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

export const formatTime = (value: any): string => {
  if (!value) return '';
  // 如果是字串格式 2026-03-10T04:53:00...
  if (typeof value === 'string' && value.includes('T')) {
    // 直接取 T 之後的 5 個字元 (HH:mm)
    const timePart = value.split('T')[1];
    return timePart.substring(0, 5);
  }
  // 如果已經是 Date 物件
  if (value instanceof Date) {
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  return value;
};

export const formatISOToHHMMSS = (val: string): string => {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
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

// 000,000,000 但 如果非數字 就回傳自己本身
export const formatAmount2 = (val: number | string | null | undefined): string => {
  // 1. 檢查是否為 null 或 undefined，如果是，則回傳空字串 ' ' 或您希望顯示的值（例如 '-'）
  if (val === null || val === undefined || val === '') {
    return ''; // 或 return '-'; 顯示破折號
  }
  const num = Number(val);
  // 2. 檢查是否為 NaN (非數字字串)，如果是，則回傳原始值
  // 這裡需要注意的是，如果原始值是 'abc' 這樣的字串，它會回傳 'abc'
  if (isNaN(num)) {
    return String(val);
  }
  // 3. 如果是有效數字（包括 0），則進行本地化格式化
  return num.toLocaleString(); // eg. 1,000,000
};
/**
 * 將數字格式化為帶有千分位逗號的字串，並控制小數點位數。
 * @param value 要格式化的數字或字串。
 * @param decimals 小數點位數 (預設為 2 位)。
 * @returns 格式化後的字串，如果輸入為 null/undefined 則返回空字串。
 */
export function formatAmountWithDecimals(value: any, decimals = 2): string {
  // 1. 處理 null, undefined, 或空字串
  if (value === null || value === undefined || value === '') {
    return '';
  }
  // 嘗試將輸入轉換為數字
  const num = Number(value);
  // 2. 處理非數字輸入
  if (isNaN(num)) {
    return String(value);
  }
  // 3. 使用 Intl.NumberFormat 進行格式化
  // 這確保了千分位 (useGrouping) 和指定小數點位數 (minimum/maximumFractionDigits)
  return new Intl.NumberFormat('zh-TW', { // 使用台灣或您習慣的區域設置
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true, // 啟用千分位逗號
  }).format(num);
}

/**
 * 將 YYYYMMDD (字串或數字) 格式化為 YYYY/MM/DD
 * 例如: "20250702" -> "2025/07/02"
 */
export const formatYYYYMMDD = (value: string | number | null | undefined): string => {
  if (!value) return '';
  const str = String(value).trim();
  // 檢查是否為 8 位數字字串
  if (str.length === 8) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);
    return `${year}/${month}/${day}`;
  }
  // 如果原本就已經帶有分隔符號 (例如 2025-07-02)，則嘗試用原有的 formatDate 處理
  return formatDate(str);
};
