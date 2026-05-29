import { inject, Injectable, isDevMode } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { filter, interval } from 'rxjs';
import { VersionCheckService } from './service/system/version-check.service';
@Injectable({ providedIn: 'root' })
export class AppInitializationService {
  private readonly router = inject(Router);
  private readonly swUpdate = inject(SwUpdate);
  private readonly notificationService = inject(NotificationService);
  private readonly versionCheckService = inject(VersionCheckService);
  initialize(): void {
    this.handleRouteLoadErrors();
    this.checkForAppUpdate();
    this.startVersionMonitoring();
  }
  private handleRouteLoadErrors(): void {
    this.router.events.pipe(filter((e): e is NavigationError => e instanceof NavigationError)).subscribe((error) => {
      const errorMsg = error.error?.message || '';
      if (errorMsg.includes('chunk') || errorMsg.includes('module')) {
        if (confirm('偵測到應用程式版本不符，必須重新載入頁面。')) {
          globalThis.location.reload();
        }
      }
    });
  }
  private checkForAppUpdate(): void {
    if (!isDevMode() && this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')).subscribe(() => {
        this.notificationService.infoBubble('應用程式已更新。正在重新載入頁面...', '系統更新');
        this.swUpdate.activateUpdate().then(() => globalThis.location.reload());
      });
      interval(5 * 60 * 1000).subscribe(() => this.swUpdate.checkForUpdate());
      this.swUpdate.checkForUpdate();
      globalThis.addEventListener('focus', () => this.swUpdate.checkForUpdate());
    }
  }
  private startVersionMonitoring(): void {
    this.versionCheckService.versionUpdateAvailable$.subscribe((newVersion) => {
      this.notificationService.infoBubble(
        `新版本 ${newVersion.version} 已發布！系統將在 3 秒後自動更新...`,
        '系統更新通知'
      );
      setTimeout(() => globalThis.location.reload(), 3000);
    });
  }
}
