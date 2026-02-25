/**
 * ASS11070 查詢 Request
 */
export interface QueryASS11070Request {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: { field: string; order: number }[];
  STO_NO?: string;
  CRT_Date_S?: string;
  CRT_Date_E?: string;
  PR_STAFF_ID?: string;
  PR_STAFF_NAME?: string;
  VENDOR_ID?: string;
  MANGER_TYPE?: string;
  VENDOR_NAME?: string;
  CONTACT_STAFF?: string;
  CONTACT_TEL?: string;
  CONTACT_MOBILE_PHONE?: string;
}

/**
 * ASS11070 查詢 Response
 */
export interface QueryASS11070Response {
  ID?: number;
  STO_NO?: string;
  CRT_Date?: string;
  VENDOR_ID?: string;
  VENDOR_NAME?: string;
  CONTACT_STAFF?: string;
  CONTACT_TEL?: string;
  CONTACT_MOBILE_PHONE?: string;
}

/**
 * ASS11070 查詢回應包裝（後端可能回傳 QueryData/Data）
 */
export interface QueryASS11070DataWrapper {
  TotalCount?: number;
  QueryData?: QueryASS11070Response[];
  Data?: QueryASS11070Response[];
}

/**
 * ASS11070 明細 Request
 */
export interface DetailASS11070Request {
  VENDOR_ID: string;
}

/**
 * ASS11070 明細 Response
 * Update request 需與此型別一致
 */
export interface DetailASS11070Response {
  STO_NO?: string;
  CRT_Date?: string;
  VENDOR_ID?: string;
  VENDOR_NAME?: string;
  VENDOR_NAME_E?: string;
  PR_STAFF_ID?: string;
  PR_STAFF_NAME?: string;
  TAX_ADDR?: string;
  CONTACT_STAFF?: string;
  CONTACT_TITLE?: string;
  CONTACT_TEL?: string;
  CONTACT_TEL_EXTENSION?: string;
  CONTACT_MOBILE_PHONE?: string;
  CONTACT_EMAIL?: string;
  CONTACT_FAX?: string;
  CHARGE_STAFF?: string;
  COMPANY_ADDRESS?: string;
  VENDOR_REG_ADDR?: string;
  PAY_TYPE?: string;
  MANGER_TYPE?: string;
  TICKET_PERIOD?: string;
  SERVICE_ITEM?: string;
  NOTES?: string;
}

/**
 * ASS11070 新增 Request（align-all-new）
 */
export type InsertASS11070Request = DetailASS11070Response;

/**
 * ASS11070 更新 Request（與 Detail response 同型）
 */
export type UpdateASS11070Request = DetailASS11070Response;

// 相容既有命名，避免其他引用爆掉
export type ASS11070Data = QueryASS11070Response;
export type ASS11070QueryRequest = QueryASS11070Request;
export type ASS11070QueryDataWrapper = QueryASS11070DataWrapper;
export type ASS11070InsertRequest = InsertASS11070Request;
export type ASS11070UpdateRequest = UpdateASS11070Request;
