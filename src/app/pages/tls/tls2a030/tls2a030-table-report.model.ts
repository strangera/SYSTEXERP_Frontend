import { TableTypes } from '@others/component/table/table.model';
import { SortMeta } from 'primeng/api';

export interface ReportColumn {
  field: string;
  header: string;
  visible?: boolean;
  width?: string;
  format?: (value: any, index?: number, rowData?: any) => string | number | null;
  isTotal?: boolean;
  showSort?: boolean;
  sortField?: string;
  align?: 'left' | 'center' | 'right';
  type?: TableTypes;
}

export interface TableQueryPayload {
  data: any;
  mode: 'single' | 'multiple';
  multiSortMeta: SortMeta[];
}
