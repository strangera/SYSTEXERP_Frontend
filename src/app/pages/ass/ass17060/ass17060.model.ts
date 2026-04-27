/** queryASS17060 請求 */
export interface QueryASS17060Request {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: Array<{ field: string; order: number }>;
  StartDate: string;
  EndDate: string;
  OrgID?: string;
  BClassID?: string;
  MClassID?: string;
  SClassID?: string;
  GoodsID?: string;
}

/** queryASS17060 明細列 */
export interface QueryASS17060Detail {
  sort_no?: number;
  row_type?: string;
  goods_id?: string;
  goods_name?: string;
  unit_price?: number;
  whmove_id?: string;
  whmove_status_name?: string;
  wh_name?: string;
  qty?: number;
  move_amt?: number;
}

export interface QueryASS17060DataWrapper {
  TotalRows?: number;
  TotalPages?: number;
  Details?: QueryASS17060Detail[];
}

export type QueryASS17060DetailRow = QueryASS17060Detail & { _pk: string };
