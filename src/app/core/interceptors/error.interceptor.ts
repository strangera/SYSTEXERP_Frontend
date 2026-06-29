import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core'; // 使用 inject 導入服務
import { catchError, Observable, retry, throwError, timeout, TimeoutError, timer } from 'rxjs';
import { ErrorHandlerService } from 'src/app/core/services/error-handler.service';

// -------------------------------------------------------------
// 常數定義
// -------------------------------------------------------------
// 【地雷 4】retry 常數修正
// 原本 maxRetries=0 → 底下整段 retry 是死碼；retryDelayMs=100000000ms（約 27.7 小時）是等著被人誤觸的地雷。
// 改為：網路錯誤時最多重試 2 次、每次間隔 1 秒（且僅限 GET，見下方 delay 邏輯）。
const maxRetries = 2;
const retryDelayMs = 1000;
// timeout 維持 30 分鐘：ERP 長報表查詢需要較長等待時間（經確認刻意保留）。
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
        // 只在「網路錯誤(status 0)」且「請求為 GET」時才重試。
        // 為什麼限定 GET：status 0 代表沒收到回應，但伺服器可能其實已處理；
        // 重送 POST/PUT/DELETE 在 ERP 會造成重複寫入/重複過帳，故僅重試冪等的 GET。
        const isNetworkError = error instanceof HttpErrorResponse && error.status === 0;
        const isIdempotent = req.method === 'GET';
        if (isNetworkError && isIdempotent) {
          console.warn(`Retry attempt ${retryCount} for network error on GET ${req.url}. Retrying in ${retryDelayMs}ms...`);
          return timer(retryDelayMs);
        }
        return throwError(() => error);
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
