import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '@service/system/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree { // 簡化返回類型
    if (this.authService.isLoggedIn()) { // 判斷用戶是否登入
      return true; // 允許訪問
    } else {
      // ✅ 調整：使用 parseUrl() 直接返回 UrlTree
      return this.router.parseUrl('/login'); // 未登入，導向登入頁面
    }
  }
}
