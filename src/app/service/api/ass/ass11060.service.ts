import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ==================== Request 介面 ====================

/**
 * 廠商資料查詢
 */
export interface QueryASS11060Request extends BaseQueryRequest {
  /** 廠商代號 */
  VENDOR_ID?: string | null;
  /** 統一編號 */
  GUI_ID?: string | null;
  /** 廠商名稱 */
  VENDOR_NAME?: string | null;
  /** 廠商英文名稱 */
  VENDOR_NAME_E?: string | null;
  /** 廠商簡稱 */
  VENDOR_NAME_S?: string | null;
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
  VENDOR_REG_ADDR?: string | null;
  /** 公司登記電話 */
  VENDOR_REG_TEL?: string | null;
  /** 公司傳真 */
  VENDOR_FAX?: string | null;
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
  NOTES?: string | null;
}

// ==================== Response 介面 ====================

/**
 * 廠商資料更新
 */
export interface UpdateASS11060Request {
  /** 廠商代號 */
  VENDOR_ID: string;
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
  NOTES?: string | null;
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
  /** 組織編號 */
  STO_NO?: string | null;
  /** 廠商代號 */
  VENDOR_ID?: string | null;
  /** 統一編號 */
  GUI_ID?: string | null;
  /** 廠商名稱 */
  VENDOR_NAME?: string | null;
  /** 廠商英文名稱 */
  VENDOR_NAME_E?: string | null;
  /** 廠商簡稱 */
  VENDOR_NAME_S?: string | null;
  /** 公司登記地址 */
  VENDOR_REG_ADDR?: string | null;
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

@Injectable({
  providedIn: 'root'
})
export class ASS11060Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 廠商資料查詢
   */
  queryASS11060(params: QueryASS11060Request): Observable<ApiResponse<QueryASS11060DataWrapper>> {
    return this.http.post<ApiResponse<QueryASS11060DataWrapper>>(`${this.apiUrl}/queryASS11060`, params);
  }

  /**
   * 廠商資料更新
   */
  updateASS11060(params: UpdateASS11060Request): Observable<ApiResponse<Record<string, never>>> {
    return this.http.post<ApiResponse<Record<string, never>>>(`${this.apiUrl}/updateASS11060`, params);
  }
}
