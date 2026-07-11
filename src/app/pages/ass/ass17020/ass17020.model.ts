import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS17020 領用統計表
 */
/** 查詢 request（欄位名與後端 Swagger 一致） */
export interface QueryASS17020Request extends ApiRequest {
  StartDate?: string | null;
  EndDate?: string | null;
  OrgID?: string | null;
  BClassID?: string | null;
  MClassID?: string | null;
  SClassID?: string | null;
  GoodsID?: string | null;
}

export interface ASS17020DeptInfo {
  Key: string;
  Name: string;
}

export interface ASS17020DeptDetail {
  Qty: number;
  Amt: number;
}

/** API 明細列 */
export interface ASS17020DataRow {
  RowNo: number;
  Goods: string;
  UnitPrice: number;
  Depts: Record<string, ASS17020DeptDetail>;
  TotalQty: number;
  TotalAmt: number;
}

export interface ASS17020Summary {
  Depts: Record<string, ASS17020DeptDetail>;
  TotalQty: number;
  TotalAmt: number;
}

export interface ASS17020QueryData {
  DeptData: ASS17020DeptInfo[];
  Data: ASS17020DataRow[];
  Summary: ASS17020Summary;
}

/** HTTP Data 本體（含分頁） */
export interface ASS17020DataPayload {
  QueryData: ASS17020QueryData;
  TotalRows: number;
  TotalPages: number;
}

/** 攤平後供 app-table-report 使用（動態欄位以 dept__{Key}__Qty / dept__{Key}__Amt） */
export interface ASS17020FlatRow {
  RowNo: number;
  Goods: string;
  UnitPrice: number;
  TotalQty: number;
  TotalAmt: number;
  /** 供 table dataKey 用，避免跨頁重複 RowNo */
  __rowUid?: string;
  [key: string]: string | number | undefined | null;
}
