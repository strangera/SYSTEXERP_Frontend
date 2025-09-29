import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SortMeta } from 'primeng/api';
import { ApiResponse } from '@service/system/auth.service';

export interface Tls57130Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  TXN_DateStart: string;
  TXN_DateEnd: string;
  LOGO_No?: string;
  HOS_NO?: string;
  RNK_No?: number;
  RNK_Status?: string;
}
export interface Tls57130DataItem {
  LOGO_No: string;
  LOGO_CH_NAME: string;
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_NO: string;
  PLU_OrgPLUNo: string;
  TotTXN_TotGUI: number;
  TotTXN_Qty: number;
  PLU_SalePrc: number;
  TotTXN_SaleAmt: number;
  RNK: number;
}
@Injectable({
  providedIn: 'root'
})
export class Tls57130Service {

  // API 的基礎路徑
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢銷售排行報表 (queryTLS57130)
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含 Tls57130DataItem 陣列的 API 回應。
   */
  queryTLS57130(body: Tls57130Request): Observable<ApiResponse<Tls57130DataItem[]>> {
    const url = `${this.apiUrl}/queryTLS57130`;
    return this.http.post<ApiResponse<Tls57130DataItem[]>>(url, body);
  }

  /**
   * 匯出銷售排行報表 (exportTLS57130)
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含匯出檔案的 Blob 物件。
   */
  exportTLS57130(body: Tls57130Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57130`;
    return this.http.post(url, body, { observe: 'response', responseType: 'blob' });
  }

  /**
   * 匯出銷售排行報表PDF (exportTLS57130PDF)
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含匯出 PDF 檔案的 Blob 物件。
   */
  exportTLS57130PDF(body: Tls57130Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57130PDF`;
    return this.http.post(url, body, { observe: 'response', responseType: 'blob' });
  }
}
