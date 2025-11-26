import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 定義查詢 Request Body 的介面
// 根據 Swagger/OpenAPI 的 Request Body Schema 進行定義
export interface Tls2e060QueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  adj_no: string;
  adj_date: string; // 格式 '2025-10-17'
  sam_yyymm: string;
}

// 定義單筆 Data 紀錄的介面 (API Response 中 Data 陣列的元素)
// 根據 Swagger/OpenAPI 的 Response Schema 進行定義
export interface Tls2e060Data {
  adj_no: string; // 調整單號
  adj_date: string; // 調整日期 ($date 格式，如 '2025-10-17')
  sam_yyymm: string; // 調整年月
  tlt_no: string; // 專櫃編號
  contract_no: string; // 契約編號
  contract_subno: string; // 版次 (注意：Swagger 範例中是 'contrace_subnostring' 可能是 typo，假設為 'contrace_subno')
  adj_taxtype: string; // 調整稅別 0=免稅, 1=應稅
  adj_amount: number; // 調整金額 ($double)
}

// **--- [新增] 定義下拉選單的資料結構 (Dropdown List Data) ---**
export interface Tls2e060DropDownListData {
  tlt_no: string; // 專櫃編號
  tlt_name: string;
  talent_id: number; // 人才 ID (或專櫃 ID)
  contract_no: string; // 契約編號
  contract_subno: number; // 契約版次
  money_type: string; // 幣別
  sam_termno: number; // 期號
}

// 定義建立 Request Body 的介面
// 根據 Swagger/OpenAPI 的 Request Body Schema 進行定義
export interface Tls2e060CreateBody {
  sam_yyymm: string;
  sam_termno: number;
  tlt_no: string;
  talent_id: number;
  contract_no: string;
  adj_taxtype: string; // 0 或 1
  adj_amount: number;
}
const QUERY_API_URL = environment.ApiUrl + '/TLS0000/TLS2000/queryTLS2E060';
const CREATE_API_URL = environment.ApiUrl + '/TLS0000/TLS2000/createTLS2E060';

// **--- [新增] 下拉選單查詢的 API URL ---**
const DROPDOWN_LIST_API_URL = environment.ApiUrl + '/queryTLS2E060_TLTTALENTDropDownList';

@Injectable({
  providedIn: 'root'
})
export class Tls2e060Service {

  constructor(private http: HttpClient) { }

  /**
   * 查詢專櫃結帳前調整作業資料 (TLS2E060)
   * @param queryBody 查詢條件
   * @returns 包含查詢結果的 Observable
   */
  queryTls2e060(queryBody: Tls2e060QueryBody): Observable<ApiResponse<Tls2e060Data[]>> {
    return this.http.post<ApiResponse<Tls2e060Data[]>>(QUERY_API_URL, queryBody);
  }

  /**
   * 建立/新增專櫃結帳前調整作業資料 (TLS2E060)
   * @param createBody 建立資料的內容
   * @returns 包含操作結果的 Observable (假設成功回傳的 ApiResponse<number> 即可，因為 Swagger 沒提供 Data Schema)
   */
  createTls2e060(createBody: Tls2e060CreateBody): Observable<ApiResponse<number>> {
    // 雖然 Swagger 描述為 '200 OK'，我們仍使用 ApiResponse<any> 類型
    return this.http.post<ApiResponse<number>>(CREATE_API_URL, createBody);
  }

  // **--- [新增] 查詢專櫃下拉選單資料 (queryTLS2E060_TLTTALENTDropDownList) ---**
  /**
   * 查詢專櫃 (TLT TALENT) 下拉選單資料。
   * 根據 Swagger，此 API 無需參數 (No parameters)。
   * @returns 包含下拉選單資料的 Observable
   */
  queryTltTalentDropdownList(): Observable<ApiResponse<Tls2e060DropDownListData[]>> {
    // 根據 Swagger 描述，使用 POST 且沒有 Request Body
    return this.http.post<ApiResponse<Tls2e060DropDownListData[]>>(DROPDOWN_LIST_API_URL, {});
  }
}
