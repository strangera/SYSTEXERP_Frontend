import { Inject, Injectable, NgZone } from '@angular/core';
import { AuthService } from './auth.service';
import { DOCUMENT } from '@angular/common';

// 為了實現10分鐘不活動後自動登出功能，你可以使用Angular的事件監聽功能來檢測用戶活動，並在一段時間內無活動時自動登出用戶。
@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeoutId: any;
  private readonly timeout: number = 10 * 60 * 1000 * 6 * 8; // 10 minutes

  constructor(
    private authService: AuthService,
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone
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
