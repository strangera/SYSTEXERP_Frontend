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
  HOLD_EMP_ID?: string | null;
  USE_EMP_ID?: string | null;
  LOCATION_ID?: string | null;
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
  DEPRE_SDATE?: string | null;
  SOURCE_STATUS?: string | null;
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
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
}

export interface InsertASS13010Response {
  Message?: string | null;
}

