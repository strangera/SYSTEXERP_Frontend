import { reportType, TableTypes } from '@shared/componentkit/table/table.model';
import { SortMeta } from 'primeng/api';

export interface ReportColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  width?: string;    // 欄位寬度，例如 '80px'、'10rem'
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  exportFormat?: Record<string, string>[]; // transformOptionsForExport(getSYS1000Options('field'))
  groupField?: string; //
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
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
};

// 000,000,000
export const formatAmount = (val: number | string): string => {
  const num = Number(val);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString(); // eg. 1,000,000
};

/**
 * 通用的表格資料與排序酬載 (Payload)
 * 常用於匯出報表或向後端發送排序請求
 */
export interface TableQueryPayload {
  data: any;
  mode: 'single' | 'multiple';
  multiSortMeta: SortMeta[];
}
