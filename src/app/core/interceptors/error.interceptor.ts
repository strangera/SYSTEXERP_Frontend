// src/app/core/interceptors/error.interceptor.ts (功能型)

import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core'; // 使用 inject 導入服務
import { catchError, Observable, retry, throwError, timeout, TimeoutError, timer } from 'rxjs';
import { ErrorHandlerService } from 'src/app/core/services/error-handler.service';

// -------------------------------------------------------------
// 常數定義
// -------------------------------------------------------------
const maxRetries = 0;
// 注意：100000000ms 大約是 27.7 小時，在實際應用中可能過長，這裡保持您原設定。
const retryDelayMs = 100000000;
const timeoutMs = 1800000;


/**
 * 錯誤處理功能型攔截器
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn // 接收 HttpHandlerFn 類型
): Observable<HttpEvent<unknown>> => {

  // 修正 2：使用 inject 獲取 ErrorHandlerService
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe( // 修正 3：使用 next(req)
    // 1. 設定超時
    timeout(timeoutMs),

    // 2. 設定重試邏輯
    retry({
      count: maxRetries,
      delay: (error, retryCount) => {
        // 這裡的錯誤必須是 HttpErrorResponse，因為 retry 運算符只會處理請求失敗的錯誤
        if (error instanceof HttpErrorResponse && error.status === 0) {
          console.warn(`Retry attempt ${retryCount} for network error. Retrying in ${retryDelayMs}ms...`);
          return timer(retryDelayMs);
        } else {
          return throwError(() => error);
        }
      },
      resetOnSuccess: true
    }),

    // 3. 集中處理錯誤 (包括超時和重試失敗的錯誤)
    catchError((error: HttpErrorResponse | TimeoutError) => {
      if (error instanceof TimeoutError) {
        // 專門處理超時錯誤 (由 timeout 運算符拋出)
        console.error(`Request timed out after ${timeoutMs / 1000} seconds:`, error);

        const customError = new HttpErrorResponse({
          error: 'API request timed out.',
          status: 408, // Request Timeout
          statusText: 'Request Timeout',
          url: req.url,
        });
        // 呼叫注入的服務
        return errorHandler.handleError(customError);
      }
      // 處理其他所有錯誤 (包括 HttpErrorResponse)
      // 確保傳入的錯誤是 HttpErrorResponse 類型，如果不是，可能需要額外檢查。
      //    在 RxJS pipe 中，通常只會拋出 HttpErrorResponse 或 TimeoutError。
      return errorHandler.handleError(error as HttpErrorResponse);
    })
  );
};
