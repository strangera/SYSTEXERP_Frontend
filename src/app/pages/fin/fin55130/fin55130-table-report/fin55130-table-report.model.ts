
export interface ReportColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  groupField?: string; //
  isSubTotal?: boolean; // 是否為小計欄位
  isTotal?: boolean; // 是否為總計欄位
  showSort?: boolean;
  sortField?: string; // 排序欄位(預設為 field)
  align?: 'left' | 'center' | 'right';
  link?: boolean; // 是否為連結
}
export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
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
// 000,000,000
export const formatAmount = (val: number | string | null | undefined): string => {
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
export const formatYN = (value: string): string => {
  return value === 'Y' ? '是' : '否';
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
