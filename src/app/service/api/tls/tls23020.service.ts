import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({ providedIn: 'root' })
export class TLS23020Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  /** 明細查詢 */
  queryTLS23020(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23020`;
    return this.http.post<any>(url, body).pipe(
      tap(response => console.log('🎯 TLS23020 查詢結果:', response)),
    );
  }

  /** 彙總查詢（不分頁） */
  queryTLS23020_Summary(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23020_Summary`;
    return this.http.post<any>(url, body).pipe(
      tap(r => console.log('🎯 TLS23020 Summary 結果:', r)),
    );
  }

  // ================= 匯出 =================

  /** 匯出 Excel（不分頁；自動去除分頁欄位、保留 SortBy） */
  exportTLS23020Excel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23020`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（不分頁；自動去除分頁欄位、保留 SortBy） */
  exportTLS23020PDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23020PDF`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
  /** 匯出 Excel（彙總，不分頁） */
  exportTLS23020SummaryExcel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23020_Summary`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（彙總，不分頁） */
  exportTLS23020SummaryPDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23020_SummaryPDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 工具：移除分頁相關欄位（匯出不需要），保留 SortBy 以維持匯出排序一致 */
  private stripPaging<T extends Record<string, any>>(input: T): Omit<T, 'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset'> {
    if (!input) return input as any;
    const { PageSize, PageIndex, OrderBy, Offset, ...rest } = input;
    return rest as any;
  }
}
