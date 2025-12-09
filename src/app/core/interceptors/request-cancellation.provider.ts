// src/app/core/interceptors/request-cancellation.provider.ts (新檔案)

import { inject, isDevMode } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject } from 'rxjs';

// -------------------------------------------------------------------------
// 共享狀態和邏輯
// -------------------------------------------------------------------------

// 🚨 這是共享的中斷信號 Subject，必須在類別/函式外部定義，以便所有攔截器實例共享
export const cancelRequests$ = new Subject<void>();

// 這是您原始 Class 中定義的排除清單，現在作為外部可選參數
export const excludedUrls: string[] = [];
export const excludedRoutes: string[] = [];


/**
 * 設置函式：監聽路由變化並發出取消信號
 *  必須在頂層 (main.ts) 執行一次
 */
function setupRequestCancellation(router: Router): void {
  // 僅設置一次路由監聽
  router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    // 檢查是否為排除的路由
    const shouldExclude = excludedRoutes.some(excludedRoute =>
      event.url.startsWith(excludedRoute)
    );

    if (!shouldExclude) {
      // 路由改變時，發送中斷信號
      cancelRequests$.next();
      if (isDevMode()) {
        console.log('Requests cancelled due to NavigationEnd.');
      }
    }
  });
}

/**
 *  最佳實踐：創建一個 Provider 函式，用於設置路由監聽並提供攔截器
 */
export function provideRequestCancellationInterceptor() {
  const router = inject(Router);
  setupRequestCancellation(router); // 在應用程式啟動時設置監聽

  // 返回一個空陣列或一個提供者，但主要目的是運行 setup
  // 實際上，我們會將攔截器函式在 main.ts 中註冊
  return [];
}
