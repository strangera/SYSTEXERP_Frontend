import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS11040 品項資料維護作業 - 資料模型
 */
/** Request 介面 */

/**
 * 品項資料查詢
 */
export interface QueryASS11040Request extends ApiRequest {
  /** 品項代碼(可模糊) */
  GOODS_ID?: string | null;
  /** 品項名稱(關鍵字) */
  GOODS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 小分類代碼 */
  S_CLASS_ID?: string | null;
  /** 品項類別屬性(對照 SYS1000.PROD_TYPE) */
  MATERIAL_TYPE?: string | null;
  /** 基本單位(對照 SYS1000.UNIT) */
  UNIT?: string | null;
  /** 包裝單位(對照 SYS1000.PACK_UNIT) */
  PACK_UNIT?: string | null;
  /** 保固方式(0=廠商、1=公司) */
  MT_MODE?: string | null;
  /** 保養方式(0=廠商、1=公司) */
  IVN_MODE?: string | null;
  /** 說明/備註(關鍵字) */
  NOTES_KW?: string | null;
}

/**
 * 品項資料查詢回應 (外層包裝，對應 API Data 結構)
 */
export interface QueryASS11040DataResponse {
  TotalCount?: number;
  TotalPages: number;
  Data?: QueryASS11040Data[];
}

/** 品項資料明細 */
export interface QueryASS11040Data {
  /** 序號 */
  RowNum?: number | null;
  /** ID */
  ID?: number | null;
  /** MID */
  MID?: number | null;
  /** 分店編號 */
  STO_NO?: string | null;
  /** 品項代碼 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 會計歸屬單位代碼 */
  ORG_ID?: string | null;
  /** 會計歸屬單位名稱 */
  ORG_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 中分類名稱 */
  M_CLASS_NAME?: string | null;
  /** 小分類代碼 */
  S_CLASS_ID?: string | null;
  /** 小分類名稱 */
  S_CLASS_NAME?: string | null;
  /** 品項類別屬性代碼 */
  MATERIAL_TYPE?: string | null;
  /** 品項類別屬性名稱 */
  MATERIAL_TYPE_NAME?: string | null;
  /** 備註說明 */
  NOTES?: string | null;
  /** 條碼 */
  BAR_CODE?: string | null;
  /** 照片URL */
  PHOTO_URL?: string | null;
  /** 長(CM) */
  LENGTH_CM?: number | null;
  /** 寬(CM) */
  WIDTH_CM?: number | null;
  /** 高(CM) */
  HEIGHT_CM?: number | null;
  /** 重量(KG) */
  WEIGHT_KG?: number | null;
  /** 基本單位代碼 */
  UNIT?: string | null;
  /** 基本單位名稱 */
  UNIT_NAME?: string | null;
  /** 包裝單位代碼 */
  PACK_UNIT?: string | null;
  /** 包裝單位名稱 */
  PACK_UNIT_NAME?: string | null;
  /** 包裝數量 */
  PACK_NUM?: number | null;
  /** 成本單價 */
  COST_PRICE?: number | null;
  /** 稅別代碼 */
  TAX_CODE?: string | null;
  /** 保固方式代碼 */
  MT_MODE?: string | null;
  /** 維保廠商 */
  MT_SUPP?: string | null;
  /** 保固年 */
  MT_YEAR?: number | null;
  /** 保固月 */
  MT_MONTH?: number | null;
  /** 保固日 */
  MT_DAY?: number | null;
  /** 保養方式代碼 */
  IVN_MODE?: string | null;
  /** 保養廠商 */
  IVN_SUPP?: string | null;
  /** 可維修年 */
  IVN_YEAR?: number | null;
  /** 可維修月 */
  IVN_MONTH?: number | null;
  /** 可維修日 */
  IVN_DAY?: number | null;
  /** 折舊年限(年) */
  EXP_YEAR?: number | null;
  /** 折舊年限(月) */
  EXP_MONTH?: number | null;
  /** 續命年限(年) */
  ADD_EXP_YEAR?: number | null;
  /** 續命年限(月) */
  ADD_EXP_MONTH?: number | null;
  /** 狀態 */
  STATUS?: string | null;
  /** 保養週期 */
  MT_PERIOD?: number | null;
  /** 盤點週期 */
  IVN_PERIOD?: number | null;
  /** 安全庫存量 */
  SAFE_QTY?: number | null;
  /** 最高庫存量 */
  HIGH_STOCK_QTY?: number | null;
  /** 店售定價 */
  STORE_SALES_AMT?: number | null;
  /** 是否領殘值 */
  RESI_STATUS?: string | null;
  /** 建立日期 */
  CRT_Date?: string | null;
  /** 建立人員代碼 */
  CRT_USR_No?: string | null;
  /** 建立人員姓名 */
  CRT_USR_Name?: string | null;
  /** 更新日期 */
  UPD_Date?: string | null;
  /** 更新人員代碼 */
  UPD_USR_No?: string | null;
  /** 更新人員姓名 */
  UPD_USR_Name?: string | null;
};

/**
 * 新增品項請求（createASS11040）
 * 不包含 STO_NO、CRT_USR_No、CRT_USR_Name
 */
export interface CreateASS11040Request {
  MATERIAL_TYPE?: string | null;
  B_CLASS_ID?: string | null;
  M_CLASS_ID?: string | null;
  S_CLASS_ID?: string | null;
  GOODS_NAME?: string | null;
  ORG_ID?: string | null;
  BAR_CODE?: string | null;
  PHOTO_URL?: string | null;
  LENGTH_CM?: number | null;
  WIDTH_CM?: number | null;
  HEIGHT_CM?: number | null;
  WEIGHT_KG?: number | null;
  UNIT?: string | null;
  PACK_UNIT?: string | null;
  PACK_NUM?: number | null;
  MT_MODE?: string | null;
  MT_SUPP?: string | null;
  MT_YEAR?: number | null;
  MT_MONTH?: number | null;
  MT_DAY?: number | null;
  IVN_MODE?: string | null;
  IVN_SUPP?: string | null;
  IVN_YEAR?: number | null;
  IVN_MONTH?: number | null;
  IVN_DAY?: number | null;
  EXP_YEAR?: number | null;
  EXP_MONTH?: number | null;
  ADD_EXP_YEAR?: number | null;
  ADD_EXP_MONTH?: number | null;
  NOTES?: string | null;
}

/** createASS11040 API 的 Data 欄位 */
export interface CreateASS11040Response {
  NewID?: number;
  NewGoodsId?: string;
  ReturnCode?: number;
  ReturnMsg?: string;
}

/**
 * 更新品項請求（updateASS11040）
 * 不包含 CRT_*；包含 STO_NO、OLD_GOODS_ID、RecodeGoodsId、UPD_USR_No、UPD_USR_Name
 */
export interface UpdateASS11040Request {
  STO_NO?: string | null;
  OLD_GOODS_ID?: string | null;
  RecodeGoodsId?: boolean;
  GOODS_NAME?: string | null;
  BAR_CODE?: string | null;
  PHOTO_URL?: string | null;
  ORG_ID?: string | null;
  MATERIAL_TYPE?: string | null;
  B_CLASS_ID?: string | null;
  M_CLASS_ID?: string | null;
  S_CLASS_ID?: string | null;
  LENGTH_CM?: number | null;
  WIDTH_CM?: number | null;
  HEIGHT_CM?: number | null;
  WEIGHT_KG?: number | null;
  UNIT?: string | null;
  PACK_UNIT?: string | null;
  PACK_NUM?: number | null;
  TAX_CODE?: string | null;
  MT_MODE?: string | null;
  MT_SUPP?: string | null;
  MT_YEAR?: number | null;
  MT_MONTH?: number | null;
  MT_DAY?: number | null;
  IVN_MODE?: string | null;
  IVN_SUPP?: string | null;
  IVN_YEAR?: number | null;
  IVN_MONTH?: number | null;
  IVN_DAY?: number | null;
  EXP_YEAR?: number | null;
  EXP_MONTH?: number | null;
  ADD_EXP_YEAR?: number | null;
  ADD_EXP_MONTH?: number | null;
  NOTES?: string | null;
  STATUS?: string | null;
  MT_PERIOD?: number | null;
  IVN_PERIOD?: number | null;
  SAFE_QTY?: number | null;
  HIGH_STOCK_QTY?: number | null;
  STORE_SALES_AMT?: number | null;
  RESI_STATUS?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/**
 * 大分類查詢
 */
export interface QueryFACLASSMRequest {
  /** 大分類代碼 */
  CLASS_ID?: string | null;
  /** 大分類名稱關鍵字 */
  Keyword?: string | null;
}

/**
 * queryFACLASS1_DropDownList 請求（對應 SP_FACLASS1_Query，以 FACLASSM.CLASS_ID 篩選）
 */
export interface QueryFACLASS1Request {
  /** 資材大分類代碼 */
  CLASS_ID?: string | null;
}

/**
 * queryFACLASS2_DropDownList 請求
 */
export interface QueryFACLASS2Request {
  /** 大分類代碼（FACLASSM.CLASS_ID） */
  B_CLASS_ID?: string | null;
  /** 資材中分類代碼 */
  CLASS_ID?: string | null;
}

/** Response / 包裝介面 */

/**
 * 品項資料查詢回應 (外層包裝，對應 API Data 結構)
 */
export interface QueryASS11040DataWrapper {
  TotalRows: number;
  TotalPages: number;
  QueryData: QueryASS11040Response[];
  /** @deprecated 後端改為 QueryData 後可移除，保留相容舊版 */
  Data?: QueryASS11040Response[];
  /** @deprecated 後端改為 TotalRows 後可移除 */
  TotalCount?: number;
}

/**
 * 品項資料查詢回應
 */
export interface QueryASS11040Response {
  /** 序號 */
  RowNum?: number | null;
  /** ID */
  ID?: number | null;
  /** MID */
  MID?: number | null;
  /** 分店編號 */
  STO_NO?: string | null;
  /** 品項代碼 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 會計歸屬單位代碼 */
  ORG_ID?: string | null;
  /** 會計歸屬單位名稱 */
  ORG_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 中分類名稱 */
  M_CLASS_NAME?: string | null;
  /** 小分類代碼 */
  S_CLASS_ID?: string | null;
  /** 小分類名稱 */
  S_CLASS_NAME?: string | null;
  /** 品項類別屬性代碼 */
  MATERIAL_TYPE?: string | null;
  /** 備註說明 */
  NOTES?: string | null;
  /** 條碼 */
  BAR_CODE?: string | null;
  /** 照片URL */
  PHOTO_URL?: string | null;
  /** 長(CM) */
  LENGTH_CM?: number | null;
  /** 寬(CM) */
  WIDTH_CM?: number | null;
  /** 高(CM) */
  HEIGHT_CM?: number | null;
  /** 重量(KG) */
  WEIGHT_KG?: number | null;
  /** 基本單位代碼 */
  UNIT?: string | null;
  /** 包裝單位代碼 */
  PACK_UNIT?: string | null;
  /** 包裝數量 */
  PACK_NUM?: number | null;
  /** 成本單價 */
  COST_PRICE?: number | null;
  /** 稅別代碼 */
  TAX_CODE?: string | null;
  /** 保固方式代碼 */
  MT_MODE?: string | null;
  /** 維保廠商 */
  MT_SUPP?: string | null;
  /** 保固年 */
  MT_YEAR?: number | null;
  /** 保固月 */
  MT_MONTH?: number | null;
  /** 保固日 */
  MT_DAY?: number | null;
  /** 保養方式代碼 */
  IVN_MODE?: string | null;
  /** 保養廠商 */
  IVN_SUPP?: string | null;
  /** 可維修年 */
  IVN_YEAR?: number | null;
  /** 可維修月 */
  IVN_MONTH?: number | null;
  /** 可維修日 */
  IVN_DAY?: number | null;
  /** 折舊年限(年) */
  EXP_YEAR?: number | null;
  /** 折舊年限(月) */
  EXP_MONTH?: number | null;
  /** 續命年限(年) */
  ADD_EXP_YEAR?: number | null;
  /** 續命年限(月) */
  ADD_EXP_MONTH?: number | null;
  /** 狀態 */
  STATUS?: string | null;
  /** 保養週期 */
  MT_PERIOD?: number | null;
  /** 盤點週期 */
  IVN_PERIOD?: number | null;
  /** 安全庫存量 */
  SAFE_QTY?: number | null;
  /** 最高庫存量 */
  HIGH_STOCK_QTY?: number | null;
  /** 店售定價 */
  STORE_SALES_AMT?: number | null;
  /** 是否領殘值 */
  RESI_STATUS?: string | null;
  /** 建立日期 */
  CRT_Date?: string | null;
  /** 建立人員代碼 */
  CRT_USR_No?: string | null;
  /** 建立人員姓名 */
  CRT_USR_Name?: string | null;
  /** 更新日期 */
  UPD_Date?: string | null;
  /** 更新人員代碼 */
  UPD_USR_No?: string | null;
  /** 更新人員姓名 */
  UPD_USR_Name?: string | null;
}

/**
 * 大分類查詢回應 (外層包裝)
 */
export interface QueryFACLASSMDataWrapper {
  Data: FACLASSMData[];
}

/**
 * 大分類資料
 */
export interface FACLASSMData {
  /** 序號 */
  RowNum?: number | null;
  /** 大分類代碼 */
  CLASS_ID?: string | null;
  /** 大分類名稱 */
  CLASS_NAME?: string | null;
}

/**
 * queryFACLASS1_DropDownList 列資料
 */
export interface FACLASS1Data {
  /** 序號 */
  RowNum?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 中分類名稱 */
  M_CLASS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 說明 */
  NOTES?: string | null;
}

/**
 * @deprecated 新版 API 的 `Data` 直接為 `FACLASS1Data[]`，請使用 `FACLASS1Data[]` 或 `ApiResponse<FACLASS1Data[]>`
 */
export type QueryFACLASS1DataWrapper = FACLASS1Data[];

/**
 * queryFACLASS2_DropDownList 列資料
 */
export interface FACLASS2Data {
  /** 序號 */
  RowNum?: string | null;
  /** 小分類代碼 */
  S_CLASS_ID?: string | null;
  /** 小分類名稱 */
  S_CLASS_NAME?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 中分類名稱 */
  M_CLASS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 說明 */
  NOTES?: string | null;
}

/**
 * @deprecated 新版 API 的 `Data` 直接為 `FACLASS2Data[]`，請使用 `FACLASS2Data[]` 或 `ApiResponse<FACLASS2Data[]>`
 */
export type QueryFACLASS2DataWrapper = FACLASS2Data[];
