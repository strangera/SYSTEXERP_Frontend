import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
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
  ): boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }

    // 若路由有標記 data.role，實際做角色卡控（原本 guard 忽略它，使 { role: 'admin' } 形同虛設）。
    // 注意：前端卡控僅為「藏畫面」的深度防禦，真正權限以後端 admin 白名單為準。
    const requiredRole = route.data?.['role'] as string | undefined;
    if (requiredRole === 'admin' && this.authService.currentUserValue?.user_No !== 'admin') {
      return this.router.parseUrl('/login');
    }

    return true;
  }
}
