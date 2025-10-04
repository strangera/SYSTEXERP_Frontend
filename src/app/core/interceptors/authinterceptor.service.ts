import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@service/system/auth.service';

// 【Angular】Http 攔截器-HttpInterceptor
// https://medium.com/@paul87224/angular-http-%E6%94%94%E6%88%AA%E5%99%A8-httpinterceptor-49c20609eabe
@Injectable()
export class AuthinterceptorService implements HttpInterceptor {

  constructor(private readonly authService: AuthService) { }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 使用 AuthService 中判斷是否登入（包含 Token 是否過期）的方法
    // 注意：這裡只負責在請求發送前附加 Token
    // Token 過期或無效導致的 401 錯誤將由 ErrorinterceptorService 處理
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.currentUserValue; // 確保這裡能拿到有效的用戶信息
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${currentUser!.AccessToken}`) // 使用 ! 斷言，因為 isLoggedIn 已經確保了 currentUser 存在
      });
      return next.handle(clonedReq);
    }

    // 如果未登入或 Token 已過期（isLoggedIn() 為 false），則不附加 Token
    return next.handle(req);
  }
}
