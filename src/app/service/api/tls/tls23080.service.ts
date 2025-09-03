import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';



@Injectable({
  providedIn: 'root'
})
export class TLS23080Service {
  apiUrl: string = environment.ApiUrl;


  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,

  ) { }

  queryTLS23080(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23080`, query).pipe(
      tap(response => console.log('查詢結果:', response)),
      
    );
  }
  queryTLS23080Detail(query: { TXN_Date: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23080_Detail`, query).pipe(
      tap(response => console.log('🔍 明細查詢結果:', response)),
      
    );
  }
  // ✅ 提供 fetchDetailFn
  async fetchDetailFn(payload: { TXN_Date: string }): Promise<any[]> {
    if (!payload?.TXN_Date) return [];
    try {
      const result = await this.queryTLS23080Detail({ TXN_Date: payload.TXN_Date }).toPromise();
      if (result.Status === '0000') {
        return result.Data ?? [];
      } else {

        return [];
      }
    } catch (error) {

      return [];
    }
  }
  
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
