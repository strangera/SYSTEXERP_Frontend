import { SortMeta } from 'primeng/api';

export interface QueryASS17070Request {
  PageSize: number;
  PageIndex: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: SortMeta[];
  StartDate: string;
  EndDate: string;
  OrgID?: string;
  BClassID?: string;
  MClassID?: string;
  SClassID?: string;
  GoodsID?: string;
}

export interface QueryASS17070Detail {
  RowType?: string;
  GoodsID?: string;
  GoodsName?: string;
  UnitPrice?: number;
  DamageNo?: string;
  WHName?: string;
  Qty?: number;
  Amt?: number;
}

export interface QueryASS17070DataWrapper {
  TotalRows?: number;
  TotalPages?: number;
  Details?: QueryASS17070Detail[];
}

