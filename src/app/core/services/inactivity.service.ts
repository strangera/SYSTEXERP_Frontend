import { Inject, Injectable, NgZone } from '@angular/core';
import { AuthService } from '../../service/system/auth.service';
import { DOCUMENT } from '@angular/common';

// 為了實現10分鐘不活動後自動登出功能，你可以使用Angular的事件監聽功能來檢測用戶活動，並在一段時間內無活動時自動登出用戶。
@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  private readonly timeout: number = 10 * 60 * 60 * 1000; // 10 hours

  constructor(
    private readonly authService: AuthService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly ngZone: NgZone
  ) {
  }

  setupListener(): void {
    this.ngZone.runOutsideAngular(() => {
      ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'].forEach(event => {
        this.document.addEventListener(event, () => this.resetTimer());
      });
    });
  }

  startTimer(): void {
    this.timeoutId = setTimeout(() => this.logout(), this.timeout);
  }

  resetTimer(): void {
    clearTimeout(this.timeoutId);
    this.startTimer();
  }

  logout(): void {
    this.ngZone.run(() => {
      this.authService.logout();
      alert('由於您已閒置一段時間，系統已自動登出，請重新登入以繼續使用。');
    });
  }
}
