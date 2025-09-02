import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, TimeoutError } from 'rxjs'; // <-- 導入 TimeoutError
import { catchError, retry, timeout } from 'rxjs/operators';
import { ErrorHandlerService } from '../service/system/error-handler.service';

@Injectable()
export class ErrorinterceptorService implements HttpInterceptor {

  constructor(private errorHandler: ErrorHandlerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const maxRetries = 0;
    const retryDelayMs = 100000000;
    const timeoutMs = 300000;

    return next.handle(req).pipe(
      timeout(timeoutMs),
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          if (error instanceof HttpErrorResponse && error.status === 0) {
            console.warn(`Retry attempt ${retryCount} for network error. Retrying in ${retryDelayMs}ms...`);
            return timer(retryDelayMs);
          } else {
            return throwError(() => error);
          }
        },
        resetOnSuccess: true
      }),
      catchError((error: HttpErrorResponse | TimeoutError) => { // <-- catchError 現在可以處理 TimeoutError
        if (error instanceof TimeoutError) {
          // 專門處理超時錯誤
          console.error(`Request timed out after ${timeoutMs / 1000} seconds:`, error);
          // 這裡可以返回一個帶有自訂訊息的新錯誤
          const customError = new HttpErrorResponse({
            error: 'API request timed out.',
            status: 408, // 408 Request Timeout 是一個合適的 HTTP 狀態碼
            statusText: 'Request Timeout',
            url: req.url,
          });
          return this.errorHandler.handleError(customError);
        }
        // 處理其他所有錯誤
        return this.errorHandler.handleError(error as HttpErrorResponse);
      })
    );
  }
}
