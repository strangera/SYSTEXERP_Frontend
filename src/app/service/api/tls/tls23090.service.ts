import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23090Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS23090(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23090_CreditCard`, query).pipe(
      tap(response => console.log('查詢結果:', response)),
      // ✅ 正確
    );
  }
  // 查詢（專櫃卡別分析）
  queryTLS23090CounterCard(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23090_CounterCard`, body);
  }

  // 匯出 PDF（信用卡明細）
  exporttls23090CreditPDF(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS2000/exportTLS23090_CreditCardPDF`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  // 匯出 PDF（專櫃卡別分析）
  exporttls23090CounterPDF(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS2000/exportTLS23090_CounterCardPDF`, body, {
      observe: 'response',
      responseType: 'blob',
    });
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

