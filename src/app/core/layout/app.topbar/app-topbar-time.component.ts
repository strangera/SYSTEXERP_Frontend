import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { interval, map, switchMap, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@service/system/auth.service';

@Component({
  selector: 'app-topbar-time',
  template: `
    <div class="flex flex-row align-items-center font-bold text-primary justify-content-center col-flex gap-2 m-1 text-sm">
      <i class="pi pi-clock text-sm"></i>
      {{ now() | date: 'yyyy/MM/dd HH:mm:ss' }}
      @if (elapsed()) {
        <span class="text-color-secondary">｜登入時間 {{ elapsed() }}</span>
      }
      @if (countdown()) {
        <span class="text-color-secondary">｜登出時間 {{ countdown() }}</span>
      }
    </div>
  `,
  standalone: true,
  imports: [DatePipe]
})
export class AppTopbarTimeComponent {
  private readonly authService = inject(AuthService);

  public readonly now = toSignal(interval(1000).pipe(map(() => new Date())), { initialValue: new Date() });

  public readonly countdown = toSignal(
    this.authService.user.pipe(
      switchMap(u => {
        if (!u?.loginTime) return of(null);
        const logoutAt = new Date(u.loginTime).getTime() + 10 * 60 * 60 * 1000;
        return interval(1000).pipe(
          map(() => {
            const remaining = Math.max(0, Math.floor((logoutAt - Date.now()) / 1000));
            const h = Math.floor(remaining / 3600).toString().padStart(2, '0');
            const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, '0');
            const s = (remaining % 60).toString().padStart(2, '0');
            return `${h}:${m}:${s}`;
          })
        );
      })
    ),
    { initialValue: null }
  );

  public readonly elapsed = toSignal(
    this.authService.user.pipe(
      switchMap(u => {
        if (!u?.loginTime) return of(null);
        const loginAt = new Date(u.loginTime).getTime();
        return interval(1000).pipe(
          map(() => {
            const s = Math.floor((Date.now() - loginAt) / 1000);
            const h = Math.floor(s / 3600).toString().padStart(2, '0');
            const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
            const sec = (s % 60).toString().padStart(2, '0');
            return `${h}:${m}:${sec}`;
          })
        );
      })
    ),
    { initialValue: null }
  );
}