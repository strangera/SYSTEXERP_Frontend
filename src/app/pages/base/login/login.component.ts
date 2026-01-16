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

  /** 只存一次：目前登入頁的完整 URL（用於攜帶 redirectURL） */
  private readonly URL_KEY = 'preLoginUrlOnce';
  version = environment.version;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private notemessage: NotificationService,
    private router: Router,
  ) { }
  ngOnInit(): void {
    console.log('[LoginComponent] ngOnInit triggered');

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
      const redirect = this.getRedirectFromPreLoginOrLocation();
      console.log('[LoginComponent] redirect:', redirect);

      if (redirect) {
        console.log('[LoginComponent] 已登入且有 redirectURL，開始 getOuterToken()');
        this.saveCurrentUrlOnce();

        this.authService.getOuterToken()
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
            }
          });

        return;
      }
    }
  }

  private saveCurrentUrlOnce(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(this.URL_KEY)) {
        localStorage.setItem(this.URL_KEY, window.location.href);
        // 如需可讀版可改用 decodeURI(window.location.href)
      }
    } catch {
      // 無痕/空間不足忽略
    }
  }

 /** 取出完整 redirectURL（包含外層的 formsflow_id、popup 等） */
private getRedirectFromPreLoginOrLocation(): string {
  try {
    // 1. 先用目前網址來組 redirect
    const href = window.location.href;
    console.log('[getRedirectFromPreLoginOrLocation] href:', href);

    const u = new URL(href);

    // 1-1. 先抓 redirectURL / redirect 參數（可能沒 encode，也可能有）
    const rawRedirect =
      u.searchParams.get('redirectURL') ||
      u.searchParams.get('redirecturl') ||
      u.searchParams.get('redirect') ||
      '';

    // 沒帶 redirect，就直接走 localStorage fallback
    if (!rawRedirect) {
      return this.getRedirectFromStorageFallback();
    }

    // 1-2. 把外層其餘 query（formsflow_id、popup...）撿起來
    const outerParams = new URLSearchParams(u.search);
    outerParams.delete('redirectURL');
    outerParams.delete('redirecturl');
    outerParams.delete('redirect');

    const outerQuery = outerParams.toString(); // 例如：formsflow_id=1110&popup=1

    // 1-3. 處理可能被 encode 過的 redirectURL
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

    // 1-4. 把外層 query 拼回去
    const fullRedirect =
      baseRedirect + (baseRedirect.includes('?') ? '&' : '?') + outerQuery;

    console.log('[LoginComponent] redirect (merged outerQuery):', fullRedirect);
    return fullRedirect;
  } catch (err) {
    console.error('[getRedirectFromPreLoginOrLocation] error:', err);
    return this.getRedirectFromStorageFallback();
  }
}

/** 從 localStorage 裡的 preLoginUrlOnce 再做一次同樣的解析（備援用） */
private getRedirectFromStorageFallback(): string {
  try {
    const raw = localStorage.getItem(this.URL_KEY);
    if (!raw) {
      console.log('[LoginComponent] redirect not found in storage');
      return '';
    }

    const u = new URL(raw);
    const rawRedirect =
      u.searchParams.get('redirectURL') ||
      u.searchParams.get('redirecturl') ||
      u.searchParams.get('redirect') ||
      '';

    if (!rawRedirect) {
      console.log('[LoginComponent] redirect not found in storage URL');
      return '';
    }

    const outerParams = new URLSearchParams(u.search);
    outerParams.delete('redirectURL');
    outerParams.delete('redirecturl');
    outerParams.delete('redirect');

    const outerQuery = outerParams.toString();

    let baseRedirect = rawRedirect;
    try {
      baseRedirect = decodeURIComponent(rawRedirect);
    } catch {
      // ignore
    }

    if (!outerQuery) {
      console.log('[LoginComponent] redirect (storage, no outerQuery):', baseRedirect);
      return baseRedirect;
    }

    const fullRedirect =
      baseRedirect + (baseRedirect.includes('?') ? '&' : '?') + outerQuery;

    console.log('[LoginComponent] redirect (storage merged):', fullRedirect);
    return fullRedirect;
  } catch (err) {
    console.error('[getRedirectFromStorageFallback] error:', err);
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

    // 送出前記錄一次目前 URL（攜帶 redirectURL）
    this.saveCurrentUrlOnce();

    if (frm.invalid) return;

    this.loading = true;

    // 關鍵：登入時要求 AuthService 先不要自動導頁
    this.authService.login(this.loginForm.value as userLogin, { skipNavigate: true })
      .pipe(first(), untilDestroyed(this))
      .subscribe({
        next: () => {
          this.notemessage.successBubble('登入成功');

          const redirect = this.getRedirectFromPreLoginOrLocation();

          if (redirect) {
            // 有 redirectURL：先取外部 token，再直跳外部網址
            this.authService.getOuterToken()
              .pipe(first(), untilDestroyed(this))
              .subscribe({
                next: (res) => {
                  const target = this.appendOrReplaceParam(redirect, 'token', res.token);

                  // 若只想用一次，開啟這行清掉
                  // localStorage.removeItem(this.URL_KEY);

                  // 直接導到外部頁（同分頁）
                  window.location.href = target;
                },
                error: () => {
                  this.notemessage.errorBubble('取得外部登入票證失敗，改為進入系統首頁');
                  this.router.navigate(['/sso/dashboard']);
                  this.loading = false;
                }
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
        }
      });
  }
}
