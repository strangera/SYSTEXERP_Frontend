import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS12040 採購單審核作業 - 資料模型
 */

/**
 * ASS12040 查詢請求參數（對應 15 查詢條件 + 分頁排序）
 */
export interface ASS12040QueryRequest extends ApiRequest {
  /** 採購單號 */
  SUBPOENA_ID?: string | null;
  /** 品項編號 (GOODS_ID) */
  GOODS_ID?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 申請日期(起) */
  APPLY_DATE_FROM?: string | null;
  /** 申請日期(迄) */
  APPLY_DATE_TO?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 稅額(起) */
  TAX_AMT_FROM?: number | null;
  /** 稅額(迄) */
  TAX_AMT_TO?: number | null;
  /** 未稅總金額(起) */
  NTAX_AMT_FROM?: number | null;
  /** 未稅總金額(迄) */
  NTAX_AMT_TO?: number | null;
  /** 含稅總金額(起) */
  AMT_FROM?: number | null;
  /** 含稅總金額(迄) */
  AMT_TO?: number | null;
  /** 採購單狀態 (SUBPOENA_STATUS) */
  SUBPOENA_STATUS?: string | null;
  /** 審核人編號 */
  APRV_EMP_ID?: string | null;
  /** 審核日期(起) */
  APRV_DATE_FROM?: string | null;
  /** 審核日期(迄) */
  APRV_DATE_TO?: string | null;
  /** 結帳日期(起) */
  PAY_DATE_FROM?: string | null;
  /** 結帳日期(迄) */
  PAY_DATE_TO?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
}

/**
 * ASS12040 查詢結果一筆資料（含明細欄位，對應 queryASS12040 回傳）
 */
export interface ASS12040QueryRow {
  /** 總筆數(分頁用) */
  TotalRows?: number;
  /** 採購單號 */
  SUBPOENA_ID?: string;
  /** 申請人編號 */
  EMP_ID?: string;
  /** 部門代號 */
  ORG_ID?: string;
  /** 申請日期 */
  APPLY_DATE?: string;
  /** 供應商編號 */
  SUPPLIER_ID?: string;
  /** 稅額 */
  TAX_AMT?: number;
  /** 含稅總金額 */
  AMT?: number;
  /** 品項編號(明細) */
  GOODS_ID?: string;
  /** 品項數量(明細) */
  QTY?: number;
  /** 單價(未稅)(明細) */
  GOODS_PRICE?: string;
  /** 總金額(未稅)(明細) */
  D_NTAX_AMT?: number;
  /** 倉別(明細) */
  WH_ID?: string;
  /** 委託部門(明細) */
  D_ORG_ID?: string;
  /** 採購單狀態 */
  SUBPOENA_STATUS?: string;
  /** 審核人編號 */
  APRV_EMP_ID?: string;
  /** 審核日期 */
  APRV_DATE?: string;
  /** 明細筆數 */
  DetailCnt?: number;
  /** 採購單主檔ID(點入明細用Key) */
  FAPurchaseM_ID?: number;
  /** 採購案說明 */
  NOTES?: string;
  /** 未稅總金額(明細頁表頭用) */
  NTAX_AMT?: number;
  /** 結帳日期(明細頁表頭用) */
  PAY_DATE?: string;
  [key: string]: unknown;
}

/**
 * ASS12040 查詢回應資料包裝器
 */
export interface ASS12040QueryDataWrapper {
  Details?: ASS12040QueryRow[];
  TotalRows?: number;
  TotalPages?: number;
}

/**
 * ASS12040 審核請求參數
 * TODO: 審核功能 API 參數與回傳規格待後端確認；強制結案/審核確認是否共用或區分參數待規格
 */
export interface ASS12040ApproveRequest {
  /** 採購單號 */
  SUBPOENA_ID: string;
  [key: string]: unknown;
}
