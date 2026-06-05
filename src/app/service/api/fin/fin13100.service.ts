import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FIN13100Service {
  private apiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) {}

  /** 查詢頁：查傳票清單 */
  queryFIN13100(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13100`, query)
      .pipe(tap((res) => console.log('FIN13100 查詢結果:', res)));
  }

  /** CRU頁：查單一傳票明細 */
  queryFIN13100Detail(param: { VouNo: string }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13100Detail`, param)
      .pipe(tap((res) => console.log('FIN13100 明細結果:', res)));
  }

  /** 發票格式下拉：31 / 32 / 35 */
  getFIN13100GUITypeDropdown(): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/getFIN13100GUITypeDropdown`, {})
      .pipe(tap((res) => console.log('FIN13100 發票格式下拉:', res)));
  }
  /** CRU頁：存檔，payload 要送 Details */
  saveFIN13100(data: {
    VouNo: string;
    Details: Array<{
      id: number;
      INV_GUIType: string;
      InvoiceNo: string;
      InvoiceDate: string | null;
      INV_YM: string | null;
      INV_DeclareYM: string | null;
      TXN_Uniform?: string | null;
      SaleAmt: number;
      TaxType: string;
      Net: number;
      Tax: number;
      Source_Doc_No?: string | null;
      AssetType?: string | null;
    }>;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/saveFIN13100`, data)
      .pipe(tap((res) => console.log('FIN13100 存檔結果:', res)));
  }
}