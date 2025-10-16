export interface ReportColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  align?: 'left' | 'center' | 'right';
  rowgroup?: boolean; // 是否啟用群組列
}
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};
// 000,000,000
export const formatAmount = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString(); // eg. 1,000,000
};

// 000,000,000 如果是0就不顯示
export const formatAmountNo0 = (val: number | string | null | undefined): string => {
  // 1. 檢查並處理 null, undefined 或空字串
  // 如果是這些值，直接回傳空字串 ''
  if (val === null || val === undefined || val === '') {
    return '';
  }

  const num = Number(val);

  // 2. 檢查 NaN (如輸入 'abc') 或數值為 0
  // 如果是 NaN 或 num 等於 0 (符合您「不要給我自動有0」的需求)
  if (isNaN(num) || num === 0) {
    return '';
  }

  // 3. 格式化其他大於 0 的數值
  return num.toLocaleString(); // e.g. 1,000,000
};
