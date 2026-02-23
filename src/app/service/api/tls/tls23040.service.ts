/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';


export interface ApiResponse<T> {
  ReturnCode?: string;
  ReturnMessage?: string;
  Data?: T;
  TotalCount?: number;
  TotalPage?: number;
}

@Injectable({ providedIn: 'root' })
export class TLS23040Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}
downloadPDFByUrl(url: string): Observable<HttpResponse<Blob>> {
  return this.http.get(url, {
    observe: 'response',
    responseType: 'blob' as 'json',
    headers: { Accept: 'application/pdf' },
  }) as unknown as Observable<HttpResponse<Blob>>;
}

  /** 查詢（頁面用） */
  queryTLS23040(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23040`;
    return this.http.post<any>(url, body).pipe(
      tap((response) => console.log('🎯 TLS23040 查詢結果:', response)),
    );
  }

  /** ✅ 匯出 Excel（後端回 File Bytes） */
  exportTLS23040Excel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23040`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  /** ✅ 匯出 PDF（後端回 ApiResponse<string>，Data=/temp/xxx.pdf） */
  exportTLS23040PDF(body: any): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23040PDF`;
    const payload = this.stripPaging(body);

    return this.http.post<ApiResponse<string>>(url, payload).pipe(
      tap((res) => console.log('🎯 TLS23040 PDF 匯出回傳:', res)),
    );
  }

  /** 匯出用：去掉分頁鍵（大小寫都處理） */
  private stripPaging<T extends Record<string, any>>(input: T): Omit<T, any> {
    if (!input) return input as any;

    // 前端常見小寫 pageIndex/pageSize
    const { pageIndex, pageSize, SortBy, ...rest1 } = input as any;

    // 也保留你原本寫的（以防有頁面傳大寫）
    const { PageSize, PageIndex, OrderBy, Offset, ...rest2 } = rest1 as any;

    // ✅ SortBy 要不要移除？
    // 後端匯出通常可吃 SortBy（你 service 註解也說保留）
    // 但你 stripPaging 先解構了 SortBy，我這裡把它加回去
    if (Array.isArray((input as any).SortBy)) {
      (rest2 as any).SortBy = (input as any).SortBy;
    }

    return rest2 as any;
  }


}
