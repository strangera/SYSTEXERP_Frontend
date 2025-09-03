import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './tls23030.service';
import { Observable } from 'rxjs';

export interface QueryTls43020Request {
  PageSize?: number,
  PageIndex?: number,
  SortBy?: { field: string, order: number }[],
  NOT_No?: string,
  NOT_Date?: string,
  NOT_BegDate_Start?: string,
  NOT_BegDate_End?: string,
  NOT_EndDate_Start?: string,
  NOT_EndDate_End?: string,
  NOT_File?: string,
  NOT_Status?: string,
}

export interface VerifyTls43020Request {
  ID: number,
  NOT_Status: string,
  NOT_No: string
}

export interface QueryTls43020Response {
  ID: number,
  NOT_No: string,
  NOT_Date: string,
  NOT_BegDate: string,
  NOT_EndDate: string,
  NOT_Status: string,
  NOT_Priority: number,
  NOT_File: string,
  NOT_Note?: string,
  NOT_PlayTime?: number,
  NOT_DtlLimit?: string,
  NOT_AprvDate?: string,
  NOT_AprvUsrNo?: string,
  NOT_AprvUsrName?: string,
  NOT_DelDate?: string,
  NOT_DelUsrNo?: string,
  NOT_DelUsrName?: string,
  CRT_Date?: string,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: string,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

@Injectable({
  providedIn: 'root'
})
export class Tls43020Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢POS50011 廣告資訊設定檔 的 API 呼叫
   * @param body 統一的查詢請求物件 (QueryTls43020Request)
   * @returns 包含 QueryTls43020Response 結構的 API 回傳結果
   */
  queryTls43020(body: QueryTls43020Request): Observable<ApiResponse<QueryTls43020Response[]>> {
    return this.http.post<ApiResponse<QueryTls43020Response[]>>(`${this.apiUrl}/queryTLS43020`, body);
  }

  /**
   * 審核TLS43020資料表 的 API 呼叫
   * @param body 審核請求物件 (VerifyTls43020Request)
   * @returns 包含 ApiResponse 的 API 回傳結果
   */
  verifyTls43020(body: VerifyTls43020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/verifyTLS43020`, body);
  }

  /**
   * 反審核TLS43020資料表 的 API 呼叫
   * @param body 反審核請求物件 (VerifyTls43020Request)
   * @returns 包含 ApiResponse 的 API 回傳結果
   */
  unverifyTls43020(body: VerifyTls43020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/unverifyTLS43020`, body);
  }
}
