/**
 * detailASS13010 契約（來源：Swagger `/ASS0000/ASS1000/detailASS13010`）
 */
export interface DetailASS13010Request {
  /** 多筆 ID 以逗號分隔 */
  ID: string;
}

/** detailASS13010 回應 Data（欄位名與 ASS13080 查詢明細不同） */
export interface DetailASS13010Response {
  ID?: number | null;
  ASSET_ID?: string | null;
  GET_DATE?: string | null;
  ASSET_STATUS?: string | null;
  HOLD_EMP_ID?: string | null;
  HOLD_ORG_ID?: string | null;
  USE_EMP_ID?: string | null;
  USE_ORG_ID?: string | null;
  DEPRE_YN?: string | null;
  STYPE_ID?: string | null;
  STYPE_ID2?: string | null;
  GET_COST?: number | null;
  SUBPOENA_ID?: string | null;
  NOTES?: string | null;
  PURCHASE_NOTES?: string | null;
  EXP_YEAR?: number | null;
  ONSALE_AMT?: number | null;
  LOCATION_ID?: string | null;
  FIX_N?: string | null;
  FORG_ID?: string | null;
  BILL_DATE?: string | null;
  HANDLE_DATE?: string | null;
  HANDLE_NOTE?: string | null;
  HANDLE_VENDOR?: string | null;
  HANDLE_VID?: string | null;
  HANDLE_VKEY?: number | null;
  RESI_VALUE?: number | null;
  STYPE_D?: string | null;
  STYPE_C?: string | null;
  DEPRE_ID?: string | null;
  GET_COST_TAX?: number | null;
  USE_STATUS?: string | null;
  DEPRE_AMT?: number | null;
  EXP_MONTH?: number | null;
  ORI_ORG_ID?: string | null;
  ORI_EMP_ID?: string | null;
  ASSET_INS_ID?: string | null;
  FIX_AMT?: number | null;
  GOODS_ID?: string | null;
  SUPPLIER_ID?: string | null;
  EQUIP_ID?: string | null;
  DEPRE_SDATE?: string | null;
  SOURCE_STATUS?: string | null;
  TAL_DEPRE_AMT?: number | null;
  TAL_DEPRE_MON?: number | null;
  SUBCHECK_ID?: string | null;
  FIR_GET_COST?: number | null;
  FIR_EXP_YEAR?: number | null;
  LEND_TYPE?: string | null;
  ORI_ASSET_ID?: string | null;
  ORI_IMPORT_DEPRE_MON?: number | null;
  ORI_IMPORT_DEPRE_AMT?: number | null;
  REDU_CODE?: string | null;
  ONSALE_RATE?: number | null;
  ONSALE_NORATE_AMT?: number | null;
  EXTEND_EXP_YEAR?: number | null;
  DAMAGEM_ID?: string | null;
  Warranty_YEAR?: number | null;
}
