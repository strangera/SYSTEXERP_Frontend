import { animate, style, transition, trigger } from '@angular/animations';
import { TableTypes } from '@shared/componentkit/table/table.model';
import { SortMeta } from 'primeng/api';

export interface ReportColumn {
  field: string;
  header: string;
  visible?: boolean;
  width?: string;
  format?: (value: any, index?: number, rowData?: any) => string | number | null;
  exportFormat?: Record<string, string>[];
  groupField?: string;
  isSubTotal?: boolean;
  isTotal?: boolean;
  showSort?: boolean;
  sortField?: string;
  align?: 'left' | 'center' | 'right';
  type?: TableTypes;
  cellClass?: (rowData: any, field?: string) => string;
  link?: boolean;
  linkDisabled?: (rowData: any) => boolean;
}

export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}
export interface AddButton {
  label: string;
  icon?: string;
  action: (rowData: any, event?: Event) => void;
  disabled?: (rowData: any) => boolean;
}
export interface TableQueryPayload {
  data: any;
  mode: 'single' | 'multiple';
  multiSortMeta: SortMeta[];
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
export const formatYYYYMM = (value: string | Date | null): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  if (value instanceof Date) {
    const year = value.getFullYear().toString();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }
  if (typeof value === 'string' && value.length === 6) {
    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    return `${year}/${month}`;
  }
  return '';
};
export const formatAmount = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString();
};
export const formatYN = (value: string): string => {
  return value === 'Y' ? '是' : '否';
};
export const formatAmount2 = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') {
    return '';
  }
  const num = Number(val);
  if (isNaN(num)) {
    return String(val);
  }
  return num.toLocaleString();
};
export function formatAmountWithDecimals(value: any, decimals = 2): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const num = Number(value);
  if (isNaN(num)) {
    return String(value);
  }
  return new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(num);
}
export const formatYYYYMMDD = (value: string | number | null | undefined): string => {
  if (!value) return '';
  const str = String(value).trim();
  if (str.length === 8) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);
    return `${year}/${month}/${day}`;
  }
  return formatDate(str);
};
export const expandAnimation =
  trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-5px)' }))
    ])
  ])
