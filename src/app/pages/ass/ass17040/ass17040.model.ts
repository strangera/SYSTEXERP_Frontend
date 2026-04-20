/**
 * ASS17040 領用退料統計表 - 資料模型
 */
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** queryASS17040 請求 */
export interface QueryASS17040Request extends BaseQueryRequest {
  /** 統計日期 起 */
  StartDate?: string | null;
  /** 統計日期 迄 */
  EndDate?: string | null;
  /** 部門代號 */
  OrgID?: string | null;
  /** 大分類代碼 */
  BClassID?: string | null;
  /** 中分類代碼 */
  MClassID?: string | null;
  /** 小分類代碼 */
  SClassID?: string | null;
  /** 品項編碼 */
  GoodsID?: string | null;
}

export interface ASS17040DeptInfo {
  Key: string;
  Name: string;
}

export interface ASS17040DeptDetail {
  Qty: number;
  Amt: number;
}

/** API 明細列 */
export interface ASS17040DataRow {
  Seq?: number | null;
  GoodsID?: string | null;
  GoodsName?: string | null;
  GoodsPrice?: number | null;
  Depts?: Record<string, ASS17040DeptDetail> | null;
  TotalQty?: number | null;
  TotalAmt?: number | null;
}

export interface ASS17040Summary {
  Depts?: Record<string, ASS17040DeptDetail> | null;
  TotalQty?: number | null;
  TotalAmt?: number | null;
}

export interface ASS17040QueryData {
  DeptData: ASS17040DeptInfo[];
  Data: ASS17040DataRow[];
  Summary?: ASS17040Summary | null;
}

/** HTTP Data 本體（含分頁） */
export interface QueryASS17040DataPayload {
  QueryData: ASS17040QueryData;
  TotalRows?: number;
  TotalPages?: number;
}

/**
 * 攤平後供報表使用（動態欄位以 dept__{Key}__Qty / dept__{Key}__Amt，Key 會經 sanitize）
 */
export interface ASS17040FlatRow {
  Seq?: number | null;
  GoodsName?: string | null;
  GoodsPrice?: number | null;
  TotalQty?: number | null;
  TotalAmt?: number | null;
  /** 供 table dataKey */
  __rowUid?: string;
  [key: string]: string | number | null | undefined;
}
