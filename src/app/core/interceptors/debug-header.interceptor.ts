// src/app/core/interceptors/debug-header.interceptor.ts

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment'; // 請根據您的實際路徑調整
import { DebugToggleService, ExecutedSqlDetail } from '../services/debug-toggle.service';
const SQL_DATA_HEADER = 'X-Internal-Sql-Data';
const STACK_TRACE_HEADER = 'X-Internal-StackTrace';

@Injectable()
export class DebugHeaderInterceptor implements HttpInterceptor {

  private readonly debugService = inject(DebugToggleService);

  //  動態獲取當前啟用的 Base URL
  // 我們使用 environment.ApiUrl 或 environment.BaseUrl，這取決於您程式中如何配置 API 呼叫的基礎路徑
  // 這裡假設使用 BaseUrl
  private readonly BASE_URL_TO_REMOVE = environment.BaseUrl;


  /**
   * 修正亂碼的核心函數：將 Base64 字串安全地解碼為 UTF-8 字串 (保持不變)
   */
  private decodeBase64Utf8(base64String: string | null): string | null {
    if (!base64String) return null;
    let binary_string;
    try {
      binary_string = window.atob(base64String);
    } catch (e) {
      console.error("Base64 解碼失敗:", e);
      return null;
    }
    const bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    try {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    } catch (e) {
      console.error("UTF-8 解碼失敗:", e);
      return null;
    }
  }


  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if (!this.debugService.isDebugEnabled()) {
      return next.handle(req);
    }

    // 1. 取得完整的 API 請求路徑 (包含 Query String)
    let apiUrl = req.urlWithParams;

    // 2.  修正邏輯：動態移除環境變數中定義的 Base URL
    const baseUrl = this.BASE_URL_TO_REMOVE;

    if (baseUrl && apiUrl.startsWith(baseUrl)) {
      // 從 Base URL 之後開始截取路徑
      apiUrl = apiUrl.substring(baseUrl.length);
    }

    // 3. 確保開頭是 '/'
    // 如果移除後路徑開頭沒有斜線，則補上 (除非路徑是空的)
    if (apiUrl.length > 0 && !apiUrl.startsWith('/')) {
      apiUrl = '/' + apiUrl;
    }
    // 如果移除後是空字串，例如 req.urlWithParams 剛好等於 BaseUrl
    if (apiUrl === '') {
      apiUrl = '/';
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {

          const headers = event.headers;
          const encodedSql = headers.get(SQL_DATA_HEADER);
          const encodedStackTrace = headers.get(STACK_TRACE_HEADER);

          if (encodedSql) {
            try {
              const jsonString = this.decodeBase64Utf8(encodedSql);

              if (!jsonString) {
                throw new Error('UTF-8 解碼結果為空');
              }

              const sqlData: ExecutedSqlDetail[] = JSON.parse(jsonString);

              let stackTrace: string | null = null;
              if (encodedStackTrace) {
                stackTrace = this.decodeBase64Utf8(encodedStackTrace);
              }

              // 呼叫服務，傳遞處理後的 apiUrl
              this.debugService.setAndShowSqlData(apiUrl, sqlData, stackTrace);

            } catch (e) {
              console.error('DebugHeaderInterceptor: 無法解析或解碼 SQL Header 數據', e);
              this.debugService.setAndShowSqlData(apiUrl, [], null);
            }
          } else {
            this.debugService.latestSqlData.set([]);
            this.debugService.latestStackTrace.set(null);
          }
        }
      })
    );
  }
}
