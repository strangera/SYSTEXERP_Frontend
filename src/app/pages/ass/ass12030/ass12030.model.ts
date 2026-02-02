import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS12030 採購申請作業 - 資料模型
 */

// ==================== 查詢 Request ====================

/** 採購申請查詢條件 */
export interface QueryASS12030Request extends BaseQueryRequest {
  /** 採購單號 */
  PO_NO?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 申請日期 起 */
  APPLY_DATE_FROM?: string | null;
  /** 申請日期 訖 */
  APPLY_DATE_TO?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 稅額 起 */
  TAX_AMT_FROM?: number | null;
  /** 稅額 訖 */
  TAX_AMT_TO?: number | null;
  /** 未稅總金額 起 */
  NO_TAX_AMT_FROM?: number | null;
  /** 未稅總金額 訖 */
  NO_TAX_AMT_TO?: number | null;
  /** 含稅總金額 起 */
  TOTAL_TAX_AMT_FROM?: number | null;
  /** 含稅總金額 訖 */
  TOTAL_TAX_AMT_TO?: number | null;
  /** 採購單狀態 */
  PO_STATUS?: string | null;
  /** 審核人編號 */
  REVIEWER_ID?: string | null;
  /** 審核日期 起 */
  REVIEW_DATE_FROM?: string | null;
  /** 審核日期 訖 */
  REVIEW_DATE_TO?: string | null;
  /** 結帳日 起 */
  CHECKOUT_DATE_FROM?: string | null;
  /** 結帳日 訖 */
  CHECKOUT_DATE_TO?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
}

// ==================== 查詢結果列 ====================

/** 採購申請查詢結果一筆 */
export interface ASS12030QueryRow {
  /** 主鍵 (供編輯/作廢/刪除/報表用) */
  id?: number | string;
  /** 採購單號 */
  PO_NO?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 申請日期 */
  APPLY_DATE?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 稅額 */
  TAX_AMT?: number | null;
  /** 未稅總金額 */
  NO_TAX_AMT?: number | null;
  /** 含稅總金額 */
  TOTAL_TAX_AMT?: number | null;
  /** 採購單狀態 */
  PO_STATUS?: string | null;
  /** 審核人編號 */
  REVIEWER_ID?: string | null;
  /** 審核日期 */
  REVIEW_DATE?: string | null;
  /** 結帳日期 */
  CHECKOUT_DATE?: string | null;
  /** 說明 */
  NOTES?: string | null;
}

// ==================== 新增/更新 Request ====================

/** 採購申請明細一筆 */
export interface ASS12030DetailItem {
  GOODS_ID?: string | null;
  NEED_ID?: string | null;
  TAX_TYPE?: string | null;
  QTY?: number | null;
  UNIT_PRICE?: number | null;
  ORG_ID?: string | null;
  WH_ID?: string | null;
  GOODS_TYPE?: string | null;
  NOTES?: string | null;
}

/** 採購申請新增 Request */
export interface ASS12030InsertRequest {
  NOTES?: string | null;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  SUPPLIER_ID: string;
  EXPEND_TYPE: string;
  Details: ASS12030DetailItem[];
}

/** 採購申請更新 Request */
export interface ASS12030UpdateRequest extends ASS12030InsertRequest {
  id: number | string;
}

// ==================== 編輯用 (取得單筆) ====================

/** 採購申請主檔+明細 (編輯頁載入用) */
export interface ASS12030Detail {
  id?: number | string;
  NOTES?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  APPLY_DATE?: string | null;
  SUPPLIER_ID?: string | null;
  EXPEND_TYPE?: string | null;
  Details?: ASS12030DetailItem[];
}

// ==================== 套用請購清單 (取得詢價清單) ====================

/** 詢價清單一筆 (套用請購清單視窗用) */
export interface ApplyQuotedListRow {
  id?: string | null;
  BATCH_NO?: string | null;
  SUPPLIER_ID?: string | null;
  LOG_DATE?: string | null;
  ROW_COUNT?: number | null;
}

// ==================== 套用詢價清單 (取得請購清單) ====================

/** 請購清單一筆 (套用詢價清單視窗用) */
export interface ApplyPurchaseListRow {
  NEED_ID?: string | null;
  APPLICANT?: string | null;
  DEPT?: string | null;
  REQ_DATE?: string | null;
  ROW_COUNT?: number | null;
}
