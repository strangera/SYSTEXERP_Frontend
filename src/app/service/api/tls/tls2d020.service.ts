import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- 1. 定義請求介面 (Request Interfaces) ---

// executeTLS2D020 的請求主體
export interface ExecuteRequest {
  sam_yyymm: string;
  money_type: number;
  tlt_no: string;
  tlt_floor: string;
}
// queryTLS2D020 的請求主體
export interface QueryRequest {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  sam_yyymm: string;
  money_type: number;
  tlt_no: string;
  tlt_floor: string;
}

// --- 2. 定義回應介面 (Response Interfaces) ---

// 查詢結果中的單一資料項目
export interface QueryDataItem {
  tlt_no: string;
  source_type: string;
  CAP_Item: string;
  CAP_Name: string;
  AccNo: string;
  sam_yyymm: string;
  GUI_FLAG: string;
  tpy_amt: number;
  tpy_tax: number;
}

// 通用的錯誤結構
export interface ApiError {
  Code: string;
  Message: string;
  Details: string;
}
@Injectable({
  providedIn: 'root'
})
export class Tls2d020Service {

  // API 的基礎路徑
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  /**
   * 執行專櫃代扣款試算作業 (TLS2D020)
   * @param body 包含 sam_yyymm, sam_termno, tlt_no, tlt_floor 的請求主體
   * @returns 成功的 HTTP 200 回應。根據 Swagger，回應主體可能為空，或者是一個通用的成功訊息結構。這裡使用 ApiResponse<any>。
   */
  executeTLS2D020(body: ExecuteRequest): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/executeTLS2D020`;
    return this.http.post<ApiResponse<any>>(url, body)
  }

  /**
   * 查詢專櫃代扣款試算作業的結果 (TLS2D020)
   * @param body 包含查詢條件、分頁和排序資訊的請求主體
   * @returns 包含 QueryDataItem 陣列的 API 回應
   */
  queryTLS2D020(body: QueryRequest): Observable<ApiResponse<QueryDataItem[]>> {
    const url = `${this.apiUrl}/queryTLS2D020`;
    return this.http.post<ApiResponse<QueryDataItem[]>>(url, body)
  }
}
