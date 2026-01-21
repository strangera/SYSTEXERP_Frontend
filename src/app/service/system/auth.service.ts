import { registerLocaleData } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import zhHant from '@angular/common/locales/zh-Hant';
import { inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'; // 確保導入 untilDestroyed
import { ApiResponse, validateApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { InactivityService } from '../../core/services/inactivity.service';
import { NotificationService } from '../../shared/component/notification-message/notification.service';
import { UserInfo, userLogin } from '../../shared/models/system/userInfo';
import { EncryptionService } from '../../shared/service/encryption.service';
import { QueryStateService } from '../../shared/service/query-state.service';

registerLocaleData(zhHant, 'zh-Hant-TW');

export interface OuterTokenResponse {
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
  tokenType: string;
}

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // **修改: 移除 Injector，使用 inject() 函數獲取服務實例**
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly encrypt = inject(EncryptionService);
  private readonly notemessage = inject(NotificationService);
  private readonly queryStateService = inject(QueryStateService);
  private readonly httpBackend = inject(HttpBackend); // 用於創建不經過攔截器的 HttpClient
  private readonly injector = inject(Injector);
  // ----------------------------------------------------
  // **修改: InactivityService 延遲載入優化**
  // 由於 InactivityService 僅在登入成功後使用，我們保留私有屬性，
  // 並在需要時（login 成功）透過 inject() 獲取實例。
  // ----------------------------------------------------
  private inactivityService?: InactivityService;

  private readonly apiUrl: string = environment.ApiUrl;
  private readonly jwtHelper: JwtHelperService = new JwtHelperService();
  private readonly userSubject: BehaviorSubject<UserInfo | null>;
  public readonly user: Observable<UserInfo | null>;
  private client_ip = '0.0.0.0';

  constructor(
    // 保持 constructor 為空，或只用於非 DI 相關的初始化（如 BehaviorSubject）
    // **移除所有 DI 參數，已改用 inject()**
  ) {
    // 1. 初始化使用者狀態
    const userStorage = this.getUserInfo();
    this.userSubject = new BehaviorSubject(userStorage);
    this.user = this.userSubject.asObservable();

    this.initializeClientIp();
  }

  // 初始化客戶端 IP
  private initializeClientIp(): void {
    const ipClient = new HttpClient(this.httpBackend);
    ipClient.get<{ ip: string }>('https://api.ipify.org/?format=json').pipe(
      untilDestroyed(this), // 配合 @UntilDestroy() 確保取消訂閱
      map(res => res.ip),
      catchError(() => of('0.0.0.0')),
      tap(ip => {
        this.client_ip = ip;
        const latestUserInfo = this.getUserInfo();
        if (latestUserInfo) {
          // 只更新 IP，保留最新的 AccessToken 和其他資訊
          const updatedUserInfo = {
            ...latestUserInfo,
            client_ip: ip
          };
          // 只有在 IP 真的有變時才更新，減少對系統的干擾
          if (latestUserInfo.client_ip !== ip) {
            localStorage.setItem('UserInfo', JSON.stringify(updatedUserInfo));
            this.userSubject.next(updatedUserInfo);
            console.log('[AuthService] Client IP 更新成功:', ip);
          }
        }
      })
    ).subscribe();
  }
  // 取得當前使用者
  public get currentUserValue(): UserInfo | null {
    return this.userSubject.value;
  }
  // 檢查是否已登入
  isLoggedIn(): boolean {
    const user = this.userSubject.value;
    return !!user?.AccessToken && !this.jwtHelper.isTokenExpired(user.AccessToken);
  }
  // 登入
  login(data: userLogin, options?: { skipNavigate?: boolean }): Observable<UserInfo> {
    data.password = this.encrypt.getPassword(data.code as string, data.password as string);
    data.client_ip = this.client_ip;
    return this.http.post<ApiResponse<UserInfo>>(`${this.apiUrl}/User/userLogin`, data).pipe(
      // **修改: 使用新的 validateApiResponse Operator 抽象化業務邏輯檢查**
      validateApiResponse<UserInfo>(),
      tap(userInfo => {
        const updatedUserInfo: UserInfo = {
          ...userInfo,
          client_ip: this.client_ip,
          mid: Number(userInfo.mid)
        };
        localStorage.setItem('UserInfo', JSON.stringify(updatedUserInfo));
        this.userSubject.next(updatedUserInfo);
        this.inactivityService ??= this.injector.get(InactivityService);
        this.inactivityService.setupListener();
        this.inactivityService.startTimer();
        // 清除查詢狀態
        this.queryStateService.clearAllQueryStates();
        // 導航邏輯
        if (!options?.skipNavigate) {
          this.router.navigate(['/sso/dashboard']);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  // 強制登出方法 (供攔截器使用)
  forceLogout(reason: 'Manual' | 'TokenExpired'): void {
    console.warn(`[AuthService] Force Logout due to: ${reason}`);
    this.clearSessionAndLocalStorage();
    this.notemessage.errorBubble('您的會話已過期或無效，請重新登入。');
  }

  // 登出
  logout(): void {
    const user = this.getUserInfo();
    const token = user?.AccessToken;
    of(token).pipe(
      // 如果有 Token，發送後端登出請求
      switchMap(t => t ? this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/User/userLogout`, {}).pipe(
        catchError(() => { return EMPTY; })
      ) : EMPTY),
    ).subscribe({
      complete: () => { this.clearSessionAndLocalStorage(); }
    });
  }

  // 清除 SessionStorage 和 LocalStorage
  private clearSessionAndLocalStorage(): void {
    sessionStorage.clear();
    localStorage.removeItem('UserInfo'); // 只清除使用者資訊
    this.userSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
    this.queryStateService.clearAllQueryStates();
    this.notemessage.infoBubble('已成功登出');
  }

  // 獲取使用者資訊
  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('UserInfo');
    return userInfo ? JSON.parse(userInfo) as UserInfo : null;
  }

  // 獲取外部 Token
  getOuterToken(): Observable<OuterTokenResponse> {
    return this.http.get<OuterTokenResponse>(`${this.apiUrl}/SSOLogin/getOuterToken`);
  }
}
