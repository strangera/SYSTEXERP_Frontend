import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TLS23130Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 既有：TLS23130 查詢
  queryTLS23130(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23130`, query)
      .pipe(
        tap(res => console.log('查詢結果:', res)),

      );
  }

  // ✅ 新增：APS1001 下拉清單
  // 可傳入查詢條件（若無就給空物件）
  queryAPS1001_DropDownList(body: any = {}): Observable<any> {
    const url = `${this.apiUrl}/queryAPS1001NoBranch_DropDownList`;
    return this.http.post<any>(url, body).pipe(
      tap(res => console.log('[DDL] APS1001:', res)),

    );
  }
  /** 匯出 PDF（不分頁） */
  exporttls23130PDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exporttls23130PDF`;
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