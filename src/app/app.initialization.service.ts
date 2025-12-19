import { Injectable, isDevMode } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { filter, interval } from 'rxjs';
import { VersionCheckService } from './service/system/version-check.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {
  constructor(
    private router: Router,
    private swUpdate: SwUpdate,
    private notificationService: NotificationService,
    private versionCheckService: VersionCheckService
  ) { }

  /**
   * 啟動所有全域監控任務
   */
  initialize(): void {
    this.handleRouteLoadErrors();
    this.checkForAppUpdate();
    this.startVersionMonitoring();
  }

  /**
   * 1. 監聽路由錯誤 (Lazy Loading 失敗)
   */
  private handleRouteLoadErrors(): void {
    this.router.events
      .pipe(filter((e): e is NavigationError => e instanceof NavigationError))
      .subscribe((error) => {
        const errorMsg = error.error?.message || '';
        if (errorMsg.includes('chunk') || errorMsg.includes('module')) {
          if (confirm('偵測到應用程式版本不符，必須重新載入頁面。')) {
            window.location.reload();
          }
        }
      });
  }

  /**
   * 2. Service Worker 更新檢查
   */
  private checkForAppUpdate(): void {
    if (!isDevMode() && this.swUpdate.isEnabled) {
      // 偵測到新版本
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.notificationService.infoBubble('應用程式已更新。正在重新載入頁面...', '系統更新');
          this.swUpdate.activateUpdate().then(() => window.location.reload());
        });

      // 定期與手動檢查
      interval(5 * 60 * 1000).subscribe(() => this.swUpdate.checkForUpdate());
      this.swUpdate.checkForUpdate();
      window.addEventListener('focus', () => this.swUpdate.checkForUpdate());
    }
  }

  /**
   * 3. 自定義版本監控 (version.json)
   */
  private startVersionMonitoring(): void {
    this.versionCheckService.versionUpdateAvailable$.subscribe((newVersion) => {
      this.notificationService.infoBubble(
        `新版本 ${newVersion.version} 已發布！系統將在 3 秒後自動更新...`,
        '系統更新通知'
      );
      setTimeout(() => window.location.reload(), 3000);
    });
    // 如果有需要，也可以在此啟動 versionCheckService.startVersionCheck();
  }
}
