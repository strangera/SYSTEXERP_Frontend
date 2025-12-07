import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DebugToggleService, ExecutedSqlDetail } from '../services/debug-toggle.service';

const SQL_DATA_HEADER = 'X-Internal-Sql-Data';
const STACK_TRACE_HEADER = 'X-Internal-StackTrace';
const BASE_URL_TO_REMOVE = environment.BaseUrl;

/**
 * 修正亂碼的核心函數：將 Base64 字串安全地解碼為 UTF-8 字串
 * 修正 2：將 private 方法轉換為獨立函式
 */
function decodeBase64Utf8(base64String: string | null): string | null {
  if (!base64String) return null;
  let binary_string;
  try {
    // 由於 window.atob 在某些環境中可能不存在，但 Angular 應用程式通常在瀏覽器環境中
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


/**
 * 偵錯標頭功能型攔截器
 */
export const debugHeaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  // 修正 3：使用 inject() 獲取服務
  const debugService = inject(DebugToggleService);

  // 如果偵錯未啟用，直接傳遞請求
  if (!debugService.isDebugEnabled()) {
    return next(req); // 使用 next(req)
  }

  // 1. 取得完整的 API 請求路徑 (包含 Query String)
  let apiUrl = req.urlWithParams;

  // 2. 修正邏輯：動態移除環境變數中定義的 Base URL
  const baseUrl = BASE_URL_TO_REMOVE;

  if (baseUrl && apiUrl.startsWith(baseUrl)) {
    // 從 Base URL 之後開始截取路徑
    apiUrl = apiUrl.substring(baseUrl.length);
  }

  // 3. 確保開頭是 '/'
  if (apiUrl.length > 0 && !apiUrl.startsWith('/')) {
    apiUrl = '/' + apiUrl;
  }
  if (apiUrl === '') {
    apiUrl = '/';
  }

  // 4. 處理請求並檢查響應標頭
  return next(req).pipe( // 使用 next(req)
    tap(event => {
      if (event instanceof HttpResponse) {

        const headers = event.headers;
        const encodedSql = headers.get(SQL_DATA_HEADER);
        const encodedStackTrace = headers.get(STACK_TRACE_HEADER);

        if (encodedSql) {
          try {
            // 呼叫外部函式 decodeBase64Utf8
            const jsonString = decodeBase64Utf8(encodedSql);

            if (!jsonString) {
              throw new Error('UTF-8 解碼結果為空');
            }

            const sqlData: ExecutedSqlDetail[] = JSON.parse(jsonString);

            let stackTrace: string | null = null;
            if (encodedStackTrace) {
              // 呼叫外部函式 decodeBase64Utf8
              stackTrace = decodeBase64Utf8(encodedStackTrace);
            }

            // 呼叫服務，傳遞處理後的 apiUrl
            debugService.setAndShowSqlData(apiUrl, sqlData, stackTrace);

          } catch (e) {
            console.error('DebugHeaderInterceptor: 無法解析或解碼 SQL Header 數據', e);
            debugService.setAndShowSqlData(apiUrl, [], null);
          }
        } else {
          // 使用 Signal 的 set 方法 (符合您的原始邏輯)
          debugService.latestSqlData.set([]);
          debugService.latestStackTrace.set(null);
        }
      }
    })
  );
};
