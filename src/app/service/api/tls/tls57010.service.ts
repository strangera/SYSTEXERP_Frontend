import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SortMeta } from 'primeng/api';

/**
 * 查詢採購統計表 (queryTLS57010) 的請求主體介面
 */
export interface Tls57010Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  APPLY_Date_Start?: string; // 申請日期起 (例如: '2025-10-01')
  APPLY_Date_End?: string;   // 申請日期迄
  PO_NO?: string;            // 採購單號
  VEN_No?: string;           // 廠商編號
  PLU_MagNo?: string;        // 統編貨號
  PO_StatusList?: string[];  // 採購單狀態列表
  LOGO_NoList?: string[];    // 專櫃編號列表
  ShowType?: string;         // 顯示類型
}

/**
 * 採購統計表查詢結果 (Datas) 的單筆資料介面
 */
export interface Tls57010DataItem {
  APPLY_Date?: string;     // 申請日期
  PO_No?: string;          // 採購單號
  SYS_Name?: string;       // 系統名稱 (如果存在於實際資料中)
  PLU_No?: string;         // 貨號
  PLU_MagNo?: string;      // 統編貨號
  PLU_Name?: string;       // 商品名稱
  OrderedQty: number;      // 訂購數量
  ReceivedQty: number;     // 已收數量
  RemainingQty: number;    // 剩餘數量
  POD_BuyNet: number;      // 採購淨額
  POD_SaleAmt: number;     // 銷售金額
}

/**
 * 採購統計表 API 回應的 Data 結構介面
 */
export interface Tls57010ResponseData {
  Datas: Tls57010DataItem[];
  SumData: Tls57010DataItem; // 總計資料
  DetailSumData: Tls57010DataItem[]; // 可能的分組彙總資料 (例如依 PO_No)
}
@Injectable({
  providedIn: 'root'
})
export class Tls57010Service {

  // API 的基礎路徑
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢採購統計表 (queryTLS57010)
   * POST /TLS0000/TLS5000/queryTLS57010
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含 Tls57010ResponseData 結構的 API 回應。
   */
  queryTLS57010(body: Tls57010Request): Observable<any> {
    const url = `${this.apiUrl}/queryTLS57010`;
    // 將回傳型別設為 any，但內部處理 Tls57010ResponseData 結構
    // 如果有 ApiResponse<T>，請將 <any> 替換為 <ApiResponse<Tls57010ResponseData>>
    return this.http.post<any>(url, body).pipe(
      map(response => {
        // 將 Datas, SumData, DetailSumData 從 response.Data 中提取出來
        return {
          Data: response.Data.Datas,
          TotalCount: response.TotalCount,
          SumData: response.Data.SumData,
          DetailSumData: response.Data.DetailSumData
        };
      })
    );
  }

  /**
   * 匯出採購統計表 (exportTLS57010)
   * POST /TLS0000/TLS5000/exportTLS57010
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含匯出檔案的 Blob 物件 (帶有完整的 HttpResponse)。
   */
  exportTLS57010(body: Tls57010Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57010`;
    return this.http.post(url, body, { observe: 'response', responseType: 'blob' });
  }

  /**
   * 匯出採購統計表PDF (exportTLS57010PDF)
   * POST /TLS0000/TLS5000/exportTLS57010PDF
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含匯出 PDF 檔案的 Blob 物件 (帶有完整的 HttpResponse)。
   */
  exportTLS57010PDF(body: Tls57010Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57010PDF`;
    return this.http.post(url, body, { observe: 'response', responseType: 'blob' });
  }
}
