import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

// ==================== Request 介面 ====================

/**
 * 廠商資料查詢
 */
export interface QueryASS11060Request extends BaseQueryRequest {
  /** 廠商代號 */
  VEN_No?: string | null;
  /** 統一編號 */
  VEN_Uniform?: string | null;
  /** 廠商名稱 */
  VEN_Name?: string | null;
  /** 廠商英文名稱 */
  VEN_EngName?: string | null;
  /** 廠商簡稱 */
  VEN_ShortName?: string | null;
  /** 負責人 */
  CHARGE_STAFF?: string | null;
  /** 負責人職稱 */
  CHARGE_TITLE?: string | null;
  /** 負責人身分證 */
  CHARGE_PID?: string | null;
  /** 負責人電話 */
  CHARGE_TEL?: string | null;
  /** 負責人地址 */
  CHARGE_ADDR?: string | null;
  /** 負責人Email */
  CHARGE_EMAIL?: string | null;
  /** 公司登記地址 */
  VEN_Address?: string | null;
  /** 公司登記電話 */
  VEN_Tel?: string | null;
  /** 公司傳真 */
  VEN_Fax?: string | null;
  /** 訂貨地址 */
  ORDER_ADDR?: string | null;
  /** 訂貨電話 */
  ORDER_TEL?: string | null;
  /** 訂貨傳真 */
  ORDER_FAX?: string | null;
  /** 工廠地址 */
  FACTO_ADDR?: string | null;
  /** 工廠電話 */
  FACTO_TEL?: string | null;
  /** 工廠傳真 */
  FACTO_FAX?: string | null;
  /** 交貨方式 */
  DELIVERY?: string | null;
  /** 退貨方式 */
  RETURN_ORDER?: string | null;
  /** 交貨期限 */
  DELIVERY_LIMIT?: number | null;
  /** 備註 */
  VEN_Remark?: string | null;
}

/**
 * 廠商資料更新
 */
export interface UpdateASS11060Request {
  /** 廠商代號 */
  VEN_No: string;
  /** 訂貨地址 */
  ORDER_ADDR?: string | null;
  /** 訂貨電話 */
  ORDER_TEL?: string | null;
  /** 訂貨傳真 */
  ORDER_FAX?: string | null;
  /** 工廠地址 */
  FACTO_ADDR?: string | null;
  /** 工廠電話 */
  FACTO_TEL?: string | null;
  /** 工廠傳真 */
  FACTO_FAX?: string | null;
  /** 交貨方式 */
  DELIVERY?: string | null;
  /** 交貨期限 */
  DELIVERY_LIMIT?: number | null;
  /** 退貨方式 */
  RETURN_ORDER?: string | null;
  /** 備註 */
  VEN_Remark?: string | null;
}

// ==================== Response 介面 ====================

/**
 * 廠商資料查詢回應 (外層包裝)
 */
export interface QueryASS11060DataWrapper {
  TotalCount: number;
  TotalPages: number;
  Data: QueryASS11060Response[];
}

/**
 * 廠商資料查詢回應
 */
export interface QueryASS11060Response {
  /** 廠商代號 */
  VEN_No?: string | null;
  /** 統一編號 */
  VEN_Uniform?: string | null;
  /** 廠商名稱 */
  VEN_Name?: string | null;
  /** 廠商英文名稱 */
  VEN_EngName?: string | null;
  /** 廠商簡稱 */
  VEN_ShortName?: string | null;
  /** 公司登記地址 */
  VEN_Address?: string | null;
  /** 負責人 */
  CHARGE_STAFF?: string | null;
  /** 負責人職稱 */
  CHARGE_TITLE?: string | null;
  /** 負責人身分證 */
  CHARGE_PID?: string | null;
  /** 負責人電話 */
  CHARGE_TEL?: string | null;
  /** 負責人地址 */
  CHARGE_ADDR?: string | null;
  /** 負責人Email */
  CHARGE_EMAIL?: string | null;
}
