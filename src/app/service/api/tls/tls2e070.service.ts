import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 確保路徑正確
import { SortMeta } from 'primeng/api'; // 確保路徑正確
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // 確保路徑正確

// --- 共用介面定義 ---

// 試算 (estTLS2E070) 及 結帳紀錄查詢 (queryRecTLS2E070) 的 Request Body
export interface Tls2e070QueryRecEstBody {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
  sam_yyymm: string;
  sam_termno: number;
  money_type: string;
  tlt_no: string;
}

// 結算作業查詢 (queryTLS2E070) 的 Request Body
export interface Tls2e070QueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
  sam_yyymm: string;
}

// --- API Response Data 介面定義 ---x

// estTLS2E070 (試算) Response Data
// Swagger 範例為 Data: [{}], 這裡使用通用介面

// queryRecTLS2E070 (結帳紀錄查詢) 的單筆 Data 紀錄介面
export interface Tls2e070RecData {
  CRT_Date: string;
  sam_yyymm: string;
  tlt_no: string;
  tlt_name: string;
  remarks: string;
  CRT_USR_No: string;
}

// queryTLS2E070 (查詢) 的單筆 Data 紀錄介面
export interface Tls2e070Data {
  cls_Month: string;
  cls_termno: number;
  sale_lock_date: string;
  sale_lock_USR_No: string;
  sale_lock: string; // 鎖定狀態 (e.g., Y/N)
}

// updateTLS2E070 (更新鎖定狀態) 的 Request Body
export interface Tls2e070UpdateBody {
  sam_yyymm: string;   // 結帳年月
  money_type: string;  // 結帳方式
  sam_termno: number;  // 帳次
  tlt_no?: string;     // 專櫃編號 (選填)
}

// updateTLS2E070 的 Response Data
// 假設回傳狀態碼 200 OK，Data 欄位可能為空或代表成功的值，這裡使用通用類型
export type Tls2e070UpdateData = any;

const API_BASE_URL = environment.ApiUrl + '/TLS0000/TLS2000';

@Injectable({
  providedIn: 'root'
})
export class Tls2e070Service {

  constructor(private http: HttpClient) { }

  /**
   * 專櫃帳款結算作業 - 執行試算 (estTLS2E070)
   * @param estBody 試算條件 (含分頁)
   * @returns 包含執行結果的 Observable
   */
  estTLS2E070(estBody: Tls2e070QueryRecEstBody): Observable<ApiResponse<any>> {
    const url = `${API_BASE_URL}/estTLS2E070`;
    return this.http.post<ApiResponse<any>>(url, estBody);
  }

  /**
   * 專櫃帳款結算作業 - 結帳紀錄查詢 (queryRecTLS2E070)
   * @param queryBody 查詢條件 (含分頁)
   * @returns 包含結帳紀錄清單的 Observable
   */
  queryRecTLS2E070(queryBody: Tls2e070QueryRecEstBody): Observable<ApiResponse<Tls2e070RecData[]>> {
    const url = `${API_BASE_URL}/queryRecTLS2E070`;
    return this.http.post<ApiResponse<Tls2e070RecData[]>>(url, queryBody);
  }

  /**
   * 專櫃帳款結算作業 - 查詢 (queryTLS2E070)
   * @param queryBody 查詢條件 (含分頁)
   * @returns 包含結算狀態清單的 Observable
   */
  queryTLS2E070(queryBody: Tls2e070QueryBody): Observable<ApiResponse<Tls2e070Data[]>> {
    const url = `${API_BASE_URL}/queryTLS2E070`;
    return this.http.post<ApiResponse<Tls2e070Data[]>>(url, queryBody);
  }

  /**
   * 專櫃帳款結算作業 - 更新鎖定狀態 (updateTLS2E070)
   * @param updateBody 包含要更新的 idList
   * @returns 包含更新結果的 Observable
   */
  updateTLS2E070(updateBody: Tls2e070UpdateBody): Observable<ApiResponse<Tls2e070UpdateData>> {
    const url = `${API_BASE_URL}/updateTLS2E070`;
    // 確保這裡傳送的是符合後端 Request 結構的物件
    return this.http.post<ApiResponse<Tls2e070UpdateData>>(url, updateBody);
  }
}
