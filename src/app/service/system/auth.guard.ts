import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    const funRightsInfo = sessionStorage.getItem('FunRightsInfo');
    const isDashboard = state.url === '/SSO/dashboard';
    if (!funRightsInfo && !isDashboard) {
      return this.router.createUrlTree(['/SSO/dashboard']);
    }
    return true;
  }
}
