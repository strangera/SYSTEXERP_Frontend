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

/** queryASS17090 明細列（D）或小計列（S），表格僅顯示 D */
export interface QueryASS17090Detail {
  RowType?: string | null;
  RowNo?: number | null;
  GoodsID?: string | null;
  GoodsName?: string | null;
  SafeQty?: number | null;
  StocksQty?: number | null;
  ProjectQty?: number | null;
  ExamineQty?: number | null;
}

/** queryASS17090 的 Data 本體 */
export interface QueryASS17090Response {
  SafeQty?: number | null;
  StocksQty?: number | null;
  ProjectQty?: number | null;
  ExamineQty?: number | null;
  Details?: QueryASS17090Detail[] | null;
  TotalRows?: number | null;
  TotalPages?: number | null;
}

/** 表格列：明細 + 前端合成 ID（供 dataKey / 虛擬滾動） */
export type ASS17090QueryRow = QueryASS17090Detail & {
  ID?: number | string | null;
};
