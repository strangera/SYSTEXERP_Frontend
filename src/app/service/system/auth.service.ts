import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  throwError,
  catchError,
  map,
  tap,
  of,
  switchMap,
  EMPTY
} from 'rxjs';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { EncryptionService } from '../../shared/service/encryption.service';
import { userLogin } from '../../shared/models/system/userLogin';
import { environment } from '../../../environments/environment';
import { UserInfo } from '../../shared/models/system/userInfo';
import { NotificationService } from '../../shared/component/notification-message/notification.service';
import { QueryStateService } from '../../shared/service/query-state.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { registerLocaleData } from '@angular/common';
import zhHant from '@angular/common/locales/zh-Hant';
import { InactivityService } from '../../core/services/inactivity.service';
import { UntilDestroy } from '@ngneat/until-destroy';

registerLocaleData(zhHant, 'zh-Hant-TW');

// ⚠️ 最佳實踐：建議將此介面移至共用的 interface 檔案 (例如 @shared/interface/api-response.ts)
export interface OuterTokenResponse {
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
  tokenType: string;
}

// ⚠️ 最佳實踐：建議將此介面移至共用的 interface 檔案
export interface ApiResponse<T, F = undefined> {
  Status: string;
  Data: T;
  footerData?: F;
  Error: {
    Code: string;
    Detail: string;
    Message: string;
  } | null;
  Meta: {
    Timestamp: string;
    RequestId: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl: string = environment.ApiUrl;
  private readonly jwtHelper: JwtHelperService = new JwtHelperService();
  // 核心使用者狀態管理
  private readonly userSubject: BehaviorSubject<UserInfo | null>;
  public readonly user: Observable<UserInfo | null>;
  // 用於登入流程的 IP
  private client_ip = '0.0.0.0';
  private inactivityService?: InactivityService;

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly encrypt: EncryptionService,
    private readonly notemessage: NotificationService,
    private readonly queryStateService: QueryStateService,
    private readonly httpBackend: HttpBackend, // 用於創建不經過攔截器的 HttpClient
    private readonly injector: Injector, // 用於延遲載入 InactivityService
  ) {
    // 1. 初始化使用者狀態
    const userStorage = this.getUserInfo();
    this.userSubject = new BehaviorSubject(userStorage);
    this.user = this.userSubject.asObservable();

    // 2. 獲取 IP 並更新狀態 (在 constructor 中執行一次)
    this.initializeClientIp();
  }

  /**
   * 封裝獲取外部 IP 的邏輯，只在 Service 建立時執行一次。
   * 使用 tap 處理副作用，避免在 constructor 中直接訂閱。
   */
  private initializeClientIp(): void {
    const ipClient = new HttpClient(this.httpBackend);

    ipClient.get<{ ip: string }>('https://api.ipify.org/?format=json').pipe(
      map(res => res.ip),
      // IP 獲取失敗時返回預設值 '0.0.0.0'，確保流程繼續
      catchError(() => of('0.0.0.0')),
      // 使用 tap 執行副作用：更新本地 IP 變數和儲存的使用者資訊
      tap(ip => {
        this.client_ip = ip;

        let userInfo = this.getUserInfo();
        if (userInfo) {
          // ⚠️ 注意：要建立新的物件來更新，以確保 immutability (雖然這裡只是服務內變數)
          userInfo = { ...userInfo, client_ip: ip };
          localStorage.setItem('UserInfo', JSON.stringify(userInfo));
          this.userSubject.next(userInfo);
        }
      })
      // 由於我們只在 constructor 中呼叫它一次，這裡必須訂閱來觸發 HTTP 請求
    ).subscribe();
  }

  // 最佳實踐：簡單 Getter
  public get currentUserValue(): UserInfo | null {
    return this.userSubject.value;
  }

  /**
   * 檢查用戶是否登入且 Token 未過期。
   * 最佳實踐：使用簡潔的布林判斷式。
   */
  isLoggedIn(): boolean {
    const user = this.userSubject.value;
    return !!user?.AccessToken && !this.jwtHelper.isTokenExpired(user.AccessToken);
  }

  /**
   * 處理用戶登入
   */
  login(data: userLogin, options?: { skipNavigate?: boolean }): Observable<ApiResponse<UserInfo>> {
    data.password = this.encrypt.getPassword(data.code as string, data.password as string);
    // 使用初始化時獲取到的 IP
    data.client_ip = this.client_ip;

    return this.http.post<ApiResponse<UserInfo>>(`${this.apiUrl}/User/userLogin`, data).pipe(
      // 處理後端業務邏輯狀態碼 (Status === '0000')
      map(response => {
        if (response.Status !== '0000') {
          // 拋出業務錯誤，讓訂閱者處理
          throw new Error(response.Message || 'Login failed');
        }
        return response;
      }),
      // 使用 tap 處理所有副作用 (Side Effects)
      tap(response => {
        let userInfo = response.Data;

        // 1. 確保 client_ip 更新到儲存和 Subject
        userInfo = { ...userInfo, client_ip: this.client_ip };
        localStorage.setItem('UserInfo', JSON.stringify(userInfo));
        this.userSubject.next(userInfo);

        // 2. 延遲初始化並啟動非活動服務
        this.inactivityService ??= this.injector.get(InactivityService);
        this.inactivityService.setupListener();
        this.inactivityService.startTimer();

        // 3. 清除查詢狀態
        this.queryStateService.clearAllQueryStates();

        // 4. 導航邏輯
        if (!options?.skipNavigate) {
          this.router.navigate(['/sso/dashboard']);
        }
      }),
      // 確保將所有錯誤導向給訂閱者或攔截器
      catchError(err => throwError(() => err))
    );
  }

  /**
   * 處理用戶登出
   */
  logout(): void {
    const user = this.getUserInfo();
    const token = user?.AccessToken;

    // 最佳實踐：使用 switchMap 鏈式處理，避免在 if 塊中訂閱。
    // 這個 Observable 鏈的目的是在有 Token 時發送登出請求，但不關心結果。
    of(token).pipe(
      // 如果有 Token，發送後端登出請求
      switchMap(t => t ? this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/User/userLogout`, {}).pipe(
        catchError(error => {
          // 即使後端登出失敗，也要繼續執行前端登出流程
          console.error('後端登出請求失敗:', error);
          return EMPTY; // 返回 EMPTY 讓 Observable 鏈結束
        })
      ) : EMPTY),
      // 最佳實踐：使用 UntilDestroy 管理 Service 自身的訂閱生命週期
      // 由於我們只是觸發一個 fire-and-forget 的 HTTP 請求，可以省略 untilDestroyed(this).subscribe()
    ).subscribe();

    // 統一清除邏輯 (前端登出的核心步驟，應立即執行)
    this.clearSessionAndLocalStorage();
  }

  /**
   * 統一清除本地儲存和導航
   */
  private clearSessionAndLocalStorage(): void {
    // ⚠️ 建議未來考慮只清除與 Auth 相關的 key，而不是 global clear()
    sessionStorage.clear();
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
    this.queryStateService.clearAllQueryStates();
    this.notemessage.infoBubble('已成功登出');
  }

  /**
   * 獲取使用者資訊
   */
  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('UserInfo');
    return userInfo ? JSON.parse(userInfo) as UserInfo : null;
  }

  /**
   * 獲取外部 Token
   */
  getOuterToken(): Observable<OuterTokenResponse> {
    // 最佳實踐：移除不必要的 headers，依賴 HTTP 攔截器處理
    return this.http.get<OuterTokenResponse>(`${this.apiUrl}/SSOLogin/getOuterToken`);
  }
}
