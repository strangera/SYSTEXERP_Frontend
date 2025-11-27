export interface ReportColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  exportFormat?: Record<string, string>[];
  groupField?: string; //
  isSubTotal?: boolean; // 是否為小計欄位
  isTotal?: boolean; // 是否為總計欄位
  showSort?: boolean;
  sortField?: string; // 排序欄位(預設為 field)
  disabled?: (value: any) => boolean;  // 是否禁用 (是否為禁用欄位)
  validate?: ((value: string, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[]; })[]; // 驗證規則(如果是可輸入的欄位)
}

export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}

