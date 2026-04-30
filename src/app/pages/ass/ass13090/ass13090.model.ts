import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export enum ResultLayoutMode {
  /** 攤提設定 */
  AmortizationSetting = 'setting',
  /** 查詢 */
  Query = 'query',
}

/** queryASS13090 查詢請求 */
export interface QueryASS13090Request extends BaseQueryRequest {
  /** 分店編號 */
  STO_NO?: string | null;
  /** 攤提代號 */
  DEPRE_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 財產狀態(1使用中 3維修中 4報廢 5變賣 7庫存未使用) */
  ASSET_STATUS?: string | null;
  /** 資產類型(1資產 2列管品) */
  DEPRE_YN?: string | null;
  /** 進貨單號 */
  SUBPOENA_ID?: string | null;
  /** 購入日期(起) */
  GET_DATE_S?: string | null;
  /** 購入日期(迄) */
  GET_DATE_E?: string | null;
  /** 購入金額(起) */
  ASSET_COST_S?: number | null;
  /** 購入金額(迄) */
  ASSET_COST_E?: number | null;
  /** 攤提狀態(Y已攤提 N未攤提) */
  DEPRE_STATUS?: string | null;
  /** 攤提年月(YYYY-MM) */
  DEPRE_YM?: string | null;
  /** 會計科目代號(借方或貸方) */
  STYPE_ID?: string | null;
}

export interface PrintASS13090Request {
  /** 分店編號 */
  STO_NO?: string | null;
  /** 攤提代號 */
  DEPRE_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 財產狀態(1使用中 3維修中 4報廢 5變賣 7庫存未使用) */
  ASSET_STATUS?: string | null;
  /** 資產類型(1資產 2列管品) */
  DEPRE_YN?: string | null;
  /** 進貨單號 */
  SUBPOENA_ID?: string | null;
  /** 購入日期(起) */
  GET_DATE_S?: string | null;
  /** 購入日期(迄) */
  GET_DATE_E?: string | null;
  /** 購入金額(起) */
  ASSET_COST_S?: number | null;
  /** 購入金額(迄) */
  ASSET_COST_E?: number | null;
  /** 攤提狀態(Y已攤提 N未攤提) */
  DEPRE_STATUS?: string | null;
  /** 攤提年月(YYYY-MM) */
  DEPRE_YM?: string | null;
  /** 會計科目代號(借方或貸方) */
  STYPE_ID?: string | null;
  /** 排序欄位 */
  SortField?: string | null;
  /** 排序順序 */
  SortOrder?: number | null;
}

/** amorASS13090 查詢請求 */
export interface AmorASS13090Request extends BaseQueryRequest {
  /** 分店編號 */
  STO_NO?: string | null;
  /** 攤提代號 */
  DEPRE_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 財產狀態 */
  ASSET_STATUS?: string | null;
  /** 資產類型 */
  DEPRE_YN?: string | null;
  /** 進貨單號(採購單號) */
  SUBPOENA_ID?: string | null;
  /** 購入日期(起) */
  GET_DATE_S?: string | null;
  /** 購入日期(迄) */
  GET_DATE_E?: string | null;
  /** 購入金額(起) */
  ASSET_COST_S?: number | null;
  /** 購入金額(迄) */
  ASSET_COST_E?: number | null;
  /** 攤提狀態(Y已攤提 N未攤提) */
  DEPRE_STATUS?: string | null;
  /** 攤提年月(YYYY-MM) */
  DEPRE_YM?: string | null;
  /** 會計科目代號(借方或貸方) */
  STYPE_ID?: string | null;
}

/** queryASS13090 回傳資料包裝 */
export interface QueryASS13090Response {
  QueryData: QueryASS13090QueryDataRow[];
  TotalCount: number;
  TotalPage: number;
}

/** queryASS13090 單筆列 */
export interface QueryASS13090QueryDataRow {
  /** 財產代號 */
  ASSET_ID?: string | null;
  /** 攤提代號 */
  DEPRE_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 購入日期 */
  GET_DATE?: string | null;
  /** 入帳日期 */
  BILL_DATE?: string | null;
  /** 資產類型代碼 */
  DEPRE_YN?: string | null;
  /** 購入金額 */
  ASSET_COST?: number | null;
  /** 重估金額 */
  GET_COST?: number | null;
  /** 攤提起始日 */
  DEPRE_SDATE?: string | null;
  /** 資產類型文字 */
  SYS_Name?: string | null;
  /** 攤提狀態文字 (已攤提 / 未攤提) */
  DEPRE_STATUS?: string | null;
  /** 流水編號(分頁用) */
  RowNum?: number | null;
}

export interface AmorASS13090Response {
  /** 財產代號 */
  ASSET_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 購入日期 */
  GET_DATE?: string | null;
  /** 入帳日期 */
  BILL_DATE?: string | null;
  /** 資產類型 */
  SYS_Name?: string | null;
  /** 購入金額 */
  GET_COST?: number | null;
  /** 攤提代號 */
  DEPRE_ID?: string | null;
  /** 折舊年限(年) */
  EXP_YEAR?: number | null;
  /** 財產狀態 */
  ASSET_STATUS?: string | null;
  /** 資產類型代碼 */
  DEPRE_YN?: string | null;
  /** 進貨單號 */
  SUBPOENA_ID?: string | null;
  /** 攤提起始日 */
  DEPRE_SDATE?: string | null;
  /** 已攤提月數 */
  TAL_DEPRE_MON?: number | null;
  /** 折舊狀態文字（已拋轉 / 已設定 / 未設定） */
  DEPRE_STATUS_TEXT?: string | null;
  /** 流水編號(分頁用) */
  RowNum?: number | null;
}

export interface AmorASS13090Result {
  QueryData?: AmorASS13090Response[] | null;
  TotalCount?: number;
  TotalPage?: number;
}

export interface AmortizeASS13090Request {
  /** 資產編號清單(FAASSET.ASSET_ID) */
  AssetIds?: string[] | null;
}

export interface AmortizeASS13090Response {
  Result: number;
  ResultMsg?: string | null;
}

export interface ContinuedASS13090Request {
  /** 分店編號(必填) */
  STO_NO?: string | null;
  /** FASCONDEP.ID(單筆) */
  ID: number;
  /** 續提攤入金額(每月折舊額) */
  DEPRE_AMOUNT?: number | null;
  /** 續提殘值係數 */
  RESI_VALUE?: number | null;
  /** 續提註記 */
  MEMO?: string | null;
  /** 操作人員編號(由後端自動帶入) */
  UPD_USR_No?: string | null;
  /** 操作人員姓名(由後端自動帶入) */
  UPD_USR_Name?: string | null;
}

export interface ContinuedASS13090Response {
  Result: number;
  ResultMsg?: string | null;
}

export interface DetailASS13090Request {
  /** 分店編號 */
  STO_NO?: string | null;
  /** 攤提代號(必填) */
  DEPRE_ID: string;
}

export interface DetailASS13090DetailItem {
  /** 序號 */
  RowNo?: number | null;
  /** 攤提起始 */
  DEPRE_YM_B?: string | null;
  /** 攤提結束 */
  DEPRE_YM_E?: string | null;
  /** 攤提金額 */
  DEPRE_AMOUNT?: number | null;
  /** 攤提日期 */
  DEPRE_DATE?: string | null;
  /** 傳票編號 */
  VOUCHER_ID?: string | null;
  /** 重估單號 */
  REPNOTE?: string | null;
}

export interface DetailASS13090MasterInfo {
  /** 財產代號 */
  ASSET_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 財產狀態代碼 */
  ASSET_STATUS?: string | null;
  /** 財產狀態名稱 */
  ASSET_STATUS_NAME?: string | null;
  /** 資產類型代碼 */
  DEPRE_YN?: string | null;
  /** 資產類型名稱 */
  DEPRE_YN_NAME?: string | null;
  /** 進貨單號(採購單號) */
  SUBPOENA_ID?: string | null;
  /** 購入日期 */
  GET_DATE?: string | null;
  /** 原購入金額 */
  GET_COST?: number | null;
  /** 異動金額 */
  CHANGE_AMT?: number | null;
  /** 供應商 */
  SUPPLIER_ID?: string | null;
  /** 會計科目(借) */
  STYPE_D?: string | null;
  /** 會計科目(借)名稱 */
  STYPE_D_NAME?: string | null;
  /** 會計科目(貸) */
  STYPE_C?: string | null;
  /** 會計科目(貸)名稱 */
  STYPE_C_NAME?: string | null;
  /** 入帳日期 */
  BILL_DATE?: string | null;
  /** 攤提起始日 */
  DEPRE_SDATE?: string | null;
  /** 折舊會計科目 */
  STYPE_ID?: string | null;
  /** 折舊會計科目名稱 */
  STYPE_ID_NAME?: string | null;
  /** 累計折舊科目 */
  STYPE_ID2?: string | null;
  /** 累計折舊科目名稱 */
  STYPE_ID2_NAME?: string | null;
  /** 折舊年限(年) */
  EXP_YEAR?: number | null;
  /** 異動年限 */
  CHANGE_EXP_YEAR?: number | null;
  /** 折舊年限(月) */
  EXP_MONTH?: number | null;
  /** 預留殘值 */
  RESI_VALUE?: number | null;
  /** 已攤提金額 */
  TAL_DEPRE_AMT?: number | null;
  /** 已攤提月數 */
  TAL_DEPRE_MON?: number | null;
  /** 保管人代號 */
  HOLD_EMP_ID?: string | null;
  /** 保管人名稱 */
  HOLD_EMP_NAME?: string | null;
  /** 保管單位代號 */
  HOLD_ORG_ID?: string | null;
  /** 保管單位名稱 */
  HOLD_ORG_NAME?: string | null;
  /** 使用人代號 */
  USE_EMP_ID?: string | null;
  /** 使用人名稱 */
  USE_EMP_NAME?: string | null;
  /** 使用單位代號 */
  USE_ORG_ID?: string | null;
  /** 使用單位名稱 */
  USE_ORG_NAME?: string | null;
  /** 位置代號 */
  LOCATION_ID?: string | null;
}

export interface DetailASS13090Result {
  MasterInfo?: DetailASS13090MasterInfo | null;
  DetailList?: DetailASS13090DetailItem[] | null;
}
