import { inject, Injectable, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly router = inject(Router);
  public readonly isLoading = signal<boolean>(false);
  constructor() { this.setupRouterListener(); }
  private setupRouterListener(): void {
    this.router.events.subscribe((event: RouterEvent | any) => {
      if (event instanceof NavigationStart) {
        this.startLoading();// 當導航開始時，顯示載入條
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.stopLoading();// 當導航結束、取消或失敗時，隱藏載入條
      }
    });
  }

  // 啟動載入
  startLoading(): void {
    this.isLoading.set(true);
  }

  // 停止載入
  stopLoading(): void {
    this.isLoading.set(false);
  }
}
