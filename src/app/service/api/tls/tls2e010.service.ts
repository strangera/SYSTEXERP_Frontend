import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 定義 executeTLS2E010 的 Request Body
export interface Tls2e010ExecuteBody {
  sam_yyymm: string;
  tlt_no: string;
}

// 定義 executeTLS2E010 的 Response Data
// 根據 Swagger 範例，成功時 Data 欄位包含 ErrCode 和 ErrMsg
export interface Tls2e010ExecuteData {
  ErrCode: number;
  ErrMsg: string;
}

// 定義 queryTLS2E010 的 Request Body (包含分頁和排序)
export interface Tls2e010QueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  sam_yyymm_start: string;
  sam_yyymm_end: string;
  tlt_no: string;
}

// 定義 queryTLS2E010 的單筆 Data 紀錄介面
export interface Tls2e010Data {
  tlt_no: string;
  tlt_name: string;
  sam_yyymm: string;
  rent_net: number; // 租金淨額
  rent_tax: number; // 租金稅額
  rent_amt: number; // 租金總金額
}

// 定義 lockTLS2E010 的 Request Body
export interface Tls2e010LockBody {
  sam_yyymm: string;
  sam_termno: string;
  money_type: string;
}

// lockTLS2E010 的 Response Data
// 根據 Swagger 範例，成功時 Data 欄位是一個數字 (0)
export type Tls2e010LockData = number;


// ==========================================================
// 2. Service 實作
// ==========================================================

const API_BASE_URL = environment.ApiUrl + '/TLS0000/TLS2000';

@Injectable({
  providedIn: 'root'
})
export class Tls2e010Service {

  constructor(private http: HttpClient) { }

  /**
   * 專櫃租金結算作業 - 執行結算 (executeTLS2E010)
   * @param executeBody 結算條件
   * @returns 包含執行結果的 Observable (ErrCode, ErrMsg)
   */
  executeTls2e010(executeBody: Tls2e010ExecuteBody): Observable<ApiResponse<Tls2e010ExecuteData>> {
    const url = `${API_BASE_URL}/executeTLS2E010`;
    return this.http.post<ApiResponse<Tls2e010ExecuteData>>(url, executeBody);
  }

  /**
   * 專櫃租金結算作業 - 查詢資料 (queryTLS2E010)
   * @param queryBody 查詢條件 (含分頁)
   * @returns 包含租金結算清單的 Observable
   */
  queryTls2e010(queryBody: Tls2e010QueryBody): Observable<ApiResponse<Tls2e010Data[]>> {
    const url = `${API_BASE_URL}/queryTLS2E010`;
    return this.http.post<ApiResponse<Tls2e010Data[]>>(url, queryBody);
  }

  /**
   * 專櫃租金結算作業 - 鎖定資料 (lockTLS2E010)
   * @param lockBody 鎖定條件
   * @returns 包含鎖定結果的 Observable (回傳數字 0)
   */
  lockTls2e010(lockBody: Tls2e010LockBody): Observable<ApiResponse<Tls2e010LockData>> {
    const url = `${API_BASE_URL}/lockTLS2E010`;
    return this.http.post<ApiResponse<Tls2e010LockData>>(url, lockBody);
  }
}
