import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23070Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  /** 主表：專櫃收銀機月報（彙總） */
  queryTLS23070(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23070`, query)
      .pipe(
        tap(res => console.log('TLS23070 主表結果:', res)),
        // 如需要統一錯誤處理可以加：
        // catchError(err => this.errorHandler.handleError(err, '查詢專櫃收銀機月報失敗'))
      );
  }

  /** 明細：專櫃/機台每日金額 */
  queryTLS23070Detail(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23070Detail`, query)
      .pipe(
        tap(res => console.log('TLS23070 明細結果:', res)),
        // catchError(err => this.errorHandler.handleError(err, '查詢專櫃收銀機月明細失敗'))
      );
  }

  /** 匯出 PDF（不分頁） */
  exporttls23070PDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exporttls23070PDF`;
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
