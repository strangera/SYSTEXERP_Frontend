import { LocationStrategy, registerLocaleData } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import zhHant from '@angular/common/locales/zh-Hant';
import { inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ApiResponse, validateApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  of,
  tap,
  throwError
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { InactivityService } from '../../core/services/inactivity.service';
import { NotificationService } from '../../shared/components/notification-message/notification.service';
import { UserInfo, userLogin } from '../../shared/models/system/userInfo';
import { EncryptionService } from '../../shared/service/encryption.service';
import { QueryStateService } from '../../shared/service/query-state.service';
import { SystemDataService } from './system-data.service';

registerLocaleData(zhHant, 'zh-Hant-TW');
@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly encrypt = inject(EncryptionService);
  private readonly notemessage = inject(NotificationService);
  private readonly queryStateService = inject(QueryStateService);
  private readonly httpBackend = inject(HttpBackend);
  private readonly injector = inject(Injector);
  private readonly systemDataService = inject(SystemDataService);
  private readonly locationStrategy = inject(LocationStrategy);
  private inactivityService?: InactivityService;
  private readonly apiUrl: string = environment.ApiUrl;
  private readonly jwtHelper: JwtHelperService = new JwtHelperService();
  private readonly userSubject: BehaviorSubject<UserInfo | null>;
  public readonly user: Observable<UserInfo | null>;
  private client_ip = '0.0.0.0';
  private isLoggingOut = false; // 新增防抖標記

  constructor() {
    const userStorage = this.getUserInfo();
    this.userSubject = new BehaviorSubject(userStorage);
    this.user = this.userSubject.asObservable();

    this.initializeClientIp();
  }

  // 初始化客戶端 IP
  private initializeClientIp(): void {
    const ipClient = new HttpClient(this.httpBackend);
    ipClient.get<{ ip: string }>('https://api.ipify.org/?format=json').pipe(
      untilDestroyed(this),
      map(res => res.ip),
      catchError(() => of('0.0.0.0')),
      tap(ip => {
        this.client_ip = ip;
        const latestUserInfo = this.getUserInfo();
        if (latestUserInfo) {
          const updatedUserInfo = {
            ...latestUserInfo,
            client_ip: ip
          };

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

  // 沿用舊密碼展延到期日後，同步更新本機使用者資訊，不需重新登入
  updatePwdExpireDate(pwdExpireDate: string): void {
    const latestUserInfo = this.getUserInfo();
    if (!latestUserInfo) return;

    const updatedUserInfo: UserInfo = { ...latestUserInfo, USER_PwdExpireDate: pwdExpireDate };
    localStorage.setItem('UserInfo', JSON.stringify(updatedUserInfo));
    this.userSubject.next(updatedUserInfo);
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
      validateApiResponse<UserInfo>(),
      tap(userInfo => {
        const updatedUserInfo: UserInfo = {
          ...userInfo,
          client_ip: this.client_ip,
          mid: Number(userInfo.mid),
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('UserInfo', JSON.stringify(updatedUserInfo));
        sessionStorage.removeItem('SSO_LOGOUT');
        this.userSubject.next(updatedUserInfo);
        this.inactivityService ??= this.injector.get(InactivityService);
        this.inactivityService.setupListener();
        this.inactivityService.startTimer();
        this.queryStateService.clearAllQueryStates();
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
    this.clearSessionAndLocalStorage({
      redirectToLogin: true,
      showMessage: false
    });
    this.notemessage.errorBubble('您的會話已過期或無效，請重新登入。');
  }

  // 一般登出：前後端都登出
  logout(): void {
    this.logoutToBackendAndClear({
      body: {},
      redirectToLogin: true,
      showMessage: true,
      message: '已成功登出'
    });
  }

  // SSO 外站登出回 ERP 時使用：前後端都登出，回 login
  ssoLogoutAndRedirectToLogin(): void {
    sessionStorage.setItem('SSO_LOGOUT', '1');

    this.logoutToBackendAndClear({
      body: { source: 'SSO_LOGOUT' },
      redirectToLogin: true,
      showMessage: false
    });
  }

  // 共用登出流程
  private logoutToBackendAndClear(options: { body: unknown; redirectToLogin: boolean; showMessage: boolean; message?: string; }): void {
    if (this.isLoggingOut) return; // 如果正在登出中，直接攔截
    this.isLoggingOut = true;

    const user = this.getUserInfo();
    const token = user?.AccessToken;

    // 先把前端狀態清掉，防止組件偵測到 User 變更而發送其他請求
    // 這一步能解決「登出時又去打 GetUserDashboard」的問題
    if (token) {
      this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/User/userLogout`, options.body).pipe(
        catchError(err => {
          console.warn('[AuthService] logout API failed:', err);
          return of(null);
        }),
        finalize(() => {
          this.isLoggingOut = false;
          this.clearSessionAndLocalStorage(options);
        })
      ).subscribe();
    } else {
      this.isLoggingOut = false;
      this.clearSessionAndLocalStorage(options);
    }
  }

  // 清除 SessionStorage 和 LocalStorage
  private clearSessionAndLocalStorage(options?: { redirectToLogin?: boolean; showMessage?: boolean; message?: string; }): void {
    // 順序很重要：先重置資料，再跳轉
    sessionStorage.clear();
    localStorage.removeItem('UserInfo');

    // 關鍵：先讓 UserSubject 變 null
    this.userSubject.next(null);
    this.queryStateService.clearAllQueryStates();

    // 清空權限緩存
    this.systemDataService.resetData();

    if (options?.redirectToLogin) {
      // 不要只用 navigate，改用這個可以 100% 銷毀所有 Service 記憶體殘留
      globalThis.location.href = globalThis.location.origin + (this.locationStrategy.prepareExternalUrl('/login'));
    }

    if (options?.showMessage) {
      this.notemessage.infoBubble(options.message ?? '已成功登出');
    }
  }

  // 獲取使用者資訊
  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('UserInfo');
    return userInfo ? JSON.parse(userInfo) as UserInfo : null;
  }

  // 是否允許自動 SSO
  canAutoSSO(): boolean {
    return sessionStorage.getItem('SSO_LOGOUT') !== '1';
  }
}
