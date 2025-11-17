
export interface ReportColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  exportFormat?: Record<string, string>[];
  groupField?: string; // 分組欄位
  isSubTotal?: boolean; // 是否為小計欄位
  isTotal?: boolean; // 是否為總計欄位
  showSort?: boolean; // 是否顯示排序功能
  sortField?: string; // 排序欄位(預設為 field)
  align?: 'left' | 'center' | 'right';
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
// 000,000,000
export const formatAmount = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString(); // eg. 1,000,000
};
export const formatYN = (value: string): string => {
  return value === 'Y' ? '是' : '否';
};
