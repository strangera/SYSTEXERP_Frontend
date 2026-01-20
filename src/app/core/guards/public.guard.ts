import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@service/system/auth.service';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const loggedIn = this.authService.isLoggedIn();
    const fullUrl = window.location.href; // <== 直接用原始網址解析
    const redirect = route.queryParamMap.get('redirectURL') ?? route.queryParamMap.get('redirect');

    // 嘗試從原始網址中手動解析 redirectURL
    const manualMatch = (() => {
      const match = fullUrl.match(/[?&](redirectURL|redirect)=([^&#]+)/i);
      return match ? decodeURIComponent(match[2]) : '';
    })();

    const finalRedirect = redirect || manualMatch;

    console.log('[PublicGuard] isLoggedIn:', loggedIn, 'redirect:', finalRedirect);

    if (!loggedIn) return true;
    if (finalRedirect) {
      return true;
    }
    return this.router.parseUrl('/sso/dashboard');
  }

}
