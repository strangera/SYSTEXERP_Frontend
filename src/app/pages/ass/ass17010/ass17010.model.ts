import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** queryASS17010 明細列（對齊後端 Details） */
export interface QueryASS17010Detail {
  GoodsID?: string | null;
  GoodsName?: string | null;
  GoodsPrice?: number | null;
  DocNo?: string | null;
  DeptName?: string | null;
  Qty?: string | null;
  Amt?: string | null;
  RowType?: string | null;
  RowTypeName?: string | null;
}

/** queryASS17010 回應 Data 巢狀本體 */
export interface QueryASS17010DataWrapper {
  TotalRows?: number;
  TotalPages?: number;
  Details?: QueryASS17010Detail[] | null;
}

/** queryASS17010 查詢請求 */
export interface QueryASS17010Request extends BaseQueryRequest {
  DisplayType?: string | null;
  StartDate?: string | null;
  EndDate?: string | null;
  OrgID?: string | null;
  BClassID?: string | null;
  MClassID?: string | null;
  SClassID?: string | null;
  GoodsID?: string | null;
}

/** 含明細表格列 + 列鍵 */
export type QueryASS17010TableRow = QueryASS17010Detail & { _pk: string };
