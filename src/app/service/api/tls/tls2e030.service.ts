import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 確保路徑正確
import { SortMeta } from 'primeng/api'; // 確保路徑正確
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // 確保路徑正確

// --- 介面定義 ---

// 定義 estTLS2E030 (試算) 的 Request Body
export interface Tls2e030EstBody {
  sam_yyymm: string;
  sam_termno: number;
  money_type: string;
  tlt_no: string;
  isForce?: boolean; // 新增：是否強制重算
}

// 定義 queryTLS2E030 (查詢) 的 Request Body (包含分頁和排序)
export interface Tls2e030QueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[]; // 使用 SortMeta[]
  sam_yyymm: string;
  money_type: string; // 注意：Schema 範例中 money_type 是 string
  sam_termno: number;
  tlt_no: string;
}

// 定義 queryTLS2E030 的單筆 Data 紀錄介面
export interface Tls2e030Data {
  CRT_Date: string;
  sam_yyymm: string;
  tlt_no: string;
  tlt_name: string;
  remarks: string;
  CRT_USR_No: string;
  // 注意：sam_termno 在 Request Body 裡，但 Response Data 範例中沒有，如果需要請自行補上。
}

// --- Service 實作 ---

const API_BASE_URL = environment.ApiUrl + '/TLS0000/TLS2000';

@Injectable({
  providedIn: 'root'
})
export class Tls2e030Service {

  constructor(private http: HttpClient) { }

  /**
   * 專櫃帳款試算作業 - 執行試算 (estTLS2E030)
   * @param estBody 試算條件
   * @returns 包含執行結果的 Observable
   */
  estTls2e030(estBody: Tls2e030EstBody): Observable<ApiResponse<any>> {
    const url = `${API_BASE_URL}/estTLS2E030`;
    // 由於 Swagger 範例回傳 Data: [{}], 我們使用 Tls2e030EstData[]
    return this.http.post<ApiResponse<any[]>>(url, estBody);
  }

  /**
   * 專櫃帳款試算作業 - 查詢資料 (queryTLS2E030)
   * @param queryBody 查詢條件 (含分頁)
   * @returns 包含專櫃帳款試算清單的 Observable
   */
  queryTls2e030(queryBody: Tls2e030QueryBody): Observable<ApiResponse<Tls2e030Data[]>> {
    const url = `${API_BASE_URL}/queryTLS2E030`;
    return this.http.post<ApiResponse<Tls2e030Data[]>>(url, queryBody);
  }
}
