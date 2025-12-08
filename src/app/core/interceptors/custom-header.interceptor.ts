import { formatDate } from '@angular/common';
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * 自定義標頭功能型攔截器
 */
export const customHeaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn // 接收 HttpHandlerFn 類型
): Observable<HttpEvent<unknown>> => {

  // 1. TransactionTime 計算
  // 注意：formatDate 函式不需要 DI，可以直接使用。
  // 由於瀏覽器端的 Date() 已經是本地時間，'Z' 結尾表示 UTC 偏移，確保後端能正確解析時間。
  const utc_now = formatDate(new Date(), 'yyyy/MM/ddThh:mm:ssZ', 'zh-Hant-TW');

  // 2. 設置自定義 Header
  const clonedReq = req.clone({
    headers: req.headers
      .set('X-API-KEY', environment.APIKey)
      .set('X-Service', environment.Service_Id)
      .set('X-Terminal', environment.Terminal_Id)
      .set('X-Merchant', environment.Merchant_Id)
      .set('X-TransactionTime', utc_now)
  });

  // 3. 處理請求 (使用功能型 next() 函式)
  return next(clonedReq); //  修正點：直接呼叫 next(clonedReq)
};
