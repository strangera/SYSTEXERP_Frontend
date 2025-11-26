import { registerLocaleData } from '@angular/common';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    // **修改: 創建 ipClient 仍需在 DI 系統外，所以保持 httpBackend 邏輯**
    const ipClient = new HttpClient(this.httpBackend);

    ipClient.get<{ ip: string }>('https://api.ipify.org/?format=json').pipe(
      untilDestroyed(this), // 配合 @UntilDestroy() 確保取消訂閱
      map(res => res.ip),
      catchError(() => of('0.0.0.0')),
      tap(ip => {
        this.client_ip = ip;

        let userInfo = this.getUserInfo();
        if (userInfo) {
          userInfo = { ...userInfo, client_ip: ip };
          localStorage.setItem('UserInfo', JSON.stringify(userInfo));
          this.userSubject.next(userInfo);
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
  // **修改: 返回 Observable<UserInfo>，而不是 ApiResponse<UserInfo>**
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

        // **修改: InactivityService 延遲初始化**
        // 這裡使用 inject() 函數獲取實例，這是現代 Angular 的最佳實踐
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
      // 確保將所有錯誤導向給訂閱者或攔截器 (保持原樣，但現在它會捕獲 validateApiResponse 拋出的 Error)
      catchError(err => throwError(() => err))
    );
  }

  // **新增: 強制登出方法 (供攔截器使用)**
  forceLogout(reason: 'Manual' | 'TokenExpired'): void {
    console.warn(`[AuthService] Force Logout due to: ${reason}`);
    // 統一清除邏輯，並給出錯誤提示
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
        // **修改: 增加一次 catchError 處理，確保後端請求失敗時也能繼續前端登出**
        catchError((error: HttpErrorResponse) => {
          console.error('後端登出請求失敗:', error);
          // 即使後端登出失敗，也要繼續執行前端登出流程
          return EMPTY; // 返回 EMPTY 讓 Observable 鏈結束
        })
      ) : EMPTY),
      // **修改: 在 subscribe 前執行 tap 確保執行清除邏輯**
      // 此處不需要 tap，只需確保 subscribe() 後執行 clearSessionAndLocalStorage()
    ).subscribe({
      complete: () => {
        // 不論 switchMap 是否成功或發送，最終執行前端清除
        this.clearSessionAndLocalStorage();
      }
    });
    // **移除: 避免在 subscribe() 外部呼叫 clearSessionAndLocalStorage() 導致重複**
    // this.clearSessionAndLocalStorage();
  }

  // 清除 SessionStorage 和 LocalStorage
  private clearSessionAndLocalStorage(): void {
    sessionStorage.clear();
    localStorage.removeItem('UserInfo'); // 只清除使用者資訊
    this.userSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
    this.queryStateService.clearAllQueryStates();
    // **修改: 避免與 forceLogout 訊息衝突，這裡只給 info 氣泡**
    this.notemessage.infoBubble('已成功登出');
  }

  // 獲取使用者資訊
  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('UserInfo');
    return userInfo ? JSON.parse(userInfo) as UserInfo : null;
  }

  // 獲取外部 Token
  getOuterToken(): Observable<OuterTokenResponse> {
    console.log('[AuthService] 呼叫 /SSOLogin/getOuterToken');
    return this.http.get<OuterTokenResponse>(`${this.apiUrl}/SSOLogin/getOuterToken`);
  }
}
