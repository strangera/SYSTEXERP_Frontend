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

/** 單筆明細 */
export interface QueryASS17040Detail {
  Seq?: number | null;
  GoodsID?: string | null;
  GoodsName?: string | null;
  GoodsPrice?: number | null;
  TotalQty?: number | null;
  TotalAmt?: number | null;
  RowType?: string | null;
  /** 部門編號_數量和金額（動態欄位） */
  OrgDetails?: Record<string, string> | null;
  /** 前端列鍵 */
  rowKey?: string;
}

/** API Data 包裝 */
export interface QueryASS17040DataWrapper {
  TotalRows?: number;
  TotalPages?: number;
  Details?: QueryASS17040Detail[] | null;
}
