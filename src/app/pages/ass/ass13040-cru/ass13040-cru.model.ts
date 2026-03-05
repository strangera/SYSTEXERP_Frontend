import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS13040 主檔資料
 */
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
 * ASS13040 明細資料
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
 * ASS13040 明細查詢回傳
 */
export interface ASS13040DetailResponseData {
  Header?: ASS13040Header;
  Details?: ASS13040DetailItem[];
}

export interface ASS13040DetailRequest {
  SCRAP_FORM_NO: string;
}

export interface ASS13040InsertRequest extends ASS13040Header {
  Items: ASS13040DetailItem[];
}

export interface ASS13040UpdateRequest extends ASS13040Header {
  SCRAP_FORM_NO: string;
  Items: ASS13040DetailItem[];
}

/**
 * 資產 popup 查詢參數
 */
export interface ASS13040AssetQueryRequest extends BaseQueryRequest {
  ASSET_NO?: string;
  B_CLASS_ID?: string;
  M_CLASS_ID?: string;
  S_CLASS_ID?: string;
  CUSTODIAN_NO?: string;
  CUSTODY_ORG_ID?: string;
  ITEM_NAME?: string;
}

/**
 * 資產 popup 查詢資料列
 */
export interface ASS13040AssetQueryRow {
  ASSET_NO?: string;
  ASSET_NAME?: string;
  UNIT?: string;
  STATUS?: string;
  BUY_AMT?: number;
  CHANGE_AMT?: number;
  TOTAL_AMT?: number;
  ITEM_NO?: string;
  NOTES?: string;
}

/**
 * 後端若回傳巢狀查詢資料時的包裝型別
 */
export interface ASS13040AssetQueryDataWrapper {
  QueryData?: ASS13040AssetQueryRow[];
  TotalRows?: number;
  TotalCount?: number;
}
