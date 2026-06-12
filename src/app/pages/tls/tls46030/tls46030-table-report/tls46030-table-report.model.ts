import { SortMeta } from 'primeng/api';

export interface ReportColumn {
  field: string;     // 欄位名稱
  header: string;    // 欄位標題
  align?: 'left' | 'center' | 'right';
  format?: (value: any, rowIndex?: number, rowData?: any) => string | number | null; // 格式化工具
}

export interface TableQueryPayload {
  data: any;
  mode: 'single' | 'multiple';
  multiSortMeta: SortMeta[];
}

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  let processedStr = dateStr;
  const yyyymmddRegex = /^(\d{4})(\d{2})(\d{2})$/;
  if (yyyymmddRegex.test(dateStr)) {
    processedStr = dateStr.replace(yyyymmddRegex, '$1-$2-$3');
  }
  const date = new Date(processedStr);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
};

export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};
