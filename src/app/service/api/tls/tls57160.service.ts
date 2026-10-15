import { HttpClient, HttpResponse } from '@angular/common/http'; //  匯入 HttpResponse
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設 ApiResponse 介面已定義
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * 查詢庫齡分析表 (queryTLS57160) 的請求主體介面
 *  請求介面保持不變，與 Swagger Request body 範例中的查詢條件欄位一致
 */
export interface Tls57160Request {
  PageSize?: number;
  PageIndex?: number;
  //  Swagger Request body 範例有 OrderBy, Offset，但您的原程式碼未使用，保持與原程式碼一致
  // OrderBy?: string;
  // Offset?: number;
  SortBy?: SortMeta[];
  // 查詢條件
  STK_Date: string;   // 庫存日期 (例如: '2025-11-04')
  HOS_NO?: string;   // 館別編號 (Host No)
  LOGO_No?: string;  // 專櫃編號
  PLU_MagNo?: string;  // 統編貨號
  PLU_NO?: string;   // 貨號
  PLU_OrgPLUNo?: string; // 原始貨號
  showNegativeStock?: boolean; // 顯示負庫存 (true/false)
}

/**
 * 庫齡分析表查詢結果 (Data) 的單筆資料介面
 *  根據 Swagger Response Schema 新增 STK_Qty 和 STK_Cost 欄位
 */
export interface Tls57160DataItem {
  HOS_No?: string;   // 館別編號
  LOGO_No?: string;  // 品牌代碼
  LOGO_CH_NAME?: string; // 品牌名稱
  PLU_MagNo?: string;  // 統編貨號
  PLU_Name?: string;  // 商品名稱
  PLU_No?: string;   // 貨號

  // 庫齡區間 (數量)
  STK_Qty1_6: number;  // 庫齡 1-6 月數量
  STK_Qty7_12: number;  // 庫齡 7-12 月數量
  STK_Qty13_18: number; // 庫齡 13-18 月數量
  STK_Qty19_24: number; // 庫齡 19-24 月數量
  STK_Qty25_36: number; // 庫齡 25-36 月數量
  STK_Qty36_UP: number; // 庫齡 36 月以上數量

  // 庫齡區間 (成本)
  STK_Cost1_6: number;  // 庫齡 1-6 月成本
  STK_Cost7_12: number; // 庫齡 7-12 月成本
  STK_Cost13_18: number; // 庫齡 13-18 月成本
  STK_Cost19_24: number; // 庫齡 19-24 月成本
  STK_Cost25_36: number; // 庫齡 25-36 月成本
  STK_Cost36_UP: number; // 庫齡 36 月以上成本

  //  Swagger Data 區塊新增欄位
  STK_Qty: number;    // 總庫存數量
  STK_Cost: number;   // 總庫存成本

  STK_UnitCost: number; // 單位成本
  PLU_SalePrc: number;  // 銷售價格
}

//  僅用於 footerData 的介面 (因為 footerData 在 Swagger 範例中沒有 HOS_No, PLU_MagNo 等細節欄位)
export interface Tls57160FooterItem {
  STK_Qty1_6: number;  // 庫齡 1-6 月數量
  STK_Qty7_12: number;  // 庫齡 7-12 月數量
  STK_Qty13_18: number; // 庫齡 13-18 月數量
  STK_Qty19_24: number; // 庫齡 19-24 月數量
  STK_Qty25_36: number; // 庫齡 25-36 月數量
  STK_Qty36_UP: number; // 庫齡 36 月以上數量
  STK_Cost1_6: number;  // 庫齡 1-6 月成本
  STK_Cost7_12: number; // 庫齡 7-12 月成本
  STK_Cost13_18: number; // 庫齡 13-18 月成本
  STK_Cost19_24: number; // 庫齡 19-24 月成本
  STK_Cost25_36: number; // 庫齡 25-36 月成本
  STK_Cost36_UP: number; // 庫齡 36 月以上成本
  STK_Qty: number;    // 總庫存數量
  STK_Cost: number;   // 總庫存成本
  STK_UnitCost: number; // 單位成本
  PLU_SalePrc: number;  // 銷售價格
}


/**
 * 庫齡分析表 API 查詢結果介面 (已調整)
 *  根據 Swagger Response Schema 調整 Data 和 footerData 的型別
 */
//  更新了 ApiResponse 的泛型，使用 Tls57160DataItem[] 作為 Data 類型，Tls57160FooterItem[] 作為 footerData 類型
export interface Tls57160QueryResult extends ApiResponse<Tls57160DataItem[], Tls57160FooterItem[]> {
  Data: Tls57160DataItem[];  // 主要查詢結果 (資料陣列)
  footerData: Tls57160FooterItem[]; // 總計資料 (Swagger 定義為陣列)
  TotalCount: number;   // 總筆數
}


@Injectable({
  providedIn: 'root'
})
export class Tls57160Service {

  // API 的基礎路徑為 /TLS0000/TLS5000
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢庫齡分析表 (queryTLS57160)
   * POST /TLS0000/TLS2000/queryTLS57160
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含 Tls57160QueryResult 結構的 API 回應。
   */
  queryTLS57160(body: Tls57160Request): Observable<Tls57160QueryResult> { //  修正回傳型別為 Tls57160QueryResult
    const url = `${this.apiUrl}/queryTLS57160`;
    //  這裡使用 Tls57160QueryResult 介面，它繼承了 ApiResponse 的欄位
    return this.http.post<Tls57160QueryResult>(url, body).pipe(
      map(response => {
        return {
          ...response,
          Data: response.Data || [],
          footerData: response.footerData || []
        };
      })
    );
  }

  /**
   *  根據 Swagger 新增：庫齡分析表 - 匯出 Excel
   * POST /TLS0000/TLS2000/exportTLS57160Excel
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含 Excel 檔案的 Blob 物件 (HttpResponse<Blob>)
   */
  exportTLS57160Excel(
    body: Tls57160Request
  ): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57160Excel`;
    return this.http.post(
      url,
      body,
      {
        observe: 'response',
        responseType: 'blob' // 預期回傳檔案的 Blob 格式
      }
    );
  }

  /**
   *  根據 Swagger 新增：庫齡分析表 - 匯出 PDF
   * POST /TLS0000/TLS2000/exportTLS57160PDF
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含 PDF 檔案的 Blob 物件 (HttpResponse<Blob>)
   */
  exportTLS57160PDF(
    body: Tls57160Request
  ): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57160PDF`;
    return this.http.post(
      url,
      body,
      {
        observe: 'response',
        responseType: 'blob' // 預期回傳檔案的 Blob 格式
      }
    );
  }
}
