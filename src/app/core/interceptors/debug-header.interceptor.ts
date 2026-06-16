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
const DEBUG_API_PATH = '/BasicEIP_Core/DiagnosticsModule/Debug/';

/**
 * 偵錯標頭功能型攔截器 (更新為使用 Debug ID 呼叫新 API)
 */
export const debugHeaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const debugService = inject(DebugToggleService);
  const http = inject(HttpClient);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn() || !debugService.isDebugEnabled()) {
    return next(req);
  }

  let apiUrl = req.urlWithParams;
  const baseUrl = BASE_URL_TO_REMOVE;
  if (baseUrl && apiUrl.startsWith(baseUrl)) {
    apiUrl = apiUrl.substring(baseUrl.length);
  }
  if (apiUrl.length > 0 && !apiUrl.startsWith('/')) { apiUrl = '/' + apiUrl; }
  if (apiUrl === '') { apiUrl = '/'; }

  // 記錄前端發出請求的當下時間
  const startTime = Date.now();

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && debugService.isDebugEnabled()) {
        const headers = event.headers;
        const debugId = headers.get(DEBUG_ID_HEADER);

        if (debugId) {
          // 計算體感總時 (此時主請求已回來)
          const totalTime = Date.now() - startTime;
          // 傳入 totalTime 給 fetchDebugData
          fetchDebugData(debugId, apiUrl, http, debugService, totalTime);
        } else {
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
  debugService: DebugToggleService,
  totalTime: number // 接收體感時間
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
      const debugData = response?.Data;
      if (debugData && debugData.SqlStatements) {
        const sqlStatements: string[] = debugData.SqlStatements || [];
        const processedSqlData: ExecutedSqlDetail[] = sqlStatements.map(sqlString => ({ sql: sqlString }));
        const stackTrace = debugData.StackTrace || null;

        // 1. ✨ 改為解析後端最新的三段時間欄位
        const beforeDbTime = debugData.BeforeDbTimeMs || 0;     // 👈 讀取 DB 前時間
        const dbTime = debugData.DbTimeMs || 0;
        const afterDbTime = debugData.AfterDbTimeMs || 0;       // 👈 讀取 DB 後時間
        const totalBackendTime = debugData.TotalBackendTimeMs || 0;

        // 2. 網路與序列損耗公式維持一樣 (體感總時 - 後端總處理時間)
        const networkTime = Math.max(0, totalTime - totalBackendTime);

        // 3. ✨ 傳入新介面規格的物件
        debugService.setAndShowSqlData(apiUrl, processedSqlData, stackTrace, {
          totalTime,
          beforeDbTime,  // 👈 變更
          dbTime,
          afterDbTime,   // 👈 變更
          networkTime,
          totalBackendTime
        });
      }
      else if (response?.ReturnCode || response === null) {
        console.warn(`[Debug Interceptor] Debug ID [${debugId}] 無效或過期。`);
        debugService.setAndShowSqlData(apiUrl, [], null);
      } else {
        debugService.setAndShowSqlData(apiUrl, [], null);
      }
    },
  );
}
