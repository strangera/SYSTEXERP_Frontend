import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, takeUntil } from 'rxjs';
import { cancelRequests$, excludedUrls } from './request-cancellation.provider';


/**
 * 路由變更時取消請求功能型攔截器
 */
export const httpRequestInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  // 檢查是否為排除的API路徑
  const shouldExcludeRequest = excludedUrls.some(excludedUrl =>
    req.url.includes(excludedUrl)
  );

  // 如果是排除的API請求，則不受路由變更影響
  if (shouldExcludeRequest) {
    return next(req); //  使用 next(req)
  }

  // 在路由改變時自動中斷請求
  return next(req).pipe( //  使用 next(req)
    takeUntil(cancelRequests$) // 訂閱共享的中斷信號
  );
};
