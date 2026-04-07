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
}

export interface QueryASS17030Detail {
  RowNo?: number;
  Goods?: string;
  UnitPrice?: number;
  TotalQty?: number;
  TotalAmt?: number;
  OrgDetails?: Record<string, string | number | null | undefined>;
  /** 供 app-table-report dataKey */
  _rowKey?: string;
}
