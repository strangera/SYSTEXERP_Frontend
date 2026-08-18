import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { userLogin } from '@shared/models/system/userInfo';
import { Button, ButtonDirective } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { first } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../service/system/auth.service';
import { NotificationService } from '../../shared/components/notification-message/notification.service';
import { SsoDashboardService } from './sso-dashboard/sso-dashboard.service';

@Component({
  selector: 'app-login',
  template: `
  <div
    class="login-page fadein animation-duration-500 surface-ground flex align-items-center justify-content-center relative"
    style="min-height: 100dvh;">
    <div class="login-wrap flex flex-column align-items-center justify-content-center w-full sm:w-auto sm:py-4">
      <img [src]="logoPath" fetchpriority="high" alt="logo" loading="lazy"
        (click)="loginForm.controls.password.setValue(devPassword)"
        class="fadeindown animation-duration-500 hidden sm:block mb-5 w-full h-auto" style="max-width: 18rem;" />
      <div class="login-box card w-full sm:w-auto flex flex-column align-items-center justify-content-center">
        <div
          class="login-card w-full surface-card py-6 px-4 sm:px-6 flex flex-column justify-content-center">
          <div class="text-center mb-4">
            <img [src]="logoPath" fetchpriority="high" alt="logo"
              (click)="loginForm.controls.password.setValue(devPassword)"
              class="fadeindown animation-duration-500 sm:hidden mb-4 w-full h-auto mx-auto" style="max-width: 18rem;" />
            <div class="fadeindown animation-duration-500 text-900 text-3xl font-medium mb-3">請登入管理帳號</div>
          </div>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit(loginForm)" autocomplete="on">
            <div class="zoomin animation-duration-500 w-full sm:w-30rem mb-4">
              <label for="account_id" class="block text-900 text-xl font-medium mb-2">使用者帳號</label>
              <input #accountInput id="account_id" name="username" type="text" formControlName="code"
                placeholder="帳號" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false"
                enterkeyhint="next" class="w-full p-3 p-inputtext text-base" />
              <small class="p-error block mt-1" style="min-height: 1.25rem;">
                @if (submitted && loginForm.get('code')?.hasError('required')) { 請輸入帳號 }
              </small>
            </div>
            <div class="zoomin animation-duration-500 w-full mb-4">
              <label for="password" class="block text-900 font-medium text-xl mb-2">使用者密碼</label>
              <p-password id="password" formControlName="password" placeholder="密碼"
                [class.ng-invalid]="submitted && !!loginForm.controls.password.errors"
                [class.ng-dirty]="submitted && !!loginForm.controls.password.errors"
                [toggleMask]="true" [feedback]="false" autocomplete="current-password"
                inputStyleClass="w-full p-3 text-base" styleClass="w-full">
              </p-password>
              <small class="p-error block mt-1" style="min-height: 1.25rem;">
                @if (submitted && loginForm.get('password')?.hasError('required')) { 請輸入密碼 }
              </small>
            </div>
            <p-button type="submit" pButton pRipple label="登入" class="zoomin animation-duration-500 w-full p-0"
              styleClass="w-full p-3 text-xl" [icon]="loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'"
              [disabled]="loading">
            </p-button>
          </form>
        </div>
      </div>
    </div>

    <div class="fixed text-color-secondary text-sm z-1"
      style="bottom: calc(10px + env(safe-area-inset-bottom)); right: calc(10px + env(safe-area-inset-right));">
      {{ version }}
    </div>
  </div>
  `,
  styles: [`
    /* 手機版：登入卡片改為滿版鋪滿上下邊界，貼合真實 App 的登入頁感受 */
    @media screen and (max-width: 575.98px) {
      .login-page { align-items: stretch; }
      .login-wrap { min-height: 100dvh; }
      .login-box { min-height: 100dvh; border: none; border-radius: 0; box-shadow: none; margin-bottom: 0; }
      .login-card { min-height: 100dvh; }
    }
  `],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PasswordModule,
    Button,
    ButtonDirective,
  ],
})
export class LoginComponent implements OnInit, AfterViewInit {
  private readonly ssoDashboardService = inject(SsoDashboardService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly notemessage = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('accountInput') accountInput?: ElementRef<HTMLInputElement>;

  logoPath = 'assets/layout/images/logo-systex.webp';
  devPassword = environment.devPassword;
  loginForm = this.formBuilder.group({
    code: ['' as string, Validators.required],
    password: ['' as string, Validators.required],
  });
  submitted = false;
  loading = false;
  version = environment.version;

  ngOnInit(): void {
    // ---- 逃離 iframe ----
    try {
      if (typeof globalThis !== 'undefined') {
        const topWin = globalThis.top as (Window & typeof globalThis) | null;
        const selfWin = globalThis.self as Window & typeof globalThis;
        if (topWin && topWin !== selfWin) {
          topWin.location.replace(globalThis.location.href);
          return;
        }
      }
    } catch {
      globalThis.location.replace(globalThis.location.href);
      return;
    }

    const ssoLogout = this.getQueryParamFromLocation('ssoLogout');
    if (ssoLogout === '1') {
      this.authService.ssoLogoutAndRedirectToLogin();
      return;
    }

    const loggedIn = this.authService.isLoggedIn();
    if (loggedIn) {
      if (!this.authService.canAutoSSO()) return;

      const redirect = this.getRedirectFromPreLoginOrLocation();
      if (redirect) {
        this.ssoDashboardService
          .getOuterToken()
          .pipe(first(), takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              globalThis.location.href = this.appendOrReplaceParam(redirect, 'token', res.token);
            },
            error: () => {
              this.notemessage.errorBubble('取得外部登入票證失敗，改為進入系統首頁');
              this.router.navigate(['/sso/dashboard']);
            },
          });
        return;
      }

      this.router.navigate(['/sso/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    // 觸控裝置不搶先 focus，避免一進頁面就跳出虛擬鍵盤蓋住登入卡片
    if (globalThis.matchMedia?.('(pointer: fine)').matches) {
      this.accountInput?.nativeElement.focus();
    }
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    if (frm.invalid) return;

    this.loading = true;
    frm.disable();
    this.authService
      .login(this.loginForm.value as userLogin, { skipNavigate: true })
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notemessage.successBubble('登入成功');
          const redirect = this.getRedirectFromPreLoginOrLocation();
          if (redirect) {
            this.ssoDashboardService
              .getOuterToken()
              .pipe(first(), takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (res) => {
                  globalThis.location.href = this.appendOrReplaceParam(redirect, 'token', res.token);
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
        },
        error: () => {
          this.loginForm.patchValue({ password: '' });
          this.loginForm.enable();
          this.loading = false;
        },
      });
  }

  private getRedirectFromPreLoginOrLocation(): string {
    try {
      const href = globalThis.location.href;
      const u = new URL(href);
      const rawRedirect =
        u.searchParams.get('redirectURL') ||
        u.searchParams.get('redirecturl') ||
        u.searchParams.get('redirect') ||
        '';

      if (!rawRedirect) return '';

      const outerParams = new URLSearchParams(u.search);
      outerParams.delete('redirectURL');
      outerParams.delete('redirecturl');
      outerParams.delete('redirect');
      outerParams.delete('ssoLogout');

      let baseRedirect = rawRedirect;
      try {
        baseRedirect = decodeURIComponent(rawRedirect);
      } catch { /* ignore */ }

      const outerQuery = outerParams.toString();
      if (!outerQuery) return baseRedirect;

      return baseRedirect + (baseRedirect.includes('?') ? '&' : '?') + outerQuery;
    } catch {
      return '';
    }
  }

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

  private getQueryParamFromLocation(key: string): string {
    try {
      const u = new URL(globalThis.location.href);
      for (const [k, v] of u.searchParams.entries()) {
        if (k.toLowerCase() === key.toLowerCase()) return v;
      }
      return '';
    } catch {
      return '';
    }
  }
}
