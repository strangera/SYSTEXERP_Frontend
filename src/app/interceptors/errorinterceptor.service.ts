import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs'; // <-- 導入 timer
import { catchError, retry, tap } from 'rxjs/operators'; // 移除 delay，因為我們會手動用 timer
import { ErrorHandlerService } from '../service/system/error-handler.service';

/**
 * HTTP 錯誤攔截器。
 * 負責全局捕捉 HTTP 請求中的錯誤，將其委派給 ErrorHandlerService 進行處理，
 * 並實現重試邏輯，尤其針對網路錯誤或逾時情況。
 */
@Injectable()
export class ErrorinterceptorService implements HttpInterceptor {

  constructor(private errorHandler: ErrorHandlerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const maxRetries = 0; // 定義最大重試次數，可根據需求調整
    const retryDelayMs = 100000000; // 重試之間的延遲時間 (毫秒)

    return next.handle(req).pipe(
      // === 重試邏輯放在 catchError 之前 ===
      retry({
        count: maxRetries, // 最大重試次數
        delay: (error, retryCount) => {
          // 只對 status === 0 (網路錯誤/逾時) 進行重試
          if (error instanceof HttpErrorResponse && error.status === 0) {
            console.warn(`Retry attempt ${retryCount} for network error. Retrying in ${retryDelayMs}ms...`);
            // 返回一個 Observable，它會在指定延遲後發出一個值並完成
            return timer(retryDelayMs); // <-- 使用 timer 函數，它會返回一個 Observable
          } else {
            // 對於其他非網路錯誤，不重試，立即拋出錯誤
            return throwError(() => error); // <-- 這裡返回 throwError 仍然是正確的
          }
        },
        resetOnSuccess: true // 如果重試成功，重置重試計數器
      }),
      // === 錯誤處理放在重試邏輯之後 ===
      // 只有在所有重試嘗試都失敗後，才會進入 catchError 執行錯誤處理
      catchError((error: HttpErrorResponse) => {
        // 將錯誤委派給集中錯誤處理服務
        return this.errorHandler.handleError(error);
      })
    );
  }
}
