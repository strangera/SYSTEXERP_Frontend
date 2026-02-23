import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS12030 採購申請作業 - 資料模型
 */

// ==================== 查詢 Request ====================

/** 採購申請查詢條件 */
export interface QueryASS12030Request extends BaseQueryRequest {
  OrderBy?: string;
  Offset?: number;
  /** 傳票號碼 */
  SUBPOENA_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 傳票狀態 */
  SUBPOENA_STATUS?: string | null;
  /** 申請日期 起 */
  APPLY_DATE_S?: string | null;
  /** 申請日期 訖 */
  APPLY_DATE_E?: string | null;
  /** 審核人編號 */
  APRV_EMP_ID?: string | null;
  /** 審核日期 起 */
  APRV_DATE_S?: string | null;
  /** 審核日期 訖 */
  APRV_DATE_E?: string | null;
  /** 結帳日 起 */
  PAY_DATE_S?: string | null;
  /** 結帳日 訖 */
  PAY_DATE_E?: string | null;
  /** 稅額 起 */
  TAX_AMT_S?: number | null;
  /** 稅額 訖 */
  TAX_AMT_E?: number | null;
  /** 未稅金額 起 */
  NTAX_AMT_S?: number | null;
  /** 未稅金額 訖 */
  NTAX_AMT_E?: number | null;
  /** 含稅金額 起 */
  AMT_S?: number | null;
  /** 含稅金額 訖 */
  AMT_E?: number | null;
  /** 倉別 */
  WH_ID?: string | null;
}

// ==================== 查詢 Response ====================

/** 查詢回應資料結構（巢狀 Data） */
export interface ASS12030QueryDataWrapper {
  TotalRows: number;
  TotalPages: number;
  QueryData: ASS12030QueryRow[];
}

/** 採購申請查詢結果一筆 */
export interface ASS12030QueryRow {
  FAPurchaseM_ID?: number;
  SUBPOENA_ID?: string | null;
  EMP_ID?: string | null;
  EMP_NAME?: string | null;
  ORG_ID?: string | null;
  ORG_NAME?: string | null;
  SUPPLIER_ID?: string | null;
  SUPPLIER_NAME?: string | null;
  APPLY_DATE?: string | null;
  TAX_AMT?: number | null;
  NTAX_AMT?: number | null;
  AMT?: number | null;
  SUBPOENA_STATUS?: string | null;
  SUBPOENA_STATUS_NAME?: string | null;
  APRV_EMP_ID?: string | null;
  APRV_DATE?: string | null;
  PAY_DATE?: string | null;
}

// ==================== 新增/更新 Request ====================

/** 採購申請明細一筆（新增/更新用） */
export interface ASS12030DetailItem {
  GOODS_ID?: string | null;
  TAX_CODE?: string | null;
  QTY?: number | null;
  GOODS_PRICE?: number | null;
  NOTES?: string | null;
  ORG_ID?: string | null;
  WH_ID?: string | null;
  NEED_ID?: string | null;
  PROD_TYPE?: string | null;
}

/** 採購申請新增 Request */
export interface ASS12030InsertRequest {
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  SUPPLIER_ID: string;
  SUB_PAY_TYPE: string;
  NOTES?: string | null;
  /** 單據類型 (R:套用請購, Q:套用詢價) */
  SUBPOENA_TYPE?: string | null;
  Details: ASS12030DetailItem[];
}

/** 新增回應 */
export interface ASS12030InsertResult {
  FAPurchaseM_ID: number;
  NEW_SUBPOENA_ID: string;
}

/** 採購申請更新 Request */
export interface ASS12030UpdateRequest {
  SUBPOENA_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  SUPPLIER_ID: string;
  SUB_PAY_TYPE: string;
  NOTES?: string | null;
  Details: ASS12030DetailItem[];
}

/** 更新/刪除回應 */
export interface ASS12030UpdateResult {
  UpdatedRows: number;
}

/** 作廢回應 */
export interface ASS12030VoidResult {
  VoidedRows: number;
}

// ==================== 明細 (取得單筆) ====================

/** 明細回應 - 明細列 */
export interface ASS12030DetailResponseItem {
  LINE_NUM?: number;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  TAX_CODE?: string | null;
  TAX_CODE_NAME?: string | null;
  QTY?: number | null;
  GOODS_PRICE?: number | null;
  GOODS_UNIT?: string | null;
  OLD_GOODS_PRICE?: number | null;
  NTAX_AMT?: number | null;
  TAX_AMT?: number | null;
  AMT?: number | null;
  ORG_ID?: string | null;
  ORG_NAME?: string | null;
  WH_ID?: string | null;
  NEED_ID?: string | null;
  NOTES?: string | null;
  PROD_TYPE?: string | null;
  PROD_TYPE_NAME?: string | null;
}

/** 採購申請主檔+明細 (編輯/明細頁載入用) */
export interface ASS12030Detail {
  FAPurchaseM_ID?: number;
  SUBPOENA_ID?: string | null;
  SUBPOENA_STATUS?: string | null;
  EMP_ID?: string | null;
  EMP_NAME?: string | null;
  ORG_ID?: string | null;
  ORG_NAME?: string | null;
  APPLY_DATE?: string | null;
  SUPPLIER_ID?: string | null;
  SUPPLIER_NAME?: string | null;
  SUB_PAY_TYPE?: string | null;
  SUB_PAY_TYPE_NAME?: string | null;
  NOTES?: string | null;
  NTAX_AMT?: number | null;
  TAX_AMT?: number | null;
  AMT?: number | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  Details?: ASS12030DetailResponseItem[];
}

// ==================== 刪除/作廢/匯出 Request ====================

/** 刪除/作廢/匯出PDF 共用 Request */
export interface ASS12030SubpoenaRequest {
  SUBPOENA_ID: string;
}

