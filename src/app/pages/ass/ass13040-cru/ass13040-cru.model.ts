import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * detailASS13040 Request（對應 API）
 */
export interface ASS13040DetailRequest {
  ID: number; // 主檔值(報廢單ID)
}

/**
 * detailASS13040 Response.Data.Master（QueryDetailASS13040MasterData）
 */
export interface QueryDetailASS13040MasterData {
  ID?: number;
  MID?: number | null;
  STO_NO?: string | null;
  DAMAGEM_ID?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  WH_ID?: string | null;
  APPLY_DATE?: string | null;
  TOLAMT?: number | null;
  TOLPRICE?: number | null;
  DAMAGEM_STATUS?: string | null;
  APRV_EMP_ID?: string | null;
  APRV_DATE?: string | null;
  SUPPLIER_ID?: string | null;
  VOUCHER_ID?: string | null;
  ASSET_V_KEY?: string | null;
  ASSET_TYPE?: string | null;
  NOTES?: string | null;
  IMAGE_URL1?: string | null;
  IMAGE_URL2?: string | null;
  IMAGE_URL3?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/**
 * detailASS13040 Response.Data.Details 元素（QueryDetailASS13040DetailData）
 */
export interface QueryDetailASS13040DetailData {
  ID?: number;
  MID?: number | null;
  STO_NO?: string | null;
  DAMAGEM_ID?: string | null;
  LINE_NUM?: number | null;
  GOODS_ID?: string | null;
  GOODS_PRICE?: number | null;
  QTY?: number | null;
  GOODS_UNIT?: string | null;
  SUBCOST?: number | null;
  GOODS_COST?: number | null;
  EVAL_COST?: number | null;
  AMT?: number | null;
  NOTES?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/**
 * detailASS13040 Response.Data（QueryDetailASS13040Result）
 */
export interface QueryDetailASS13040Result {
  Master?: QueryDetailASS13040MasterData;
  Details?: QueryDetailASS13040DetailData[] | null;
}

/** ASS13040 主檔資料（表單/送出用，與 Master 對應） */
export interface ASS13040Header {
  SCRAP_FORM_NO?: string;
  SCRAP_USER_NO?: string;
  ORG_ID?: string;
  VENDOR_NO?: string;
  APPLY_DATE?: string;
  ASSET_TYPE?: string;
  NOTES?: string;
  IMAGE_URL1?: string;
  IMAGE_URL2?: string;
  IMAGE_URL3?: string;
}

/**
 * ASS13040 明細資料（表格/送出用，與 API Detail 對應）
 */
export interface ASS13040DetailItem {
  ITEM_NO?: string;
  UNIT?: string;
  QTY?: number;
  BUY_AMT?: number;
  CHANGE_AMT?: number;
  TOTAL_AMT?: number;
  NOTES?: string;
}

/**
 * ASS13040 明細資料（送後端用，對齊 C# ASS13040DetailItem）
 */
export interface ASS13040DetailItemRequest {
  GOODS_ID?: string | null;
  GOODS_PRICE?: number | null;
  QTY?: number | null;
  GOODS_UNIT?: string | null;
  SUBCOST?: number | null;
  GOODS_COST?: number | null;
  EVAL_COST?: number | null;
  AMT?: number | null;
  NOTES?: string | null;
}

/** detailASS13040 回傳 Data 型別（對應 ApiResponse.Data） */
export type ASS13040DetailResponseData = QueryDetailASS13040Result;

/**
 * ASS13040 共用 Request（送後端用，對齊 C# Insert/Update 共用欄位）
 */
export interface BaseASS13040Request {
  MID?: number | null;
  STO_NO?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  WH_ID?: string | null;
  APPLY_DATE?: string | null;
  ASSET_TYPE?: string | null;
  SUPPLIER_ID?: string | null;
  NOTES?: string | null;
  IMAGE_URL1?: string | null;
  IMAGE_URL2?: string | null;
  IMAGE_URL3?: string | null;
  Items: ASS13040DetailItemRequest[];
}

/**
 * insertASS13040 Request（送後端用，對齊 C# InsertASS13040Request）
 * DAMAGEM_ID 不傳則由 SP 自動取號
 */
export interface InsertASS13040Request extends BaseASS13040Request {
  DAMAGEM_ID?: string | null;
}

/**
 * updateASS13040 Request（送後端用，對齊 C# UpdateASS13040Request）
 */
export interface UpdateASS13040Request extends BaseASS13040Request {
  ID: number;
}

export interface ASS13040InsertRequest extends ASS13040Header {
  Items: ASS13040DetailItem[];
}

export interface ASS13040UpdateRequest extends ASS13040Header {
  SCRAP_FORM_NO: string;
  Items: ASS13040DetailItem[];
}

/**
 * 資產 popup 查詢參數（對應 QueryFAASSETChooseListASS13040Request）
 * 繼承共用的 ApiRequest
 */
export interface QueryFAASSETChooseListASS13040Request extends ApiRequest {
  MID?: number | null;
  STO_NO?: string | null;
  ASSET_ID?: string | null;      // 資產編號
  GOODS_NAME?: string | null;    // 品項名稱
  B_CLASS_ID?: string | null;    // 大分類
  M_CLASS_ID?: string | null;    // 中分類
  S_CLASS_ID?: string | null;    // 小分類
  HOLD_EMP_ID?: string | null;   // 保管人代號
  HOLD_ORG_ID?: string | null;   // 保管單位代號
  ASSET_STATUS?: string | null;  // 資產狀態   
  MATERIAL_TYPE?: string | null; // 資產類型 
}

/**
 * 資產 popup 查詢資料列（對應 QueryFAASSETChooseListASS13040Response 的單筆）
 */
export interface FAASSETChooseListASS13040Row {
  ID: number;
  MID?: number | null;
  STO_NO?: string | null;
  ASSET_ID?: string | null;
  GET_DATE?: string | null;
  AssetName?: string | null;
  Unit?: string | null;
  UnitName?: string | null;
  ASSET_STATUS?: string | null;
  ASSET_STATUSName?: string | null;
  PurchaseAmt?: number | null;
  ChangeAmt?: number | null;
  TotalAmt?: number | null;
  FIR_EXP_YEAR?: number | null;
  UPD_EXP_YEAR_SUM?: number | null;
  SUM_DEPRE_MONTH?: number | null;
  SUM_DEPRE_AMOUNT?: number | null;
  STYPE_ID?: string | null;
  STYPE_ID2?: string | null;
  HOLD_EMP_ID?: string | null;
  user_Name?: string | null;
  HOLD_ORG_ID?: string | null;
  Org_Name?: string | null;
  USE_EMP_ID?: string | null;
  USE_ORG_ID?: string | null;
}

/**
 * 為了沿用既有型別名稱，將新型別以 type alias 暴露給舊程式碼
 */
export type ASS13040AssetQueryRequest = QueryFAASSETChooseListASS13040Request;
export type ASS13040AssetQueryRow = FAASSETChooseListASS13040Row;

// 舊的 ASS13040AssetQueryDataWrapper 對應結構已不再使用，故不再定義
