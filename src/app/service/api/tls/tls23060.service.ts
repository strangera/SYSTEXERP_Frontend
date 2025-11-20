import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23060Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  /** 總表查詢 */
  queryTLS23060(query: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/querytls23060`;
    return this.http.post<any>(url, query).pipe(
      tap(res => console.log('查詢結果 (總表):', res)),
    );
  }

  /** 明細查詢：/queryTLS23060_Detail（Dialog 用，以日期為主） */
  queryTLS23060Detail(query: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23060_Detail`;
    return this.http.post<any>(url, query).pipe(
      tap(res => console.log('查詢結果 (明細):', res)),
    );
  }

  /** 匯出 Excel（不分頁） - 目前此頁面已不使用，但保留給其他地方共用 */
  exporttls23060Excel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exporttls23060`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 總表匯出 PDF（不分頁） */
  exporttls23060PDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exporttls23060PDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 明細表匯出 PDF（不分頁） */
  exportTLS23060DetailPDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23060DetailPDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /**
   * 匯出用：移除分頁相關欄位（大小寫都處理），保留 SortBy（若後端會依排序輸出）
   */
  private stripPaging<T extends Record<string, any>>(
    input: T
  ): Omit<T,
    'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset' |
    'pageSize' | 'pageIndex' | 'orderBy' | 'offset'
  > {
    if (!input) return input as any;
    const {
      PageSize, PageIndex, OrderBy, Offset,
      pageSize, pageIndex, orderBy, offset,
      ...rest
    } = input as any;
    return rest as any;
  }
}
