/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
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
  /** 例如：http://localhost:5142 */
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // =========================
  // Query
  // =========================

  /** 查詢（頁面用） */
  queryTLS23040(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23040`;
    return this.http.post<any>(url, body).pipe(
      tap((response) => console.log('🎯 TLS23040 查詢結果:', response)),
      // 你們若有共用錯誤處理可在這裡接：
      // catchError((e) => this.errorHandler.handleError(e))
    );
  }

  // =========================
  // Export Excel
  // =========================

  /** ✅ 匯出 Excel（後端回 File Bytes） */
  exportTLS23040Excel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23040`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  // =========================
  // Export PDF
  // =========================

  /**
   * ✅ 匯出 PDF（舊版：後端回 ApiResponse<string>，Data=/temp/xxx.pdf 或完整 URL）
   * 你要開分頁/自己處理 URL 時可用這個
   */
/** ✅ 匯出 PDF（後端回 File Bytes） */
exportTLS23040PDF(body: any): Observable<HttpResponse<Blob>> {
  const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23040PDF`;
  const payload = this.stripPaging(body);

  return this.http.post(url, payload, {
    observe: 'response',
    responseType: 'blob',
  });
}

  /**
   * ✅ 匯出 PDF（新版：不開分頁）
   * 流程：
   * 1) POST exportTLS23040PDF 拿到 Data(/temp/xxx.pdf 或完整 URL)
   * 2) GET 該 PDF URL 取得 Blob (HttpResponse<Blob>)
   *
   * Component 拿到 HttpResponse<Blob> 後，用 <a download> 直接下載即可
   */
  exportTLS23040PDFBlob(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23040PDF`;
    const payload = this.stripPaging(body);

    return this.http.post<ApiResponse<string>>(url, payload).pipe(
      tap((res) => console.log('🎯 TLS23040 PDF 匯出回傳(準備抓檔):', res)),
      switchMap((res) => {
        const pathOrUrl = res?.Data;

        if (!pathOrUrl) {
          // 丟錯讓 component 顯示 ReturnMessage
          throw new Error(res?.ReturnMessage || '沒有回傳 PDF 路徑');
        }

        const fileUrl = this.resolveTempUrl(pathOrUrl);

        return this.http.get(fileUrl, {
          observe: 'response',
          responseType: 'blob',
          headers: { Accept: 'application/pdf' },
        });
      }),
    );
  }

  /**
   * 你原本的：直接下載某個 URL 的 PDF Blob（可留著）
   * 注意：如果 url 是相對路徑 /temp/...，建議先用 resolveTempUrl 轉成完整 URL
   */
  downloadPDFByUrl(url: string): Observable<HttpResponse<Blob>> {
    const fileUrl = this.resolveTempUrl(url);

    return this.http.get(fileUrl, {
      observe: 'response',
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
  }

  // =========================
  // Utils
  // =========================

  /** ✅ 把後端回來的 Data 轉成「一定指向後端 host」的完整 URL */
  private resolveTempUrl(pathOrUrl: string): string {
    if (!pathOrUrl) return '';

    // 後端若已回完整 URL，直接用
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

    // 抽出 /temp/xxx.pdf（或保底補 /）
    const idx = pathOrUrl.indexOf('/temp/');
    const tempPath =
      idx >= 0 ? pathOrUrl.substring(idx) :
      pathOrUrl.startsWith('/') ? pathOrUrl :
      `/${pathOrUrl}`;

    // 用 apiUrl 的 host 組完整 URL（例如 http://localhost:5142 + /temp/xxx.pdf）
    const apiBase = (this.apiUrl || '').replace(/\/+$/, '');
    return `${apiBase}${tempPath}`;
  }

  /** 匯出用：去掉分頁鍵（大小寫都處理），並保留 SortBy（若存在） */
  private stripPaging<T extends Record<string, any>>(input: T): Omit<T, any> {
    if (!input) return input as any;

    // 前端常見小寫 pageIndex/pageSize
    const { pageIndex, pageSize, SortBy, ...rest1 } = input as any;

    // 也保留你原本寫的（以防有頁面傳大寫）
    const { PageSize, PageIndex, OrderBy, Offset, ...rest2 } = rest1 as any;

    // ✅ SortBy 要不要移除？通常匯出可吃排序，所以加回去
    if (Array.isArray((input as any).SortBy)) {
      (rest2 as any).SortBy = (input as any).SortBy;
    } else if (Array.isArray(SortBy)) {
      (rest2 as any).SortBy = SortBy;
    }

    return rest2 as any;
  }
}
