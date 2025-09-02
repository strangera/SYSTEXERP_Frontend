import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23050Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /** 查詢（明細/日報用） */
  queryTLS23050(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23050`;
    return this.http.post<any>(url, body).pipe(
      tap(resp => console.log('🎯 TLS23050 查詢結果:', resp)),
    );
  }

  /** 匯出 Excel（不分頁） */
  exportTLS23050Excel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23050`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      // 依你的型別多載：把 blob 斷言成 'json'
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（不分頁） */
  exportTLS23050PDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23050PDF`;
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
