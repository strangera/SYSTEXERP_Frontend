import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS12020 詢價登錄作業 - 資料模型
 */

// ==================== 查詢 ====================

/** 詢價登錄查詢條件 (對齊 API) */
export interface QueryASS12020Request extends BaseQueryRequest {
  GOODS_ID?: string | null;
  GOODS_PRICE_S?: number | null;
  GOODS_PRICE_E?: number | null;
  SALE_PRICE_S?: number | null;
  SALE_PRICE_E?: number | null;
  GOODS_UNIT?: string | null;
  SUPPLIER_ID?: string | null;
  EXPDATE_S?: string | null;
  EXPDATE_E?: string | null;
  BATCH_ID?: string | null;
  OrderBy?: string | null;
  Offset?: number | null;
  PageNo?: number | null;
  SortDir?: string | null;
}

/** 詢價登錄查詢結果一筆 */
export interface ASS12020QueryRow {
  FAQuotationM_ID?: number;
  BATCH_ID?: string | null;
  SUPPLIER_ID?: string | null;
  VENDOR_NAME?: string | null;
  CRT_Date?: string | null;
  EXPDATE?: string | null;
  NOTES?: string | null;
}

/** 查詢 API 回傳 Data 巢狀結構 */
export interface ASS12020QueryDataWrapper {
  TotalRows: number;
  TotalPages: number;
  QueryData: ASS12020QueryRow[];
}

// ==================== 新增/更新 ====================

/** 詢價登錄明細一筆 */
export interface ASS12020DetailItem {
  ID?: number | null;
  FAQuotationD_ID?: number | null;
  NEED_ID?: string | null;
  GOODS_ID?: string | null;
  MATERIAL_TYPE?: string | null;
  GOODS_PRICE?: number | null;
  SALE_PRICE?: number | null;
  WH_ID?: string | null;
  QTY?: number | null;
  PURCHASE_QTY?: number | null;
  GOODS_UNIT?: string | null;
  TOTAL_AMT?: number | null;
  NOTES?: string | null;
  EXPIRE_LIMIT?: number | null;
}

/** 詢價登錄新增 Request */
export interface ASS12020InsertRequest {
  SUPPLIER_ID: string;
  EXPDATE: string;
  NOTES?: string | null;
  Details: ASS12020DetailItem[];
}

/** 詢價登錄更新 Request */
export interface ASS12020UpdateRequest extends ASS12020InsertRequest {
  FAQuotationM_ID: number;
}

// ==================== 刪除 ====================

export interface ASS12020DeleteRequest {
  FAQuotationM_ID: number;
}

// ==================== 詳細 ====================

export interface ASS12020DetailRequest {
  FAQuotationM_ID: number;
}

/** 詳細 API 回傳之明細一筆 */
export interface ASS12020DetailResponseItem {
  ID?: number;
  FAQuotationD_ID?: number;
  NEED_ID?: string | null;
  GOODS_ID?: string | null;
  MATERIAL_TYPE?: string | null;
  GOODS_PRICE?: number | null;
  SALE_PRICE?: number | null;
  WH_ID?: string | null;
  QTY?: number;
  PURCHASE_QTY?: number | null;
  GOODS_UNIT?: string | null;
  TOTAL_AMT?: number | null;
  NOTES?: string | null;
  EXPIRE_LIMIT?: number | null;
}

/** 詳細 API 回傳之 Data */
export interface ASS12020DetailResponseData {
  FAPurchaseM_ID?: number;
  SUPPLIER_ID?: string | null;
  VENDOR_NAME?: string | null;
  NOTES?: string | null;
  EXPDATE?: string | null;
  Details?: ASS12020DetailResponseItem[];
}

export interface ASS12020DetailResponse {
  Data?: ASS12020DetailResponseData;
}

/** 詢價登錄主檔+明細 (編輯頁表單/明細綁定用，由 DetailResponse 對應而來) */
export interface ASS12020Detail {
  id?: number;
  FAQuotationM_ID?: number;
  SUPPLIER_ID?: string | null;
  EXPDATE?: string | null;
  NOTES?: string | null;
  Details?: ASS12020DetailItem[];
}

// ==================== 匯出 PDF ====================

export interface ASS12020ExportPDFRequest {
  FAQuotationM_ID: number;
}

// ==================== 套用請購申請單 (API 未提供前保留) ====================

/** 請購申請單清單一筆 (套用視窗表格用) */
export interface ApplyPurchaseRequestRow {
  NEED_ID?: string | null;
  APPLICANT?: string | null;
  DEPT?: string | null;
  REQ_DATE?: string | null;
  ROW_COUNT?: number | null;
}
