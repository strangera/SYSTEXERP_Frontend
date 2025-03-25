import { Inject, Injectable, NgZone } from '@angular/core';
import { AuthService } from '../../service/system/auth.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
// 為了實現10分鐘不活動後自動登出功能，你可以使用Angular的事件監聽功能來檢測用戶活動，並在一段時間內無活動時自動登出用戶。
export class InactivityService {
  private timeoutId: any;
  private readonly timeout: number = 10 * 60 * 1000; // 10 minutes

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone
  ) {
    this.startTimer();
    this.setupListener();
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
      this.router.navigate(['/account/login']);
      alert('You have been logged out due to inactivity.');
    });
  }
}
