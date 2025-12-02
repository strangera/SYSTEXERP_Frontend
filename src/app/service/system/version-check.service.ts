import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { environment } from '@environment';
import { interval, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export interface VersionInfo {
  version: string;
  buildTime: string;
  buildTimestamp: number;
  tag: string;
  hash: string;
}

@Injectable({
  providedIn: 'root',
})
export class VersionCheckService {
  private currentVersion: string = environment.version;
  private currentHash: string | null = null;

  // 版本更新事件
  public versionUpdateAvailable$ = new Subject<VersionInfo>();

  constructor(private readonly http: HttpClient) {}

  /**
   * 啟動版本檢查機制
   * 每 3 分鐘檢查一次 version.json
   */
  public startVersionCheck(): void {
    // 開發模式下不檢查
    if (isDevMode()) {
      console.log('[VersionCheck] 開發模式，跳過版本檢查');
      return;
    }

    console.log(`[VersionCheck] 啟動版本檢查服務 - 當前版本: ${this.currentVersion}`);

    // 立即檢查一次
    this.checkVersion();

    // 每 3 分鐘檢查一次
    interval(3 * 60 * 1000)
      .pipe(switchMap(() => this.fetchVersionInfo()))
      .subscribe({
        next: (remoteVersion) => {
          this.compareVersion(remoteVersion);
        },
        error: (error) => {
          console.error('[VersionCheck] 檢查版本時發生錯誤:', error);
        },
      });

    // 當視窗重新聚焦時也檢查
    window.addEventListener('focus', () => {
      console.log('[VersionCheck] 視窗重新聚焦，檢查版本...');
      this.checkVersion();
    });
  }

  /**
   * 手動檢查版本
   */
  public checkVersion(): void {
    this.fetchVersionInfo().subscribe({
      next: (remoteVersion) => {
        this.compareVersion(remoteVersion);
      },
      error: (error) => {
        console.error('[VersionCheck] 檢查版本時發生錯誤:', error);
      },
    });
  }

  /**
   * 取得遠端的 version.json
   */
  private fetchVersionInfo() {
    // 加上時間戳避免快取
    const timestamp = new Date().getTime();
    const versionUrl = `version.json?t=${timestamp}`;

    return this.http.get<VersionInfo>(versionUrl).pipe(
      catchError((error) => {
        console.warn('[VersionCheck] 無法取得 version.json:', error);
        throw error;
      })
    );
  }

  /**
   * 比對版本
   */
  private compareVersion(remoteVersion: VersionInfo): void {
    console.log('[VersionCheck] 遠端版本:', remoteVersion);
    console.log('[VersionCheck] 本地版本:', this.currentVersion);

    // 第一次取得 hash
    if (this.currentHash === null) {
      this.currentHash = remoteVersion.hash;
      console.log('[VersionCheck] 初始化 hash:', this.currentHash);
      return;
    }

    // 比對 hash 是否不同
    if (remoteVersion.hash !== this.currentHash) {
      console.warn(
        `[VersionCheck] 🔥 偵測到新版本! 遠端: ${remoteVersion.version} (${remoteVersion.hash}), 本地: ${this.currentVersion} (${this.currentHash})`
      );

      // 發送更新事件
      this.versionUpdateAvailable$.next(remoteVersion);
    } else {
      console.log('[VersionCheck] ✅ 版本一致，無需更新');
    }
  }

  /**
   * 取得當前版本資訊
   */
  public getCurrentVersion(): string {
    return this.currentVersion;
  }
}
