import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';


// ============================================================
// Query Request
// ============================================================

export interface QueryASS13080Request extends ApiRequest {

  /** 商場代碼(0=不限制) */
  MID?: number | null;

  /** 分店編號 */
  STO_NO?: string | null;

  /** 變賣單號 */
  ASSET_SALENO?: string | null;

  /** 資產代號 */
  ASSET_ID?: string | null;

  /** 品項編號 */
  GOODS_ID?: string | null;

  /** 購入日期起 */
  GET_DATE_S?: string | null;

  /** 購入日期訖 */
  GET_DATE_E?: string | null;

  /** 資產狀態 */
  ASSET_STATUS?: string | null;

  /** 攤提代號 */
  DEPRE_ID?: string | null;

  /** 財產(資產)類型[1:資產,2:列管品] */
  DEPRE_YN?: string | null;

  /** 保管單位 */
  HOLD_ORG_ID?: string | null;

  /** 保管人 */
  HOLD_EMP_ID?: string | null;

  /** 使用單位 */
  USE_ORG_ID?: string | null;

  /** 使用人 */
  USE_EMP_ID?: string | null;

  /** 會計科目(折舊會計科目) */
  STYPE_ID?: string | null;

  /** 購入金額起 */
  GET_COST_S?: number | null;

  /** 購入金額訖 */
  GET_COST_E?: number | null;

  /** 驗收單號 */
  SUBCHECK_ID?: string | null;

  /** 入帳日期起 */
  BILL_DATE_S?: string | null;

  /** 入帳日期訖 */
  BILL_DATE_E?: string | null;
}


// ============================================================
// Query Row
// ============================================================

export interface ASS13080QueryRow {

  /** 流水號 */
  ROWNO?: number | null;

  /**
   * FAASSSALEM.ID
   *
   * 用途：
   * 取消變賣
   * 變賣審核
   */
  ID?: number | null;

  /**
   * FAASSET.ID
   *
   * 用途：
   * detailASS13010
   */
  ASSET_PK_ID?: number | null;

  /** 商場 */
  MID?: number | null;

  /** 分店 */
  STO_NO?: string | null;

  /** 變賣單號 */
  ASSET_SALENO?: string | null;

  /** 資產代號 */
  ASSET_ID?: string | null;

  /** 品項 */
  GOODS_ID?: string | null;

  /** 品項名稱 */
  GOODS_NAME?: string | null;

  /**
   * 資產類型
   * 1:資產
   * 2:列管品
   */
  ASSET_TYPE?: string | null;

  /** 資產類型中文 */
  ASSET_TYPENAME?: string | null;

  /** 資產狀態 */
  ASSET_STATUS?: string | null;

  /** 資產狀態中文 */
  ASSET_STATUS_NAME?: string | null;

  /** 保管人 */
  HOLD_EMP_ID?: string | null;

  /** 保管人姓名 */
  HOLD_EMP_NAME?: string | null;

  /** 保管單位 */
  HOLD_ORG_ID?: string | null;

  /** 使用人 */
  USE_EMP_ID?: string | null;

  /** 使用人姓名 */
  USE_EMP_NAME?: string | null;

  /** 使用單位 */
  USE_ORG_ID?: string | null;

  /** 購入金額 */
  GET_COST?: number | null;

  /** 購入日期 */
  GET_DATE?: string | null;

  /** 攤提代號 */
  DEPRE_ID?: string | null;

  /** 折舊會計科目 */
  STYPE_ID?: string | null;

  /** 累計折舊會計科目 */
  STYPE_ID2?: string | null;

  /** 驗收單號 */
  SUBCHECK_ID?: string | null;

  /** 入帳日期 */
  BILL_DATE?: string | null;

  /** 殘值 */
  RESI_VALUE?: number | null;

  /** 位置 */
  LOCATION_ID?: string | null;

  /** 維修合約 */
  FIX_N?: string | null;

  /** 單位 */
  UNIT?: string | null;


  // ==========================================================
  // 變賣資料 - FAASSSALEM
  // ==========================================================

  /** 變賣日期 */
  SALDATE?: string | null;

  /** 審核日期 */
  ACCSALCHKD?: string | null;

  /** 審核人員 */
  ACCSALCHKEMP_ID?: string | null;

  /** 審核人姓名 */
  ACCSALCHKEMP_NAME?: string | null;

  /** 變賣廠商 */
  BUYER_VENNO?: string | null;

  /** 傳票 */
  Voucher_No?: string | null;

  /** 稅額 */
  SALE_TAX?: number | null;

  /** 未稅金額 */
  SALE_NET?: number | null;

  /** 含稅金額 */
  SALE_AMT?: number | null;

  /** 單據狀態 */
  ASSETSALE_STATUS?: string | null;


  // ==========================================================
  // Audit
  // ==========================================================

  CRT_USR_No?: string | null;

  CRT_USR_Name?: string | null;

  CRT_Date?: string | null;

  UPD_USR_No?: string | null;

  UPD_USR_Name?: string | null;

  UPD_Date?: string | null;
}


// ============================================================
// Query Wrapper
// ============================================================

export interface ASS13080QueryDataWrapper {

  Details?: ASS13080QueryRow[];

  TotalRows?: number;

  TotalPages?: number;
}


// ============================================================
// CRU Detail
// ============================================================

export interface ASS13080Detail {

  /**
   * FAASSSALEM.ID
   *
   * 取消 / 審核使用
   */
  ID?: number | null;

  /**
   * FAASSET.ID
   *
   * detailASS13010 使用
   */
  ASSET_PK_ID?: number | null;


  // ==========================================================
  // 變賣單
  // ==========================================================

  ASSET_SALENO?: string | null;

  ASSET_ID?: string | null;


  // ==========================================================
  // Query / Asset 基本資料
  // ==========================================================

  /**
   * SP_ASS13080Query 使用 ASSET_TYPE
   */
  ASSET_TYPE?: string | null;

  /**
   * detailASS13010 使用 DEPRE_YN
   *
   * 1:資產
   * 2:列管品
   */
  DEPRE_YN?: string | null;

  ASSET_TYPENAME?: string | null;

  GOODS_ID?: string | null;

  GOODS_NAME?: string | null;

  ASSET_STATUS?: string | null;

  ASSET_STATUS_NAME?: string | null;


  // ==========================================================
  // 保管 / 使用
  // ==========================================================

  HOLD_EMP_ID?: string | null;

  HOLD_EMP_NAME?: string | null;

  HOLD_ORG_ID?: string | null;

  USE_EMP_ID?: string | null;

  USE_EMP_NAME?: string | null;

  USE_ORG_ID?: string | null;


  // ==========================================================
  // 資產資訊
  // ==========================================================

  GET_COST?: number | null;

  GET_DATE?: string | null;

  DEPRE_ID?: string | null;

  STYPE_ID?: string | null;

  STYPE_ID2?: string | null;

  SUBCHECK_ID?: string | null;

  BILL_DATE?: string | null;

  RESI_VALUE?: number | null;

  LOCATION_ID?: string | null;

  FIX_N?: string | null;

  UNIT?: string | null;


  // ==========================================================
  // 舊前端欄位名稱
  // 保留，避免目前 CRU 編譯錯
  // ==========================================================

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

  LOC_NO?: string | null;

  MAINT_CONTRACT_NO?: string | null;


  // ==========================================================
  // FAASSSALEM 變賣資訊
  // ==========================================================

  /** 變賣日期 */
  SALDATE?: string | null;

  /** 變賣廠商 */
  BUYER_VENNO?: string | null;

  /** 原始購入 / 入帳傳票 */
  Voucher_No?: string | null;

  /** 變賣稅額 */
  SALE_TAX?: number | null;

  /** 變賣未稅金額 */
  SALE_NET?: number | null;

  /** 變賣含稅金額 */
  SALE_AMT?: number | null;

  /** 變賣單狀態 */
  ASSETSALE_STATUS?: string | null;

  /** 審核日期 */
  ACCSALCHKD?: string | null;

  /** 審核人員 */
  ACCSALCHKEMP_ID?: string | null;

  /** 審核人姓名 */
  ACCSALCHKEMP_NAME?: string | null;


  // ==========================================================
  // FAASSET 處分欄位
  // detailASS13010 會回
  // ==========================================================

  /** 處分日期 */
  HANDLE_DATE?: string | null;

  /** 處分廠商 */
  HANDLE_VENDOR?: string | null;

  /** 處分傳票 */
  HANDLE_VID?: string | null;

  /** 處分說明 */
  HANDLE_NOTE?: string | null;

  /** 變賣金額 */
  ONSALE_AMT?: number | null;

  /** 稅額 */
  ONSALE_RATE?: number | null;

  /** 未稅金額 */
  ONSALE_NORATE_AMT?: number | null;


  // ==========================================================
  // 前端 View Model 舊名稱
  // ==========================================================

  SOLD_DATE?: string | null;

  SOLD_VENDOR_NO?: string | null;

  SOLD_VOUCHER_NO?: string | null;

  SOLD_AMT_TAX?: number | null;

  SOLD_REMARK?: string | null;


  // ==========================================================
  // 註記
  // ==========================================================

  ASSET_REMARK?: string | null;

  NOTES?: string | null;
}


// ============================================================
// Create
// ============================================================

export interface CreateASS13080Request {

  /** 資產代號 */
  ASSET_ID: string;

  /** 變賣日期 */
  SALDATE: string;

  /** 變賣廠商 */
  BUYER_VENNO: string;

  /** 變賣金額含稅 */
  SALE_AMT: number;

  /** 變賣說明 */
  HANDLE_NOTE?: string;
}


export interface CreateASS13080Result {

  /** FAASSSALEM.ID */
  ID?: number;

  /** 變賣單號 */
  ASSET_SALENO?: string;

  ErrCode?: number;

  ErrMsg?: string;
}


// ============================================================
// Approve / Cancel
// ============================================================

export interface ApproveASS13080Request {

  /**
   * FAASSSALEM.ID
   */
  ID: number;
}


export interface CancelASS13080Request {

  /**
   * FAASSSALEM.ID
   */
  ID: number;
}


// ============================================================
// Print
// ============================================================

export type PrintASS13080Request = Omit<
  QueryASS13080Request,
  'PageSize'
  | 'PageIndex'
  | 'OrderBy'
  | 'Offset'
  | 'SortBy'
>;


// ============================================================
// 資產選擇列表
// queryFAASSETChooseListASS13060
// ============================================================

export interface QueryFAASSETChooseListASS13060Request
  extends ApiRequest {

  MID?: number | null;

  STO_NO?: string | null;

  ASSET_ID?: string | null;

  GOODS_NAME?: string | null;

  B_CLASS_ID?: string | null;

  M_CLASS_ID?: string | null;

  S_CLASS_ID?: string | null;

  HOLD_EMP_ID?: string | null;

  HOLD_ORG_ID?: string | null;

  ASSET_STATUS?: string | null;
}


export interface QueryFAASSETChooseListASS13060Response {

  /**
   * FAASSET.ID
   *
   * Create 選資產後：
   * detailASS13010 使用
   */
  ID?: number;

  MID?: number | null;

  STO_NO?: string | null;

  ASSET_ID?: string | null;

  GET_DATE?: string | null;

  AssetName?: string | null;

  Unit?: string | null;

  UnitName?: string | null;

  ASSET_STATUS?: string | null;

  ASSET_STATUSName?: string | null;

  /** 資產類型 */
  MATERIAL_TYPE?: string | null;

  PurchaseAmt?: number | null;

  ChangeAmt?: number | null;

  TotalAmt?: number | null;

  /** 原折舊年限 */
  FIR_EXP_YEAR?: number | null;

  /** 異動折舊年限 */
  UPD_EXP_YEAR_SUM?: number | null;

  /** 累計已攤提月數 */
  SUM_DEPRE_MONTH?: number | null;

  /** 累計已攤提金額 */
  SUM_DEPRE_AMOUNT?: number | null;

  /** 折舊結束年月 yyyyMM */
  DEPRE_YM_E?: string | null;

  /** 折舊會計科目 */
  STYPE_ID?: string | null;

  /** 累計折舊會計科目 */
  STYPE_ID2?: string | null;

  /** 保管人 */
  HOLD_EMP_ID?: string | null;

  user_Name?: string | null;

  /** 保管單位 */
  HOLD_ORG_ID?: string | null;

  Org_Name?: string | null;

  /** 使用人 */
  USE_EMP_ID?: string | null;

  /** 使用單位 */
  USE_ORG_ID?: string | null;

  USE_ORG_NAME?: string | null;
}


export interface QueryFAASSETChooseListASS13060Result {

  QueryData?:
  QueryFAASSETChooseListASS13060Response[]
  | null;

  TotalRows?: number;

  TotalPages?: number;
}