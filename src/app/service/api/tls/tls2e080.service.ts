import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- Interfaces ---

export interface IExportPDFRequest {
  exportList: {
    talent_id: number,
    sam_yyymm: string,
    sad_date_Start: string | Date,
    sad_date_End: string | Date,
    money_type: string,
    money_type_name: string,
    sam_termno: number,
    tlt_term_type: string,
    tlt_term_type_name: string
  }[];
}

export interface IQueryRequest {
  PageSize: number;
  PageIndex: number;
  SortBy?: { field: string; order: number }[];
  tlt_noList?: string[];
  tlt_term_typeList?: string[];
  tlt_floorList?: string[];
  sam_yyymm?: string;
  money_typeList?: string[];
  sam_termnoList?: string[];
  tlt_buildingList?: string[];
  check_typeList?: string[];
  ven_uniform?: string;
}

/**
 * 網路對帳請求介面
 * 根據 Swagger 定義，這結合了查詢條件與 exportList
 */
export interface IOnlineRequest extends Omit<IQueryRequest, 'PageSize' | 'PageIndex'> {
  exportList: {
    mid?: number; // 根據 Swagger 範例新增
    talent_id: number;
    sam_yyymm: string;
    sad_date_Start: string | Date;
    sad_date_End: string | Date;
    money_type: string;
    sam_termno: number;
    tlt_no: string;
    tlt_name: string;
    VEN_Name: string;
    email: string;
  }[];
}

/**
 * AutoMail請求介面
 * 根據 Swagger 定義，這結合了查詢條件與 exportList
 */
export interface IAutoMailRequest extends Omit<IOnlineRequest, 'PageSize' | 'PageIndex'> {
  SMTP_No: string;
}

export interface IQueryData {
  id: number,
  talent_id: number,
  sam_yyymm: string,
  money_type: string,
  money_type_name: string,
  sam_termno: number,
  tlt_term_type: string,
  tlt_term_type_name: string,
  tlt_no: string,
  contract_no: string,
  contract_subno: number,
  tlt_name: string,
  email: string,
  VEN_Name: string,
}

// --- Service ---

@Injectable({
  providedIn: 'root'
})
export class TLS2E080Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 匯出專櫃月對帳單 (PDF)
   */
  exportTLS2E080PDF(data: IExportPDFRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/exportTLS2E080PDF`, data, { responseType: 'blob', observe: 'response' });
  }

  /**
   * 專櫃對帳單查詢
   */
  queryTLS2E080(params: IQueryRequest): Observable<ApiResponse<IQueryData[]>> {
    return this.http.post<ApiResponse<IQueryData[]>>(`${this.apiUrl}/queryTLS2E080`, params);
  }

  /**
   * 預覽/列印專櫃對帳單 PDF 連結
   */
  PrintTLS2E080PDF(data: IExportPDFRequest): Observable<ApiResponse<{ url: string }>> {
    return this.http.post<ApiResponse<{ url: string }>>(`${this.apiUrl}/printTLS2E080PDF`, data);
  }

  /**
   * 網路對帳：將產出的 PDF 儲存至伺服器目錄
   * API: POST /TLS0000/TLS2000/onlineTLS2E080
   * @param data 包含查詢條件與 exportList
   */
  onlineTLS2E080(data: IOnlineRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/onlineTLS2E080`, data);
  }

  /** AutoMail：將對帳單 PDF 儲存至伺服器並發送郵件(郵件採用常駐程式發送) */
  autoMailTLS2E080(data: IAutoMailRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/autoMailTLS2E080`, data);
  }
}
