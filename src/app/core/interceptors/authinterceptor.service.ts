import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@service/system/auth.service';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class AuthinterceptorService implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let clonedReq = req;
    const currentUser = this.authService.currentUserValue;
    if (this.authService.isLoggedIn() && currentUser?.AccessToken) {
      clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${currentUser.AccessToken}`)
      });
    }
    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // 如果是 401 錯誤，且非登入請求本身 (避免無限迴圈)
        if (error.status === 401 && !req.url.includes('/User/userLogin')) {
          console.error('收到 401 錯誤，嘗試強制登出:', error.url);
          // 呼叫 AuthService 的強制登出方法 (見下一節優化)
          this.authService.forceLogout('TokenExpired');
          // 必須拋出錯誤，以便組件中的訂閱者知道請求失敗
          return throwError(() => error);
        }
        // 拋出其他錯誤
        return throwError(() => error);
      })
    );
  }
}
