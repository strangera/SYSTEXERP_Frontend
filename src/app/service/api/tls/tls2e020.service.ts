import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@service/system/auth.service';
import { environment } from 'src/environments/environment';
import { SortMeta } from 'primeng/api';

// 定義 executeTLS2E020 的 Request Body
export interface Tls2e020ExecuteBody {
  sam_yyymm: string;
  sam_termno: number;
  money_type: number;
  tlt_no: string;
}

// 定義 executeTLS2E020 的 Response Data
export interface Tls2e020ExecuteData {
  ErrCode: number;
  ErrMsg: string;
}

// 定義 queryTLS2E020 的 Request Body (包含分頁和排序)
export interface Tls2e020QueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[]; // 您的 Schema 中 SortBy 是選填，因此使用 ?
  sam_yyymm: string;
  money_type: number;
  sam_termno: number;
}

// 定義 queryTLS2E020 的單筆 Data 紀錄介面
export interface Tls2e020Data {
  sam_yyymm: string;
  sam_termno: number;
  sam_datebeg: string;
  sam_dateend: string;
  sam_num: string;
  sam_confirm: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  salm_id: number;
}

// 定義 lockTLS2E020 的 Request Body
export interface Tls2e020LockBody {
  sam_yyymm: string;
  sam_termno: string;
  money_type: string;
}
// lockTLS2E020 的 Response Data (Data 欄位是一個數字 0)
export type Tls2e020LockData = number;

const API_BASE_URL = environment.ApiUrl + '/TLS0000/TLS2000';

@Injectable({
  providedIn: 'root'
})
export class Tls2e020Service {

  constructor(private http: HttpClient) { }

  /**
   * 專櫃抽成金額結算作業 - 執行結算 (executeTLS2E020)
   * @param executeBody 結算條件
   * @returns 包含執行結果的 Observable (ErrCode, ErrMsg)
   */
  executeTls2e020(executeBody: Tls2e020ExecuteBody): Observable<ApiResponse<Tls2e020ExecuteData>> {
    const url = `${API_BASE_URL}/executeTLS2E020`;
    return this.http.post<ApiResponse<Tls2e020ExecuteData>>(url, executeBody);
  }

  /**
   * 專櫃抽成金額結算作業 - 查詢資料 (queryTLS2E020)
   * @param queryBody 查詢條件 (含分頁)
   * @returns 包含抽成結算清單的 Observable
   */
  queryTls2e020(queryBody: Tls2e020QueryBody): Observable<ApiResponse<Tls2e020Data[]>> {
    const url = `${API_BASE_URL}/queryTLS2E020`;
    return this.http.post<ApiResponse<Tls2e020Data[]>>(url, queryBody);
  }

  /**
   * 專櫃抽成金額結算作業 - 鎖定資料 (lockTLS2E020)
   * @param lockBody 鎖定條件
   * @returns 包含鎖定結果的 Observable (回傳數字 0)
   */
  lockTls2e020(lockBody: Tls2e020LockBody): Observable<ApiResponse<Tls2e020LockData>> {
    const url = `${API_BASE_URL}/lockTLS2E020`;
    return this.http.post<ApiResponse<Tls2e020LockData>>(url, lockBody);
  }
}
