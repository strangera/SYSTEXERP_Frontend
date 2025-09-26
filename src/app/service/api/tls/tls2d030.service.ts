import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '@service/system/auth.service';
import { SortMeta } from 'primeng/api';

// executeTLS2D030 的請求主體
export interface ExecuteTls2d030Request {
  sam_yyymm: string;
  sam_termno: number;
  tlt_no: string;
  tlt_floor: string;
}

// queryTLS2D030 的請求主體
export interface QueryTls2d030Request {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  sam_yyymm: string;
  sam_termno: number;
  tlt_no: string;
  tlt_floor: string;
}
// 查詢結果中的單一資料項目
export interface QueryTls2d030DataItem {
  sam_yyymm: string;
  money_type: string;
  sam_termno: number;
  CAP_Type: string;
  CRT_Date: string;
  CRT_USR_Name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Tls2d030Service {

  // API 的基礎路徑
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  /**
   * 執行專櫃代扣款結算作業 (TLS2D030)
   * @param body 包含 sam_yyymm, sam_termno, tlt_no, tlt_floor 的請求主體
   * @returns 成功的 HTTP 200 回應，通常是一個通用成功訊息。
   */
  executeTLS2D030(body: ExecuteTls2d030Request): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/executeTLS2D030`;
    return this.http.post<ApiResponse<any>>(url, body);
  }

  /**
   * 查詢專櫃代扣款結算作業的結果 (TLS2D030)
   * @param body 包含查詢條件、分頁和排序資訊的請求主體
   * @returns 包含 QueryTls2d030DataItem 陣列的 API 回應。
   */
  queryTLS2D030(body: QueryTls2d030Request): Observable<ApiResponse<QueryTls2d030DataItem[]>> {
    const url = `${this.apiUrl}/queryTLS2D030`;
    return this.http.post<ApiResponse<QueryTls2d030DataItem[]>>(url, body);
  }
}
