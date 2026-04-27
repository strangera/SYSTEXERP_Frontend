export interface QueryASS13010SortField {
  field: string;
  order: number;
}

export interface QueryASS13010Request {
  PageSize: number;
  PageIndex: number;
  OrderBy?: string | null;
  Offset?: number | null;
  SortBy?: QueryASS13010SortField[] | null;
  MID?: number | null;
  STO_NO?: string | null;
  ASSET_ID?: string | null;
  GOODS_ID?: string | null;
  ORI_ASSET_ID?: string | null;
  ASSET_STATUS?: string | null;
  DEPRE_YN?: string | null;
  SUBPOENA_ID?: string | null;
  GET_DATE_S?: string | null;
  GET_DATE_E?: string | null;
  GET_COST_S?: number | null;
  GET_COST_E?: number | null;
  BILL_DATE_S?: string | null;
  BILL_DATE_E?: string | null;
  EXP_YEAR_S?: number | null;
  EXP_YEAR_E?: number | null;
  RESI_VALUE_S?: number | null;
  RESI_VALUE_E?: number | null;
  ONSALE_AMT_S?: number | null;
  ONSALE_AMT_E?: number | null;
  HANDLE_DATE_S?: string | null;
  HANDLE_DATE_E?: string | null;
  HOLD_EMP_ID?: string | null;
  HOLD_ORG_ID?: string | null;
  USE_EMP_ID?: string | null;
  USE_ORG_ID?: string | null;
  LOCATION_ID?: string | null;
  SUPPLIER_ID?: string | null;
  STYPE_D?: string | null;
  STYPE_C?: string | null;
  STYPE_ID?: string | null;
  STYPE_ID2?: string | null;
  EQUIP_ID?: string | null;
  FIX_N?: string | null;
  LEND_TYPE?: string | null;
  HANDLE_VENDOR?: string | null;
  HANDLE_VID?: string | null;
  HANDLE_NOTE?: string | null;
  PURCHASE_NOTES?: string | null;
}

export interface QueryASS13010Response {
  ID: number;
  ASSET_ID: string | null;
  GOODS_ID: string | null;
  ASSET_STATUS: string | null;
  ASSET_STATUS_NAME: string | null;
  DEPRE_YN: string | null;
  DEPRE_YN_NAME: string | null;
  SUBPOENA_ID: string | null;
  GET_DATE: string | null;
  GET_COST: number | null;
  BILL_DATE: string | null;
  DEPRE_ID: string | null;
  TAL_DEPRE_AMT: number | null;
  TAL_DEPRE_MON: number | null;
}

export interface QueryASS13010Result {
  QueryData: QueryASS13010Response[];
  TotalRows: number;
  TotalPages: number;
}

export interface QueryASS13010ResultApiResponse {
  Status: string;
  Data: QueryASS13010Result | null;
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  } | null;
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  } | null;
  Message?: string | null;
  TotalCount?: number;
  TotalPage?: number;
}

export interface DetailASS13010Request {
  ID: string;
}

export interface DetailASS13010Response {
  ID: number;
  ASSET_ID: string | null;
  GET_DATE: string | null;
  ASSET_STATUS: string | null;
  HOLD_EMP_ID: string | null;
  HOLD_ORG_ID: string | null;
  USE_EMP_ID: string | null;
  USE_ORG_ID: string | null;
  DEPRE_YN: string | null;
  STYPE_ID: string | null;
  STYPE_ID2: string | null;
  GET_COST: number | null;
  SUBPOENA_ID: string | null;
  NOTES: string | null;
  PURCHASE_NOTES: string | null;
  EXP_YEAR: number | null;
  ONSALE_AMT: number | null;
  LOCATION_ID: string | null;
  FIX_N: string | null;
  FORG_ID: string | null;
  BILL_DATE: string | null;
  HANDLE_DATE: string | null;
  HANDLE_NOTE: string | null;
  HANDLE_VENDOR: string | null;
  HANDLE_VID: string | null;
  HANDLE_VKEY: number | null;
  RESI_VALUE: number | null;
  STYPE_D: string | null;
  STYPE_C: string | null;
  DEPRE_ID: string | null;
  GET_COST_TAX: number | null;
  USE_STATUS: string | null;
  DEPRE_AMT: number | null;
  EXP_MONTH: number | null;
  ORI_ORG_ID: string | null;
  ORI_EMP_ID: string | null;
  ASSET_INS_ID: string | null;
  FIX_AMT: number | null;
  GOODS_ID: string | null;
  SUPPLIER_ID: string | null;
  EQUIP_ID: string | null;
  DEPRE_SDATE: string | null;
  SOURCE_STATUS: string | null;
  TAL_DEPRE_AMT: number | null;
  TAL_DEPRE_MON: number | null;
  SUBCHECK_ID: string | null;
  FIR_GET_COST: number | null;
  FIR_EXP_YEAR: number | null;
  LEND_TYPE: string | null;
  ORI_ASSET_ID: string | null;
  ORI_IMPORT_DEPRE_MON: number | null;
  ORI_IMPORT_DEPRE_AMT: number | null;
  REDU_CODE: string | null;
  ONSALE_RATE: number | null;
  ONSALE_NORATE_AMT: number | null;
  EXTEND_EXP_YEAR: number | null;
  DAMAGEM_ID: string | null;
  Warranty_YEAR: number | null;
}

// ==================== 匯出 PDF ====================
export interface ExportPDFASS13010Request {
  ID: string;
}

export interface InsertASS13010Request {
  MID?: number | null;
  STO_NO?: string | null;
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
  /** 送出可為 Date，由 HTTP interceptor 轉成與其他日期欄位相同的時間字串 */
  DEPRE_SDATE?: string | Date | null;
  SOURCE_STATUS?: string | null;
  SUBCHECK_ID?: string | null;
  FIR_GET_COST?: number | null;
  FIR_EXP_YEAR?: number | null;
  LEND_TYPE?: string | null;
  ORI_ASSET_ID?: string | null;
  TAL_DEPRE_AMT?: number | null;
  TAL_DEPRE_MON?: number | null;
  REDU_CODE?: string | null;
  ONSALE_RATE?: number | null;
  ONSALE_NORATE_AMT?: number | null;
  EXTEND_EXP_YEAR?: number | null;
  DAMAGEM_ID?: string | null;
  Warranty_YEAR?: number | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
}

export interface InsertASS13010Response {
  Message?: string | null;
}

// ==================== 更新 ====================
/**
 * 更新資產維護作業（updateASS13010）
 *
 * 欄位依你提供的 UpdateASS13010Request 截圖：
 * - 判斷是否已攤提：TAL_DEPRE_AMT > 0（此判斷在前端用於鎖欄位）
 * - 後端 update 需要：ID/GET_DATE/ASSET_STATUS/EQUIP_ID/PURCHASE_NOTES(採購說明)/RESI_VALUE(預留殘值)/EXP_YEAR/EXP_MONTH/HOLD_EMP_ID/USE_EMP_ID/DEPRE_SDATE/TAL_DEPRE_AMT/TAL_DEPRE_MON/UPD_USR_No/UPD_USR_Name（購入金額無對應欄位；EXP_MONTH 為原折舊年限(月)，TAL_DEPRE_MON 為已攤提月數）
 */
export interface UpdateASS13010Request {
  ID: number;
  GET_DATE?: string | null;
  /** 購入金額（GET_COST） */
  GET_COST?: number | null;
  ASSET_STATUS?: string | null;
  EQUIP_ID?: string | null;
  PURCHASE_NOTES?: string | null;
  RESI_VALUE?: number | null;
  EXP_YEAR?: number | null;
  EXP_MONTH?: number | null;
  HOLD_EMP_ID?: string | null;
  USE_EMP_ID?: string | null;
  /** 送出可為 Date，由 HTTP interceptor 轉成與其他日期欄位相同的時間字串 */
  DEPRE_SDATE?: string | Date | null;
  TAL_DEPRE_AMT?: number | null;
  TAL_DEPRE_MON?: number | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

export interface UpdateASS13010Response {
  Message?: string | null;
}

// ==================== 刪除 ====================
export interface DeleteASS13010Request {
  IDS: number[];
}

export interface DeleteASS13010ResultApiResponse {
  Status?: string;
  Data?: {
    Message?: string | null;
  } | null;
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  } | null;
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  } | null;
  Message?: string | null;
  TotalCount?: number;
  TotalPage?: number;
}

