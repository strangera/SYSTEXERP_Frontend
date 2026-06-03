import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@service/system/auth.service';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const loggedIn = this.authService.isLoggedIn();
    const fullUrl = window.location.href;

    const redirect =
      route.queryParamMap.get('redirectURL') ||
      route.queryParamMap.get('redirecturl') ||
      route.queryParamMap.get('redirect') ||
      '';

    const ssoLogout =
      route.queryParamMap.get('ssoLogout') ||
      route.queryParamMap.get('ssologout') ||
      this.getQueryParamFromUrl(fullUrl, 'ssoLogout') ||
      this.getQueryParamFromUrl(fullUrl, 'ssologout');

    const manualRedirect =
      this.getQueryParamFromUrl(fullUrl, 'redirectURL') ||
      this.getQueryParamFromUrl(fullUrl, 'redirecturl') ||
      this.getQueryParamFromUrl(fullUrl, 'redirect');

    const finalRedirect = redirect || manualRedirect;

    if (ssoLogout === '1') {
      return true;
    }

    if (!loggedIn) {
      return true;
    }

    if (finalRedirect) {
      return true;
    }

    return this.router.parseUrl('/sso/dashboard');
  }

  private getQueryParamFromUrl(url: string, key: string): string {
    try {
      const u = new URL(url);
      return u.searchParams.get(key) ?? '';
    } catch {
      const match = url.match(new RegExp(`[?&]${key}=([^&#]+)`, 'i'));
      return match ? decodeURIComponent(match[1]) : '';
    }
  }
}
