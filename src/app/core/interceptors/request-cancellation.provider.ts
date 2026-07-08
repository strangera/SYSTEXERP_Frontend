import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, isDevMode, makeEnvironmentProviders } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter, Subject } from 'rxjs';

// -------------------------------------------------------------------------
// 共享狀態和邏輯
// -------------------------------------------------------------------------

// 這是共享的中斷信號 Subject，必須在類別/函式外部定義，以便所有攔截器實例共享
export const cancelRequests$ = new Subject<void>();

// 這是您原始 Class 中定義的排除清單，現在作為外部可選參數
// 這兩支是 fire-and-forget 的稽核／診斷紀錄 API：呼叫端用 catchError(() => EMPTY) 吞掉錯誤，
// 且常常緊接在「會觸發導航」的按鈕點擊之後送出（例如表格列點擊「detail」導頁、或導頁瞬間拋出的
// JS 例外），若被路由取消機制打斷，稽核軌跡／錯誤診斷會被靜默遺失且無感知，故排除。
export const excludedUrls: string[] = [
  '/SYS0700/insertSYS0790', // SYS0790 使用者作業按鈕歷程 LOG（OperationLogService）
  '/ClientLog/record-error', // 前端未攔截例外回報（GlobalErrorHandler）
  '/assets/i18n/', // ngx-translate 翻譯檔（TranslateHttpLoader），App 啟動期載入，
                   // 時間點常與「初始導航」的 NavigationStart 重疊，不屬於特定頁面生命週期，不可被取消
];
export const excludedRoutes: string[] = [];


/**
 * 設置函式：監聽路由變化並發出取消信號
 *  必須在頂層 (main.ts) 執行一次
 */
function setupRequestCancellation(router: Router): void {
  // 僅設置一次路由監聽
  router.events.pipe(
    filter((event): event is NavigationStart => event instanceof NavigationStart)
  ).subscribe((event: NavigationStart) => {
    // 檢查是否為排除的路由
    const shouldExclude = excludedRoutes.some(excludedRoute =>
      event.url.startsWith(excludedRoute)
    );

    if (!shouldExclude) {
      // 導航一開始（Guard/Resolver/新元件建構之前）就發送中斷信號，
      // 避免舊頁面請求與新頁面請求、DOM 卸載/建立同時搶資源
      cancelRequests$.next();
      if (isDevMode()) {
        console.log('Requests cancelled due to NavigationStart.');
      }
    }
  });
}

/**
 *  最佳實踐：創建一個 Provider 函式，用於設置路由監聽並提供攔截器
 *  必須在 main.ts 的 providers 陣列中以 provideRequestCancellationInterceptor() 註冊，
 *  否則 setupRequestCancellation 永遠不會執行，cancelRequests$ 永遠不會 emit，
 *  httpRequestInterceptor 的 takeUntil(cancelRequests$) 會形同虛設。
 */
export function provideRequestCancellationInterceptor(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => setupRequestCancellation(inject(Router)),
    },
  ]);
}
