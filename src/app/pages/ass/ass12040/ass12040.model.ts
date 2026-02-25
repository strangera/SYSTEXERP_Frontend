import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS12040 採購單審核作業 - 資料模型
 */

/**
 * ASS12040 查詢請求參數（對應 15 查詢條件 + 分頁排序）
 */
export interface ASS12040QueryRequest extends BaseQueryRequest {
  /** 採購單號 */
  PurchaseNo?: string | null;
  /** 品項編號 (GOODS_ID) */
  GOODS_ID?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 申請日期(起) */
  APPLY_DATE_S?: string | null;
  /** 申請日期(迄) */
  APPLY_DATE_E?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 稅額(起) */
  TAX_AMT_S?: number | null;
  /** 稅額(迄) */
  TAX_AMT_E?: number | null;
  /** 未稅總金額(起) */
  NO_TAX_AMT_S?: number | null;
  /** 未稅總金額(迄) */
  NO_TAX_AMT_E?: number | null;
  /** 含稅總金額(起) */
  TOTAL_TAX_AMT_S?: number | null;
  /** 含稅總金額(迄) */
  TOTAL_TAX_AMT_E?: number | null;
  /** 採購單狀態 (SUBPOENA_STATUS) */
  SUBPOENA_STATUS?: string | null;
  /** 審核人編號 */
  REVIEW_EMP_ID?: string | null;
  /** 審核日期(起) */
  REVIEW_DATE_S?: string | null;
  /** 審核日期(迄) */
  REVIEW_DATE_E?: string | null;
  /** 結帳日期(起) */
  CHECKOUT_DATE_S?: string | null;
  /** 結帳日期(迄) */
  CHECKOUT_DATE_E?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
}

/**
 * ASS12040 查詢結果一筆資料
 * TODO: 表格欄位名稱尚未確認，待規格確認後更新 field 與 API 回傳對應
 */
export interface ASS12040QueryRow {
  /** 發票/收據號碼 (欄位名待 API 確認) */
  INVOICE_NO?: string;
  /** 驗收單號 */
  RCV_NO?: string;
  /** 發票維護單號 */
  INVOICE_MAINT_NO?: string;
  /** 供應商編號 */
  SUPPLIER_ID?: string;
  /** 請款單據種類 */
  PAYMENT_DOC_TYPE?: string;
  /** 發票格式 */
  INVOICE_FORMAT?: string;
  /** 稅別 */
  TAX_TYPE?: string;
  /** 未稅金額 */
  NO_TAX_AMT?: number;
  /** 稅額 */
  TAX_AMT?: number;
  /** 金額 (含稅) */
  AMOUNT?: number;
  /** 抵抵別 (欄位名待 API 確認) */
  OFFSET_TYPE?: string;
  /** 採購單號等主鍵，供詳細/審核使用 */
  PurchaseNo?: string;
  [key: string]: unknown;
}

/**
 * ASS12040 查詢回應資料包裝器
 */
export interface ASS12040QueryDataWrapper {
  TotalRows?: number;
  TotalPages?: number;
  QueryData?: ASS12040QueryRow[];
}

/**
 * ASS12040 詳細請求參數（以主鍵或單號取得單筆）
 */
export interface ASS12040DetailRequest {
  /** 採購單號或主鍵，待 API 規格確認欄位名 */
  id?: string | number;
  PurchaseNo?: string;
}

/**
 * ASS12040 詳細資料（唯讀表單對應）
 */
export interface ASS12040DetailResponse {
  /** 採購案說明 */
  REMARK?: string;
  /** 採購單號 */
  PurchaseNo?: string;
  /** 採購單狀態 */
  NEEDS_STATUS?: string;
  /** 供應商編號 */
  SUPPLIER_ID?: string;
  /** 申請人編號 */
  EMP_ID?: string;
  /** 部門代號 */
  ORG_ID?: string;
  /** 申請日期 */
  APPLY_DATE?: string | Date;
  /** 未稅總金額 */
  NO_TAX_AMT?: number;
  /** 稅額 */
  TAX_AMT?: number;
  /** 含稅總金額 */
  TOTAL_TAX_AMT?: number;
  /** 品項編號 */
  GOODS_ID?: string;
  /** 品項數量 */
  ITEM_QTY?: number;
  /** 單價(未稅) */
  UNIT_PRICE?: number;
  /** 總金額(未稅) */
  TOTAL_PRICE?: number;
  /** 倉別 */
  WH_ID?: string;
  /** 委託部門 */
  ENTRUST_ORG_ID?: string;
  /** 說明 */
  NOTES?: string;
  [key: string]: unknown;
}

/**
 * ASS12040 審核請求參數
 * TODO: 審核功能 API 參數與回傳規格待後端確認；強制結案/審核確認是否共用或區分參數待規格
 */
export interface ASS12040ApproveRequest {
  /** 採購單號或可識別單筆的 key，待 API 確認 */
  PurchaseNo?: string;
  /** 審核類型：強制結案 / 審核確認，若 API 需區分可帶入 */
  ActionType?: 'FORCE_CLOSE' | 'APPROVE';
  [key: string]: unknown;
}
