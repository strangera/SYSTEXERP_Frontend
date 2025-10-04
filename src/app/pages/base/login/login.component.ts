import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { first } from 'rxjs';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../../service/system/auth.service';
import { userLogin } from '../../../shared/models/system/userLogin';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { PasswordModule } from 'primeng/password';
import { Button, ButtonDirective } from 'primeng/button';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

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
    try {
      if (typeof window !== 'undefined') {
        const topWin = window.top as (Window & typeof globalThis) | null;
        const selfWin = window.self as Window & typeof globalThis;

        if (topWin && topWin !== selfWin) {
          // 用 replace 避免使用者按上一頁又回到被嵌頁面造成循環
          topWin.location.replace(window.location.href);
          return;
        }
      }
    } catch {
      // 跨網域取 top 可能丟錯，fallback：至少把自己導向本頁以跳脫 iframe
      window.location.replace(window.location.href);
    }
  }

  /** 只存一次，目前頁面實際的完整 URL（例如 http://localhost:4200/login?...） */
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

  /** 取出 redirectURL（優先讀取目前網址，其次讀 localStorage: preLoginUrlOnce） */
  private getRedirectFromPreLoginOrLocation(): string {
    // 先讀目前網址
    try {
      const u = new URL(window.location.href);
      const direct = u.searchParams.get('redirectURL') || u.searchParams.get('redirect') || '';
      if (direct) return decodeURIComponent(direct);
    } catch { /* ignore */ }

    // 再讀 preLoginUrlOnce
    const raw = localStorage.getItem(this.URL_KEY);
    if (!raw) return '';

    const q = raw.indexOf('?');
    if (q === -1) return '';
    const qs = raw.slice(q + 1);

    for (const kv of qs.split('&')) {
      if (!kv) continue;
      const [k, v = ''] = kv.split('=');
      if (!k) continue;
      const key = k.toLowerCase();
      if (key === 'redirecturl' || key === 'redirect') {
        try { return decodeURIComponent(v); } catch { return v; }
      }
    }
    return '';
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

    // ✅ 關鍵：登入時要求 AuthService 先不要自動導頁
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
                }
              });
          } else {
            // 沒有 redirectURL：照舊進系統首頁
            this.router.navigate(['/sso/dashboard']);
          }

          this.loading = false;
        },
        error: () => {
          this.loginForm.patchValue({ password: '' }); // 清空密碼
          this.loading = false;
        }
      });

    this.notemessage.unblockUi();
  }
}
