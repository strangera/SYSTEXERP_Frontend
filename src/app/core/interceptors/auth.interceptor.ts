import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@service/system/auth.service';
import { catchError, Observable, throwError } from 'rxjs';

/**
 * 身份驗證功能型攔截器
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // 透過 inject() 獲取服務，取代舊的建構子注入
  const authService = inject(AuthService);

  let clonedReq = req;
  const currentUser = authService.currentUserValue;

  // 1. 添加 Token 邏輯
  if (authService.isLoggedIn() && currentUser?.AccessToken) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${currentUser.AccessToken}`)
    });
  }

  // 2. 處理請求並處理 401 錯誤邏輯
  return next(clonedReq).pipe(
    catchError((error) => {
      // 檢查是否為 401 Unauthorized 錯誤，且非登入請求
      if (error.status === 401 && !req.url.includes('/User/userLogin')) {
        console.warn('[AuthInterceptor] 偵測到 401 錯誤，強制執行登出流程。網址:', req.url);
        // 注意：功能型攔截器中調用方法
        // 功能型攔截器可以直接調用 inject(Service) 取得的服務方法
        authService.forceLogout('TokenExpired');
      }
      // 拋出其他錯誤
      return throwError(() => error);
    })
  );
};
