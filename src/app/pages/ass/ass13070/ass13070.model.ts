import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** ASS13070 財產保管單位設定／移轉 - 查詢請求 */
export interface ASS13070QueryRequest extends BaseQueryRequest {
  /** 進貨類型（財產類型 1:資產, 2:列管品） */
  DEPRE_YN?: string | null;
  /** 進貨單號 */
  SUBPOENA_ID?: string | null;
  /** 購入日期(起) */
  GET_DATE_S?: string | null;
  /** 購入日期(迄) */
  GET_DATE_E?: string | null;
  /** 大分類 */
  B_CLASS_ID?: string | null;
  /** 中分類 */
  M_CLASS_ID?: string | null;
  /** 小分類 */
  S_CLASS_ID?: string | null;
  /** 財產編號 */
  ASSET_ID?: string | null;
  /** 保管單位 */
  HOLD_ORG_ID?: string | null;
  /** 保管人 */
  HOLD_EMP_ID?: string | null;
  /** 使用單位 */
  USE_ORG_ID?: string | null;
}

/** queryASS13070 回應 Data 包裝（巢狀 Details） */
export interface ASS13070QueryDataWrapper {
  Details?: ASS13070QueryRow[];
  TotalRows?: number;
  TotalPages?: number;
}

/** 查詢結果列 */
export interface ASS13070QueryRow {
  ID?: number;
  DEPRE_YN?: string | null;
  DEPRE_YN_NAME?: string | null;
  SUBPOENA_ID?: string | null;
  ASSET_ID?: string | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  GET_DATE?: string | Date | null;
  FIR_GET_COST?: number | null;
  ORI_ORG_ID?: string | null;
  ORI_ORG_NAME?: string | null;
  ORI_EMP_ID?: string | null;
  ORI_EMP_NAME?: string | null;
  USE_ORG_ID?: string | null;
  USE_ORG_NAME?: string | null;
  USE_EMP_ID?: string | null;
  USE_EMP_NAME?: string | null;
  RowNum?: number;
}

/** 轉移財產請求 */
export interface ASS13070TransferRequest {
  ID_LIST: number[];
  NEW_HOLD_ORG_ID: string;
  NEW_HOLD_EMP_ID: string;
  NEW_USE_ORG_ID: string;
  NEW_USE_EMP_ID: string;
}

/** 轉移財產結果查詢請求 */
export interface ASS13070TransferResultRequest {
  ID_LIST: number[];
}

/** transferResultASS13070 單筆列 */
export interface ASS13070TransferResultRow {
  DEPRE_YN?: string | null;
  SUBPOENA_ID?: string | null;
  ASSET_ID?: string | null;
  GOODS_NAME?: string | null;
  INPUT_DATE?: string | null;
  FIR_GET_COST?: number | null;
  ORI_ORG_NAME?: string | null;
  ORI_USER_NAME?: string | null;
  ORI_USE_ORG_NAME?: string | null;
  ORI_USE_USER_NAME?: string | null;
  HOLDER_ORG_NAME?: string | null;
  HOLDER_USER_NAME?: string | null;
  USE_ORG_NAME?: string | null;
  USE_USER_NAME?: string | null;
}

/** 匯出請求（Excel / PDF） */
export interface ASS13070ExportRequest {
  ID_LIST: number[];
}

/** 查詢頁導向新增頁時攜帶的狀態 */
export interface ASS13070CreateNavigationState {
  rows: ASS13070QueryRow[];
}
