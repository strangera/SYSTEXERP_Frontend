export interface ReportColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  groupField?: string; // 第二層群組標頭 (例如：營業額/客單價/坪效)
  topGroupField?: string; // 第一層群組標頭 (例如：比較期/基準期/差異)
  isSubTotal?: boolean; // 是否為小計欄位
  align?: 'left' | 'center' | 'right';
}

export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}

// 000,000,000
export const formatAmount = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString(); // eg. 1,000,000
};

// 交易筆數/客單價/月坪效/月坪貢獻類欄位：千分位、四捨五入到整數位 (eg. 4335615.16 -> "4,335,615")
export const formatInt = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString();
};
