import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface ASS17090QueryRequest extends BaseQueryRequest {
  MID?: string | null;
  STO_NO?: string | null;
  QUERY_TYPE?: number | null;
  STOCK_DATE?: string | null;
  WH_ID?: string | null;
  B_CLASS_ID?: string | null;
  M_CLASS_ID?: string | null;
  S_CLASS_ID?: string | null;
  GOODS_ID?: string | null;
}

export interface ASS17090QueryRow {
  RowType?: string | null;
  RowNo?: number | null;
  GoodsID?: string | null;
  GoodsName?: string | null;
  SafeQty?: number | null;
  StocksQty?: number | null;
  ProjectQty?: number | null;
  ExamineQty?: number | null;
  ID?: number | string | null;
  [key: string]: unknown;
}

export interface ASS17090QueryDataWrapper {
  TotalRows?: number;
  TotalPages?: number;
  Details?: ASS17090QueryRow[];
}
