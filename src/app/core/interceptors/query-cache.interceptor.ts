import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { QueryStateService } from '@shared/service/query-state.service';
import { Observable, tap } from 'rxjs';

/**
 * 查詢快取功能型攔截器
 */
export const queryCacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  // 修正 1：使用 inject() 獲取服務
  const queryState = inject(QueryStateService);

  // 修正 2：使用 next(req)
  return next(req).pipe(
    tap(event => {
      // 檢查是否為成功的 HttpResponse
      if (event instanceof HttpResponse && event.status === 200) {
        // 取得 API 路徑的最後一部分作為 Key
        const api = req.url.split('/').pop();

        if (api) {
          // 呼叫注入的服務方法
          // 注意：您使用 req.body 作為快取的值。
          //    如果這是 GET 請求，req.body 通常是 null 或 undefined。
          //    如果目的是快取響應結果 (response data)，應該使用 event.body。
          //    但這裡保持您原始的 req.body 邏輯。
          queryState.setQueryState(`${api}`, req.body);
        }
      }
    })
  );
};
