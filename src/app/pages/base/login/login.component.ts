import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  logoPath = 'assets/layout/images/login_logo.webp';

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
  ) {}

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

    const loggedIn = this.authService.isLoggedIn();
    console.log('[LoginComponent] isLoggedIn:', loggedIn);

    if (loggedIn) {
      // ✅ 已登入時，只看「目前網址」有沒有 redirectURL
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

      // ✅ 已登入而且沒有 redirectURL：直接進首頁，不再亂跳到舊的外部網址
      this.router.navigate(['/sso/dashboard']);
    }
  }

  /**
   * 取出完整 redirectURL（只看「目前網址」，不再吃 localStorage 舊資料）
   * 會把外層的 formsflow_id、popup... 一起帶回去
   */
  private getRedirectFromPreLoginOrLocation(): string {
    try {
      const href = window.location.href;
      console.log('[getRedirectFromPreLoginOrLocation] href:', href);

      const u = new URL(href);

      // 1. 先抓 redirectURL / redirect 參數
      const rawRedirect =
        u.searchParams.get('redirectURL') ||
        u.searchParams.get('redirecturl') ||
        u.searchParams.get('redirect') ||
        '';

      if (!rawRedirect) {
        console.log('[LoginComponent] no redirect in current URL');
        return '';
      }

      // 2. 把外層其餘 query（formsflow_id、popup...）撿起來
      const outerParams = new URLSearchParams(u.search);
      outerParams.delete('redirectURL');
      outerParams.delete('redirecturl');
      outerParams.delete('redirect');

      const outerQuery = outerParams.toString(); // 例如：formsflow_id=1110&popup=1

      // 3. 處理可能被 encode 過的 redirectURL
      let baseRedirect = rawRedirect;
      try {
        baseRedirect = decodeURIComponent(rawRedirect);
      } catch {
        // 不是合法的 encode，就當作原字串用
      }

      if (!outerQuery) {
        console.log('[LoginComponent] redirect (no outerQuery):', baseRedirect);
        return baseRedirect;
      }

      // 4. 把外層 query 拼回去
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

  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (frm.invalid) return;

    this.loading = true;

    // 登入時不要自動導頁，由這裡決定要外跳或進首頁
    this.authService
      .login(this.loginForm.value as userLogin, { skipNavigate: true })
      .pipe(first(), untilDestroyed(this))
      .subscribe({
        next: () => {
          this.notemessage.successBubble('登入成功');

          // 一樣只看「目前這個網址」的 redirectURL
          const redirect = this.getRedirectFromPreLoginOrLocation();
          console.log('[LoginComponent] redirect (onSubmit):', redirect);

          if (redirect) {
            // 有 redirectURL：先取外部 token，再直跳外部網址
            this.authService
              .getOuterToken()
              .pipe(first(), untilDestroyed(this))
              .subscribe({
                next: (res) => {
                  const target = this.appendOrReplaceParam(redirect, 'token', res.token);
                  // 直接導到外部頁（同分頁）
                  window.location.href = target;
                },
                error: () => {
                  this.notemessage.errorBubble('取得外部登入票證失敗，改為進入系統首頁');
                  this.router.navigate(['/sso/dashboard']);
                  this.loading = false;
                },
              });
          } else {
            // 沒有 redirectURL：照舊進系統首頁
            this.router.navigate(['/sso/dashboard']);
            this.loading = false;
          }

          this.loading = false;
        },
        error: () => {
          this.loginForm.patchValue({ password: '' }); // 清空密碼
          this.loading = false; // 必須關閉 loading 狀態，否則按鈕會一直轉
        },
      });
  }
}
