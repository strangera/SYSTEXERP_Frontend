import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS13080 資產變賣作業 - 資料模型
 * 注意：API 詳細規格尚未確定，以下以「可先接線」為優先，後續依後端欄位調整。
 */

// ==================== 查詢 ====================

export interface QueryASS13080Request extends BaseQueryRequest {
  /** 變賣單號 */
  SOLD_NO?: string | null;
  /** 資產代號 */
  ASSET_NO?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 購入日期(起)(迄) yyyy-MM-dd */
  BUY_DATE_S?: string | null;
  BUY_DATE_E?: string | null;
  /** 資產狀態（SYS1000: ASSET_STATUS） */
  ASSET_STATUS?: string | null;
  /** 攤提代號 */
  ACP_NO?: string | null;
  /** 保管單位（SYS3100） */
  KEEP_ORG_ID?: string | null;
  /** 保管人（TBLUSER） */
  KEEP_USER_NO?: string | null;
  /** 使用單位（SYS3100） */
  USE_ORG_ID?: string | null;
  /** 使用人（TBLUSER） */
  USE_USER_NO?: string | null;
  /** 會計科目（GLS1005） */
  ACC_NO?: string | null;
  /** 購入金額(起)(迄) */
  BUY_AMT_S?: number | null;
  BUY_AMT_E?: number | null;
  /** 驗收單號 */
  RCV_NO?: string | null;
  /** 入帳日期(起)(迄) yyyy-MM-dd */
  TXN_DATE_S?: string | null;
  TXN_DATE_E?: string | null;
}

export interface ASS13080QueryRow {
  /** 資產代號 */
  ASSET_NO?: string;
  /** 品項編號 */
  GOODS_ID?: string;
  /** 入帳日期 */
  TXN_DATE?: string;
  /** 資產狀態 */
  ASSET_STATUS_NAME?: string;
  /** 保管人 */
  KEEP_USER_NAME?: string;
  /** 使用人 */
  USE_USER_NAME?: string;
  /** 購入金額 */
  BUY_AMT?: number;
  /** 重估金額 */
  REVAL_AMT?: number;
  /** 攤提代號 */
  ACP_NO?: string;
  /** 變賣資產日期 */
  SOLD_ASSET_DATE?: string;
  /** 變賣金額(未稅) */
  SOLD_NTAX_AMT?: number;
  /** 變賣日期已提折舊 */
  SOLD_DATE_DEPR_AMT?: number;
  /** 變賣日前之帳面價值 */
  SOLD_BEFORE_BOOK_AMT?: number;
  /** 變賣盈虧(未稅) */
  SOLD_PL_NTAX_AMT?: number;

  /** 變賣單號（供 dataKey / 導頁用，若後端有回傳） */
  SOLD_NO?: string;
}

/** 查詢回應資料結構（若後端巢狀 Data） */
export interface ASS13080QueryDataWrapper {
  QueryData?: ASS13080QueryRow[];
  TotalRows?: number;
  TotalPages?: number;
}

// ==================== 新增 / 編輯頁（變賣） ====================

export interface ASS13080Detail {
  SOLD_NO?: string | null;
  ASSET_NO?: string | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  ASSET_STATUS?: string | null;
  ASSET_STATUS_NAME?: string | null;
  /** DEPRE_YN 1:資產 2:列管品 */
  DEPRE_YN?: string | null;
  ACP_NO?: string | null;
  PO_NO?: string | null;
  BUY_DATE?: string | null;
  BUY_AMT?: number | null;
  CHG_AMT?: number | null;
  VENDOR_NO?: string | null;
  DEVICE_NO?: string | null;
  ACC_NO_DR?: string | null;
  ACC_NO_CR?: string | null;
  TXN_DATE?: string | null;
  DEPR_ACC_NO?: string | null;
  ACCU_DEPR_ACC_NO?: string | null;
  DEPR_YEARS?: number | null;
  CHG_YEARS?: number | null;
  RESIDUAL_AMT?: number | null;
  DEPR_DUE?: number | null;
  UNAMORT_AMT?: number | null;
  AMORT_AMT?: number | null;
  AMORT_MONTHS?: number | null;
  KEEP_USER_NO?: string | null;
  KEEP_ORG_ID?: string | null;
  USE_USER_NO?: string | null;
  USE_ORG_ID?: string | null;
  LOC_NO?: string | null;
  MAINT_CONTRACT_NO?: string | null;

  SOLD_DATE?: string | null;
  SOLD_VENDOR_NO?: string | null;
  SOLD_VOUCHER_NO?: string | null;
  SOLD_AMT_TAX?: number | null;
  SOLD_REMARK?: string | null;

  ASSET_REMARK?: string | null;
}

export interface CreateASS13080Request {
  SOLD_NO?: string | null;
  ASSET_NO?: string | null;
  SOLD_DATE: string;
  SOLD_VENDOR_NO: string;
  SOLD_VOUCHER_NO?: string | null;
  SOLD_AMT_TAX: number;
  SOLD_REMARK: string;
}

export interface CreateASS13080Result {
  SOLD_NO?: string;
}

export interface ApproveASS13080Request {
  SOLD_NO: string;
}

export interface CancelASS13080Request {
  SOLD_NO: string;
}

export interface PrintASS13080Request {
  SOLD_NO: string;
}

// ==================== 下拉（預留） ====================

export interface FAAssetOptionItem {
  No?: string;
  Name?: string;
}

