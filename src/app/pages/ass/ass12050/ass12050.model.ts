import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS12050 採購單驗收作業 - 資料模型
 */

// ==================== 查詢 Request ====================

/** 採購單驗收查詢條件 */
export interface QueryASS12050Request extends BaseQueryRequest {
  /** 採購單號 */
  SUBPOENA_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  M_ORG_ID?: string | null;
  /** 申請日期 起 */
  APPLY_DATE_S?: string | null;
  /** 申請日期 訖 */
  APPLY_DATE_E?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 稅額 起 */
  M_TAX_AMT_S?: number | null;
  /** 稅額 訖 */
  M_TAX_AMT_E?: number | null;
  /** 未稅總金額 起 */
  M_NTAX_AMT_S?: number | null;
  /** 未稅總金額 訖 */
  M_NTAX_AMT_E?: number | null;
  /** 含稅總金額 起 */
  M_AMT_S?: number | null;
  /** 含稅總金額 訖 */
  M_AMT_E?: number | null;
  /** 採購單狀態 */
  NEEDS_STATUS?: string | null;
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
  /** 驗收人 */
  APPLY_USER_ID?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
}

// ==================== 查詢 Response ====================

/** 查詢回應資料結構（巢狀 Data） */
export interface ASS12050QueryDataWrapper {
  TotalRows: number;
  TotalPages: number;
  QueryData: ASS12050QueryRow[];
}

/** 採購單驗收查詢結果一筆 */
export interface ASS12050QueryRow {
  FARcvM_ID?: number;
  /** 採購單號 */
  SUBPOENA_ID?: string | null;
  /** 驗收單號 */
  SUBCHECK_ID?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 申請人名稱 */
  EMP_NAME?: string | null;
  /** 驗收人 */
  APPLY_USER_ID?: string | null;
  /** 驗收人名稱 */
  APPLY_USER_NAME?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 部門名稱 */
  ORG_NAME?: string | null;
  /** 申請日期 */
  APPLY_DATE?: string | null;
  /** 稅額 */
  M_TAX_AMT?: number | null;
  /** 含稅總金額 */
  M_AMT?: number | null;
  /** 採購單狀態 */
  NEEDS_STATUS?: string | null;
  /** 採購單狀態名稱 */
  NEEDS_STATUS_NAME?: string | null;
  /** 驗收單狀態 */
  CHECK_STATUS?: string | null;
  /** 驗收單狀態名稱 */
  CHECK_STATUS_NAME?: string | null;
  /** 審核人代碼 */
  APRV_EMP_ID?: string | null;
  /** 審核日期 */
  APRV_DATE?: string | null;
  /** 驗收日期 */
  CHECK_DATE?: string | null;
  /** 明細筆數 */
  DETAIL_CNT?: number | null;
}

// ==================== 新增 Request ====================

/** 採購單驗收新增 Request */
export interface ASS12050InsertRequest {
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  SUPPLIER_ID: string;
  NOTES?: string | null;
  /** 來源採購單號（轉入時帶入） */
  SUBPOENA_ID?: string | null;
  Details: ASS12050DetailItem[];
}

/** 新增回應 */
export interface ASS12050InsertResult {
  FARcvM_ID: number;
  NEW_SUBCHECK_ID: string;
}

// ==================== 更新 Request ====================

/** 採購單驗收更新 Request */
export interface ASS12050UpdateRequest {
  SUBCHECK_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  SUPPLIER_ID: string;
  NOTES?: string | null;
  Details: ASS12050DetailItem[];
}

/** 更新回應 */
export interface ASS12050UpdateResult {
  UpdatedRows: number;
}

// ==================== 明細項目 ====================

/** 驗收明細一筆（新增/更新用） */
export interface ASS12050DetailItem {
  /** 品項代號 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 單位 */
  GOODS_UNIT?: string | null;
  /** 申請數量 */
  APPLY_QTY?: number | null;
  /** 已驗數量 */
  CHECKED_QTY?: number | null;
  /** 驗收數量 */
  CHECK_QTY?: number | null;
  /** 單價(未稅) */
  GOODS_PRICE?: number | null;
  /** 調整單價(未稅) */
  ADJ_PRICE?: number | null;
  /** 總金額 */
  TOTAL_AMT?: number | null;
  /** 分店 */
  BRANCH_ID?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
  /** 委託部門代號 */
  ENTRUST_ORG_ID?: string | null;
  /** 委託部門名稱 */
  ENTRUST_ORG_NAME?: string | null;
  /** 說明 */
  NOTES?: string | null;
}

// ==================== 明細 (取得單筆) ====================

/** 採購單驗收主檔+明細 (編輯頁載入用) */
export interface ASS12050Detail {
  FARcvM_ID?: number;
  /** 驗收單號 */
  SUBCHECK_ID?: string | null;
  /** 驗收單狀態 */
  CHECK_STATUS?: string | null;
  /** 驗收單狀態名稱 */
  CHECK_STATUS_NAME?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 申請人名稱 */
  EMP_NAME?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 部門名稱 */
  ORG_NAME?: string | null;
  /** 申請日期 */
  APPLY_DATE?: string | null;
  /** 供應商代號 */
  SUPPLIER_ID?: string | null;
  /** 供應商名稱 */
  SUPPLIER_NAME?: string | null;
  /** 未稅總金額 */
  M_NTAX_AMT?: number | null;
  /** 稅額 */
  M_TAX_AMT?: number | null;
  /** 含稅總金額 */
  M_AMT?: number | null;
  /** 調整總金額 */
  ADJ_AMT?: number | null;
  /** 來源採購單號 */
  SUBPOENA_ID?: string | null;
  /** 說明 */
  NOTES?: string | null;
  /** 明細列 */
  Details?: ASS12050DetailItem[];
}

// ==================== 驗收確認 ====================

/** 驗收確認 Request */
export interface ASS12050ConfirmRequest {
  SUBCHECK_ID: string;
}

/** 驗收確認回應 */
export interface ASS12050ConfirmResult {
  ConfirmedRows: number;
}

// ==================== 強制結案 ====================

/** 強制結案 Request */
export interface ASS12050ForceCloseRequest {
  SUBCHECK_ID: string;
}

/** 強制結案回應 */
export interface ASS12050ForceCloseResult {
  ClosedRows: number;
}

// ==================== 作廢 ====================

/** 作廢 Request */
export interface ASS12050VoidRequest {
  SUBCHECK_ID: string;
}

/** 作廢回應 */
export interface ASS12050VoidResult {
  VoidedRows: number;
}

// ==================== 共用 Request ====================

/** 以驗收單號識別的共用 Request */
export interface ASS12050SubcheckRequest {
  SUBCHECK_ID: string;
}

// ==================== 轉入採購單 ====================

/** 轉入採購單清單查詢 Request */
export interface ASS12050ListForTransferRequest extends BaseQueryRequest {
  SUBPOENA_ID?: string | null;
}

/** 轉入採購單清單一筆 */
export interface ASS12050TransferRow {
  /** 採購單號 */
  SUBPOENA_ID?: string | null;
  /** 申請人代號 */
  EMP_ID?: string | null;
  /** 申請人名稱 */
  EMP_NAME?: string | null;
  /** 部門名稱 */
  ORG_NAME?: string | null;
  /** 申請日期 */
  APPLY_DATE?: string | null;
  /** 供應商代號 */
  SUPPLIER_ID?: string | null;
  /** 供應商名稱 */
  SUPPLIER_NAME?: string | null;
  /** 稅額 */
  TAX_AMT?: number | null;
  /** 含稅總金額 */
  AMT?: number | null;
  /** 採購單狀態 */
  NEEDS_STATUS?: string | null;
  /** 採購單狀態名稱 */
  NEEDS_STATUS_NAME?: string | null;
  /** 審核人代碼 */
  APRV_EMP_ID?: string | null;
  /** 審核人名稱 */
  APRV_EMP_NAME?: string | null;
  /** 審核日期 */
  APRV_DATE?: string | null;
  /** 明細數量 */
  DETAIL_CNT?: number | null;
}

/** 轉入採購單清單回應包裝器 */
export interface ASS12050TransferDataWrapper {
  TotalRows: number;
  TotalPages: number;
  QueryData: ASS12050TransferRow[];
}
