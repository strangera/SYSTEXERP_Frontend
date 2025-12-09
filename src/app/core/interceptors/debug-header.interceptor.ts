import {
  HttpClient,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@service/system/auth.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DebugToggleService, ExecutedSqlDetail } from '../services/debug-toggle.service';

const DEBUG_ID_HEADER = 'X-Debug-Id';
const BASE_URL_TO_REMOVE = environment.BaseUrl;
const DEBUG_API_PATH = '/TSRDERP_Main/Controllers/Debug/';

/**
 * 偵錯標頭功能型攔截器 (更新為使用 Debug ID 呼叫新 API)
 */
export const debugHeaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const debugService = inject(DebugToggleService);
  const http = inject(HttpClient);
  const authService = inject(AuthService); // <-- 注入 AuthService

  // *** 核心修改部分：檢查 Token/登入狀態 ***
  // 如果用戶未登入 (即沒有 Token)，則不執行 Debug 邏輯，直接傳遞請求。
  // 注意：這裡只檢查了登入狀態，如果想排除特定的無 Token 請求 (例如 /User/userLogin)，
  // 您可能需要額外判斷 req.url。但一般來說，檢查 isLoggedIn() 即可滿足「無 Token 不觸發」的要求。
  if (!authService.isLoggedIn()) {
    return next(req);
  }

  // 1. 如果偵錯未啟用，直接傳遞請求 (保留此檢查)
  if (!debugService.isDebugEnabled()) {
    return next(req);
  }

  // 2. 取得完整的 API 請求路徑 (包含 Query String)
  let apiUrl = req.urlWithParams;

  // 3. 移除環境變數中定義的 Base URL
  const baseUrl = BASE_URL_TO_REMOVE;
  if (baseUrl && apiUrl.startsWith(baseUrl)) {
    apiUrl = apiUrl.substring(baseUrl.length);
  }

  // 4. 確保開頭是 '/'
  if (apiUrl.length > 0 && !apiUrl.startsWith('/')) {
    apiUrl = '/' + apiUrl;
  }
  if (apiUrl === '') {
    apiUrl = '/';
  }

  // 5. 處理請求並檢查響應標頭
  return next(req).pipe(
    tap(event => {
      // 檢查是否為 HttpResponse 且 Debug Service 仍在啟用狀態
      if (event instanceof HttpResponse && debugService.isDebugEnabled()) {

        const headers = event.headers;
        const debugId = headers.get(DEBUG_ID_HEADER);

        // 如果 Debug ID 存在
        if (debugId) {
          // 呼叫一個私有方法來處理 Debug API 請求，並將結果傳遞給 Service
          fetchDebugData(debugId, apiUrl, http, debugService);
        } else {
          // 如果沒有 Debug ID，清除最新的數據
          debugService.latestSqlData.set([]);
          debugService.latestStackTrace.set(null);
        }
      }
    })
  );
};


/**
 * 處理 Debug API 請求的獨立函數 (不變)
 * ... (保持不變)
 */
function fetchDebugData(
  debugId: string,
  apiUrl: string,
  http: HttpClient,
  debugService: DebugToggleService
): void {
  const debugUrl = `${BASE_URL_TO_REMOVE}${DEBUG_API_PATH}${debugId}`;

  http.get<any>(debugUrl).pipe(
    catchError((error) => {
      console.error(`[Debug Interceptor] 呼叫 Debug API 失敗: ${debugUrl}`, error);
      debugService.setAndShowSqlData(apiUrl, [], null);
      return of(null);
    })
  ).subscribe(
    (response) => {
      // 核心修正：正確解析新的 API 響應結構
      const debugData = response?.Data;

      if (debugData && debugData.SqlStatements) {

        // SqlStatements 是包含 SQL 字串的陣列 (string[])
        const sqlStatements: string[] = debugData.SqlStatements || [];

        // 將 string[] 轉換為 ExecutedSqlDetail[]
        const processedSqlData: ExecutedSqlDetail[] = sqlStatements.map(sqlString => ({
          sql: sqlString // 每個元素都是一個完整的 SQL 語法
        }));

        const stackTrace = debugData.StackTrace || null;

        // 呼叫服務，將解析後的數據傳入
        debugService.setAndShowSqlData(apiUrl, processedSqlData, stackTrace);
      }
      // 處理 9102/過期/失敗 的情況
      else if (response?.ReturnCode || response === null) {
        console.warn(`[Debug Interceptor] Debug ID [${debugId}] 無效、過期或響應數據結構不符。`);
        debugService.setAndShowSqlData(apiUrl, [], null);
      } else {
        // 成功的空響應或其他未預期結構
        debugService.setAndShowSqlData(apiUrl, [], null);
      }
    },
  );
}
