import { HttpClient } from '@angular/common/http';
import { inject, Injectable, isDevMode } from '@angular/core';
import { interval, Observable, of, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
  private readonly http = inject(HttpClient);
  private readonly currentVersion: string = environment.version;
  private currentHash: string | null = null;
  private readonly versionUrl: string = 'version.json';

  // 1. 明確定義 Subject 的型別
  public versionUpdateAvailable$ = new Subject<VersionInfo>();

  /**
   * 啟動版本檢查機制
   */
  public startVersionCheck(): void {
    if (isDevMode()) {
      return;
    }

    this.checkVersion();

    // 2. 在 pipe 中明確定義 input/output 型別
    interval(3 * 60 * 1000)
      .pipe(
        // 明確寫出 () => Observable<VersionInfo> 減少推導負擔
        switchMap((): Observable<VersionInfo | null> => this.fetchVersionInfo())
      )
      .subscribe({
        next: (remoteVersion: VersionInfo | null) => {
          if (remoteVersion) this.compareVersion(remoteVersion);
        },
        error: (error: unknown) => {
          console.error('[VersionCheck] Error:', error);
        },
      });

    globalThis.addEventListener('focus', () => this.checkVersion());
  }

  public checkVersion(): void {
    this.fetchVersionInfo().subscribe({
      next: (remoteVersion: VersionInfo | null) => {
        if (remoteVersion) this.compareVersion(remoteVersion);
      }
    });
  }

  /**
   * 3. 強制指定回傳型別為 Observable<VersionInfo | null>
   * 這是減輕 checkExpression 負擔最關鍵的一步
   */
  private fetchVersionInfo(): Observable<VersionInfo | null> {
    const timestamp: number = Date.now();
    const url = `${this.versionUrl}?t=${timestamp}`;

    return this.http.get<VersionInfo>(url).pipe(
      catchError((error: unknown): Observable<null> => {
        console.warn('[VersionCheck] Failed to fetch version.json', error);
        // 回傳 null 而不是 throw，可以保持 Stream 不會因為一次網路錯誤而終止 (Unsubscribe)
        return of(null);
      })
    );
  }

  private compareVersion(remoteVersion: VersionInfo): void {
    if (this.currentHash === null) {
      this.currentHash = remoteVersion.hash;
      return;
    }

    if (remoteVersion.hash !== this.currentHash) {
      this.versionUpdateAvailable$.next(remoteVersion);
    }
  }

  public getCurrentVersion(): string {
    return this.currentVersion;
  }
}
