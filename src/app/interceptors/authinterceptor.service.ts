import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/system/auth.service';

// 【Angular】Http 攔截器-HttpInterceptor
// https://medium.com/@paul87224/angular-http-%E6%94%94%E6%88%AA%E5%99%A8-httpinterceptor-49c20609eabe
@Injectable()
export class AuthinterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this.authService.currentUserValue;
    const isLoggedIn = currentUser && currentUser.access_token;

    // 確認這不是登錄請求 && 確定登入
    if (!req.url.includes('/account/login') && isLoggedIn) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${currentUser.access_token}`)
      });
      return next.handle(clonedReq);
    }

    return next.handle(req);
  }
}
