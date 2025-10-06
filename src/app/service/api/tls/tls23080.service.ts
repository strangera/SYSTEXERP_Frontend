import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

/** CRU 請求型別：只需要日期 */
export interface TLS23080CruRequest {
  /** ISO 字串，例如 2025-09-09T09:33:05.425Z */
  TXN_Date: string;
}

/** CRU 明細列型別（可依需求補強欄位） */
export type TLS23080CruRow = {
  ECR_No: string;
  tlt_no: string;
  tlt_name: string;

  TXN_PayAmt10?: number;

  UnionGeneral?: number;
  UnionAE?: number;
  UnionDiner?: number;

  CTBCGeneral?: number;
  CTBCAE?: number;
  CTBCDiner?: number;

  CTBCParkingGeneral?: number;
  CTBCParkingAE?: number;
  CTBCParkingDiner?: number;

  TXN_PayAmt52?: number;
  TXN_PayAmt82?: number;
  TXN_PayAmt20?: number;
  TXN_PayAmt62?: number;
  TXN_PayAmt77?: number;
  TXN_PayAmt71?: number;
  TXN_PayAmt30?: number;
  TXN_PayAmt73?: number;
  TXN_PayAmt72?: number;
  TXN_PayAmt74?: number;
  TXN_PayAmt75?: number;
  TXN_PayAmt76?: number;
  TXN_PayAmt24?: number;
  TXN_PayAmt25?: number;
  TXN_PayAmt07?: number;
  TXN_PayAmt55?: number;
  TXN_PayAmt83?: number;
  TXN_PayAmt78?: number;
  TXN_PayAmt79?: number;
  TXN_PayAmt21?: number;
  TXN_PayAmt53?: number;
  TXN_PayAmt56?: number;
  TXN_PayAmt57?: number;
  TXN_PayAmt58?: number;
  TXN_PayAmt59?: number;
  TXN_PayAmt60?: number;
  TXN_PayAmt22?: number;
  TXN_PayAmt23?: number;

  TXN_TotPayAmt?: number;
} & Record<string, any>;

@Injectable({
  providedIn: 'root'
})
export class TLS23080Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService, // 如需全域錯誤處理可使用；下方保留簡單 console
  ) { }

  /** 主清單查詢（分頁版） */
  queryTLS23080(query: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23080`;
    return this.http.post<any>(url, query).pipe(
      tap(response => console.log('查詢結果:', response)),
    );
  }

  /** 單日明細查詢（舊 API） */
  queryTLS23080Detail(query: { TXN_Date: string }): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23080_Detail`;
    return this.http.post<any>(url, query).pipe(
      tap(response => console.log('🔍 明細查詢結果:', response)),
    );
  }

  /** 給 report-table-group 用的細明抓取函式（Promise 版） */
  async fetchDetailFn(payload: { TXN_Date: string }): Promise<any[]> {
    if (!payload?.TXN_Date) return [];
    try {
      const result = await firstValueFrom(this.queryTLS23080Detail({ TXN_Date: payload.TXN_Date }));
      if (result?.Status === '0000') {
        return Array.isArray(result?.Data) ? result.Data : (result?.Data ? [result.Data] : []);
      }
      return [];
    } catch (error) {
      console.error('fetchDetailFn 錯誤：', error);
      return [];
    }
  }

  /**
   * CRU 明細查詢（新 API）。
   * 若主路由不存在或錯誤，自動 fallback 到舊的 _Detail 路由。
   */


  /**
   * 便捷版：只回傳 Data 陣列（失敗回空陣列）
   */


  /** 匯出 Excel（不分頁） */
  exportTLS23080Excel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23080`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（不分頁） */
  exportTLS23080PDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23080PDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出用：去掉分頁鍵（保留 SortBy/OrderBy 讓後端依前端排序） */
  private stripPaging<T extends Record<string, any>>(input: T): Omit<T, 'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset'> {
    if (!input) return input as any;
    const { PageSize, PageIndex, OrderBy, Offset, ...rest } = input;
    return rest as any;
  }
}
