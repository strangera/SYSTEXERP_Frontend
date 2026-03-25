import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { userLogin } from '@shared/models/system/userInfo';
import { Button, ButtonDirective } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { first } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    PasswordModule,
    NgClass,
    Button,
    ButtonDirective,
  ],
})
export class LoginComponent implements OnInit {
  logoPath = 'assets/layout/images/systex.png';

  loginForm = this.formBuilder.group({
    code: ['' as string, Validators.required],
    password: ['' as string, Validators.required],
  });

  submitted = false;
  loading = false;

  version = environment.version;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private notemessage: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    console.log('[LoginComponent] ngOnInit triggered');

    // ---- 逃離 iframe ----
    try {
      if (typeof window !== 'undefined') {
        const topWin = window.top as (Window & typeof globalThis) | null;
        const selfWin = window.self as Window & typeof globalThis;
        if (topWin && topWin !== selfWin) {
          console.log('[LoginComponent] 逃離 iframe');
          topWin.location.replace(window.location.href);
          return;
        }
      }
    } catch {
      console.log('[LoginComponent] iframe try-catch fallback');
      window.location.replace(window.location.href);
      return;
    }

    // ===== 先處理 SSO 登出回呼 =====
    const ssoLogout = this.getQueryParamFromLocation('ssoLogout');

    console.log('[LoginComponent] ssoLogout(from location):', ssoLogout);
    console.log('[LoginComponent] current href:', window.location.href);

    if (ssoLogout === '1') {
      console.log('[LoginComponent] 偵測到 ssoLogout=1，執行 ERP 前後端同步登出');
      this.authService.ssoLogoutAndRedirectToLogin();
      return;
    }

    const loggedIn = this.authService.isLoggedIn();
    console.log('[LoginComponent] isLoggedIn:', loggedIn);

    if (loggedIn) {
      // 避免剛從外站 logout 回來，又自動重新 SSO
      if (!this.authService.canAutoSSO()) {
        console.log('[LoginComponent] canAutoSSO = false，停留在 login 頁');
        return;
      }

      // 已登入時，只看目前網址有沒有 redirectURL
      const redirect = this.getRedirectFromPreLoginOrLocation();
      console.log('[LoginComponent] redirect (ngOnInit):', redirect);

      if (redirect) {
        console.log('[LoginComponent] 已登入且有 redirectURL，開始 getOuterToken()');

        this.authService
          .getOuterToken()
          .pipe(first(), untilDestroyed(this))
          .subscribe({
            next: (res) => {
              console.log('[LoginComponent] getOuterToken success:', res);
              const target = this.appendOrReplaceParam(redirect, 'token', res.token);
              console.log('[LoginComponent] redirect to:', target);
              window.location.href = target;
            },
            error: (err) => {
              console.error('[LoginComponent] getOuterToken error:', err);
              this.notemessage.errorBubble('取得外部登入票證失敗，改為進入系統首頁');
              this.router.navigate(['/sso/dashboard']);
            },
          });

        return;
      }

      // 已登入而且沒有 redirectURL：直接進首頁
      this.router.navigate(['/sso/dashboard']);
    }
  }

  /**
   * 取出完整 redirectURL（只看目前網址，不吃 localStorage 舊資料）
   * 會把外層 formsflow_id、popup 等參數一起帶回去
   */
  private getRedirectFromPreLoginOrLocation(): string {
    try {
      const href = window.location.href;
      console.log('[getRedirectFromPreLoginOrLocation] href:', href);

      const u = new URL(href);

      const rawRedirect =
        u.searchParams.get('redirectURL') ||
        u.searchParams.get('redirecturl') ||
        u.searchParams.get('redirect') ||
        '';

      if (!rawRedirect) {
        console.log('[LoginComponent] no redirect in current URL');
        return '';
      }

      const outerParams = new URLSearchParams(u.search);
      outerParams.delete('redirectURL');
      outerParams.delete('redirecturl');
      outerParams.delete('redirect');
      outerParams.delete('ssoLogout'); // 避免把 ssoLogout 帶去外站

      const outerQuery = outerParams.toString();

      let baseRedirect = rawRedirect;
      try {
        baseRedirect = decodeURIComponent(rawRedirect);
      } catch {
        // ignore
      }

      if (!outerQuery) {
        console.log('[LoginComponent] redirect (no outerQuery):', baseRedirect);
        return baseRedirect;
      }

      const fullRedirect =
        baseRedirect + (baseRedirect.includes('?') ? '&' : '?') + outerQuery;

      console.log('[LoginComponent] redirect (merged outerQuery):', fullRedirect);
      return fullRedirect;
    } catch (err) {
      console.error('[getRedirectFromPreLoginOrLocation] error:', err);
      return '';
    }
  }

  /** 安全地把查詢參數（token）附加/覆蓋到 URL 上 */
  private appendOrReplaceParam(url: string, key: string, value: string): string {
    try {
      const u = new URL(url);
      u.searchParams.set(key, value);
      return u.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;

    if (frm.invalid) return;

    this.loading = true;

    this.authService
      .login(this.loginForm.value as userLogin, { skipNavigate: true })
      .pipe(first(), untilDestroyed(this))
      .subscribe({
        next: () => {
          this.notemessage.successBubble('登入成功');

          const redirect = this.getRedirectFromPreLoginOrLocation();
          console.log('[LoginComponent] redirect (onSubmit):', redirect);

          if (redirect) {
            this.authService
              .getOuterToken()
              .pipe(first(), untilDestroyed(this))
              .subscribe({
                next: (res) => {
                  const target = this.appendOrReplaceParam(redirect, 'token', res.token);
                  window.location.href = target;
                },
                error: () => {
                  this.notemessage.errorBubble('取得外部登入票證失敗，改為進入系統首頁');
                  this.router.navigate(['/sso/dashboard']);
                  this.loading = false;
                },
              });
          } else {
            this.router.navigate(['/sso/dashboard']);
            this.loading = false;
          }

          this.loading = false;
        },
        error: () => {
          this.loginForm.patchValue({ password: '' });
          this.loading = false;
        },
      });
  }
  private getQueryParamFromLocation(key: string): string {
    try {
      const u = new URL(window.location.href);

      for (const [k, v] of u.searchParams.entries()) {
        if (k.toLowerCase() === key.toLowerCase()) {
          return v;
        }
      }

      return '';
    } catch (err) {
      console.error('[getQueryParamFromLocation] error:', err);
      return '';
    }
  }
}
