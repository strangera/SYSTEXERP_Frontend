import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
// ==================== Request 介面 ====================

/** 移轉交接表查詢 */
export interface QueryASS13050Request extends ApiRequest {
  /** 移轉日期 */
  TRANSFER_DATE?: string | null;
  /** 新保管單位 */
  NEW_HOLD_ORG_ID?: string | null;
  /** 新保管人 */
  NEW_HOLD_EMP_ID?: string | null;
  /** 新使用單位 */
  NEW_USE_ORG_ID?: string | null;
  /** 新使用人 */
  NEW_USE_EMP_ID?: string | null;
  /** 進貨類型 */
  DEPRE_YN?: string | null;
  /** 大分類編號 */
  B_CLASS_ID?: string | null;
  /** 中分類編號 */
  M_CLASS_ID?: string | null;
  /** 小分類編號 */
  S_CLASS_ID?: string | null;
  /** 財產編號 */
  ASSET_ID?: string | null;
  /** 保管單位 */
  HOLD_ORG_ID?: string | null;
  /** 保管人 */
  HOLD_EMP_ID?: string | null;
  /** 使用單位 */
  USE_ORG_ID?: string | null;
  /** 使用人 */
  USE_EMP_ID?: string | null;
}

/** 下載報表請求（多帶標題欄位） */
export interface DownloadASS13050Request extends QueryASS13050Request {
  /** 標題（1: 交接, 2: 移轉） */
  HEADLINE?: string | null;
}

// ==================== Response 介面 ====================

/** 查詢回應資料結構 */
export interface ASS13050QueryDataWrapper {
  TotalRows: number;
  TotalPages: number;
  QueryData: ASS13050QueryRow[];
}

/** 移轉交接表查詢結果列 */
export interface ASS13050QueryRow {
  /** 財產編號 */
  ASSET_ID?: string | null;
  /** 品項 */
  ITEM_NAME?: string | null;
  /** 數量 */
  QTY?: number | null;
  /** 單位 */
  UNIT?: string | null;
  /** 確定交接 */
  CONFIRM_TRANSFER?: string | null;
  /** 原保管單位 */
  HOLD_ORG_NAME?: string | null;
  /** 原保管人 */
  HOLD_EMP_NAME?: string | null;
  /** 原使用單位 */
  USE_ORG_NAME?: string | null;
  /** 原使用者 */
  USE_EMP_NAME?: string | null;
  /** 新保管單位 */
  NEW_HOLD_ORG_NAME?: string | null;
  /** 新保管人 */
  NEW_HOLD_EMP_NAME?: string | null;
  /** 新使用單位 */
  NEW_USE_ORG_NAME?: string | null;
  /** 新使用者 */
  NEW_USE_EMP_NAME?: string | null;
  /** 資產狀態 */
  ASSET_STATUS?: string | null;
  /** 原始取得金額 */
  ORIGINAL_AMOUNT?: number | null;
  /** 備註 */
  REMARK?: string | null;
}
