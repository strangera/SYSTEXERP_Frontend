// public.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from '@service/system/auth.service';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }
  // public.guard.ts
  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const loggedIn = this.auth.isLoggedIn();
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
      console.log('[PublicGuard] 已登入且帶 redirectURL，放行');
      return true;
    }

    console.log('[PublicGuard] 已登入但未帶 redirect，導回 /sso/dashboard');
    return this.router.parseUrl('/sso/dashboard');
  }

}
