import { SortMeta } from 'primeng/api';

/** queryASS17030 請求 */
export interface QueryASS17030Request {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: SortMeta[];
  StartDate?: string;
  EndDate?: string;
  OrgID?: string;
  BClassID?: string;
  MClassID?: string;
  SClassID?: string;
  GoodsID?: string;
}

export interface QueryASS17030DataWrapper {
  TotalRows?: number;
  TotalPages?: number;
  Details?: QueryASS17030Detail[];
  QueryData?: QueryASS17030QueryData;
}

export interface QueryASS17030DeptInfo {
  Key?: string;
  Name?: string;
}

export interface QueryASS17030DeptValue {
  Qty?: number;
  Amt?: number;
}

export interface QueryASS17030Detail {
  RowNo?: number;
  Goods?: string;
  UnitPrice?: number;
  Depts?: Record<string, QueryASS17030DeptValue | undefined>;
  TotalQty?: number;
  TotalAmt?: number;
  /** 供 app-table-report dataKey */
  _rowKey?: string;
  [key: string]: unknown;
}

export interface QueryASS17030Summary {
  Depts?: Record<string, QueryASS17030DeptValue | undefined>;
  TotalQty?: number;
  TotalAmt?: number;
}

export interface QueryASS17030QueryData {
  DeptData?: QueryASS17030DeptInfo[];
  Data?: QueryASS17030Detail[];
  Summary?: QueryASS17030Summary;
}

export interface QueryASS17030QueryResult {
  rows: QueryASS17030Detail[];
  deptData: QueryASS17030DeptInfo[];
  summary?: QueryASS17030Summary;
  totalRows: number;
}
