import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設 ApiResponse 在這個路徑
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 商品查詢 (主要列表頁) 請求參數
 */
export interface QueryTLS57040Request {
  LOGO_No?: string;      // 品牌代碼
  PLU_MagNo?: string;    // 商品管理編號 (右模糊)
  PLU_No?: string;       // 國際條碼 (右模糊)
  PLU_OrgPLUNo?: string; // 廠商貨號 (右模糊)
  PLU_Name?: string;     // 商品名稱 (左右模糊)
  CAT_LNo?: string;      // 大分類代碼
  CAT_MNo?: string;      // 中分類代碼
  CAT_SNo?: string;      // 小分類代碼
  PLU_Reserve3?: string; // 系列 (左右模糊)
  queryNo?: string;      // 商品管理編號 (下拉選單/Auto-complete 使用)
  IncludeZeroStock?: boolean; // 是否包含庫存為零的商品 (對應後端 ShowCurrentQty)
  ShowOrderPrc?: boolean; // 是否顯示標準進價 (主要用於前端控制)
  ShowImage?: boolean;    // 是否顯示圖片 (主要用於前端控制)

  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: number }[];
}

/**
 * 查詢回傳的單筆商品資料模型 (主要列表頁使用)
 */
export interface QueryTLS57040Response {
  LOGO_No?: string;
  LOGO_CH_NAME?: string;
  PLU_MagNo: string;
  PLU_No: string;
  PLU_OrgPLUNo?: string;
  PLU_Name?: string;
  PLU_Reserve2?: string;
  STK_CurrentQty: number;
  PLU_SalePrc: number;
  TotSaleAmt: number;
  PLU_OrderPrc?: number;
  PLU_Image?: string; // 商品圖檔檔名
}

/**
 * 商品查詢 (下拉選單/Auto-complete 使用) 請求參數
 */
export interface QueryPLUForDropdownRequest {
  QueryNo?: string;      // 綜合查詢編號 (優先使用，用於模糊匹配多個商品相關欄位)
  PLU_MagNo?: string;    // 商品管理編號 (右模糊匹配，當 QueryNo 不提供時可用)
  PLU_No?: string;       // 國際條碼 (右模糊匹配，當 QueryNo 不提供時可用)
  PLU_OrgPLUNo?: string; // 廠商貨號 (右模糊匹配，當 QueryNo 不提供時可用)
  PLU_Name?: string;     // 商品名稱 (左右模糊匹配，當 QueryNo 不提供時可用)

  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: number }[];
}

/**
 * 查詢回傳的單筆商品資料模型 (下拉選單/Auto-complete 使用)
 */
export interface QueryPLUResponse {
  PLU_MagNo: string;
  PLU_No: string;
  PLU_OrgPLUNo: string;
  PLU_Name: string;
  label?: string; // For PrimeNG AutoComplete display
}


@Injectable({
  providedIn: 'root'
})
export class Tls57040Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS57040`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢商品主檔資料的 API 呼叫，主要用於下拉選單或通用商品查詢
   * @param body 查詢請求物件
   * @returns 包含商品列表和分頁資訊的 API 回傳結果
   */
  queryPLUForDropdown(body: QueryPLUForDropdownRequest): Observable<ApiResponse<QueryPLUResponse[]>> {
    return this.http.post<ApiResponse<QueryPLUResponse[]>>(`${this.apiUrl}/queryPLUForDropdown`, body);
  }

  /**
   * 查詢商品主檔資料 (TLS57040 主要列表頁使用)
   * @param body 查詢請求物件
   * @returns 包含詳細商品列表和分頁資訊的 API 回傳結果
   */
  queryTLS57040(body: QueryTLS57040Request): Observable<ApiResponse<QueryTLS57040Response[]>> {
    return this.http.post<ApiResponse<QueryTLS57040Response[]>>(`${this.apiUrl}/queryTLS57040`, body);
  }
}
