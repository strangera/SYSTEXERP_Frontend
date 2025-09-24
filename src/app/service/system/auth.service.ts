import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { EncryptionService } from '../../shared/service/encryption.service';
import { catchError, map } from 'rxjs/operators';
import { userLogin } from '../../shared/models/system/userLogin';
import { environment } from '../../../environments/environment';
import { FunsrightInfo } from '../../shared/models/system/funsrightInfo';
import { UserInfo } from '../../shared/models/system/userInfo';
import { NotificationService } from '../../shared/component/notification-message/notification.service';
import { QueryStateService } from '../../shared/service/query-state.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { registerLocaleData } from '@angular/common';
import zhHant from '@angular/common/locales/zh-Hant';
import { InactivityService } from './inactivity.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
registerLocaleData(zhHant, 'zh-Hant-TW');
export interface OuterTokenResponse {
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
  tokenType: string;
}

export interface ApiResponse<T> {
  Status: string;
  Data: T;
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
  private inactivityService?: InactivityService;
  private apiUrl: string = environment.ApiUrl;
  private userSubject: BehaviorSubject<UserInfo | null>;
  public user: Observable<UserInfo | null>;
  private _menuUpdated = new BehaviorSubject<any[]>([]);
  menuUpdated = this._menuUpdated.asObservable();
  private _sys1000 = new BehaviorSubject<any[]>([]);
  sys1000 = this._sys1000.asObservable();
  private jwtHelper: JwtHelperService;
  private client_ip = '0.0.0.0';

  constructor(
    private router: Router,
    private http: HttpClient,
    private encrypt: EncryptionService,
    private notemessage: NotificationService,
    private queryStateService: QueryStateService,
    private httpBackend: HttpBackend,
    private injector: Injector,
  ) {
    const userStorage: any = this.getUserInfo();
    this.userSubject = new BehaviorSubject(userStorage);
    this.user = this.userSubject.asObservable();
    const storedFunRightsInfo = sessionStorage.getItem('FunRightsInfo');
    if (storedFunRightsInfo) {
      const parsedFunRightsInfo = JSON.parse(storedFunRightsInfo) as FunsrightInfo[];
      this._menuUpdated.next(parsedFunRightsInfo); // 使用儲存的資料更新選單
    }
    this.jwtHelper = new JwtHelperService();
    const ipClient = new HttpClient(this.httpBackend);

    // 修正: 不再需要判斷 userStorage，直接取得 IP 並存入 localStorage
    ipClient.get<{ ip: string }>('https://api.ipify.org/?format=json').pipe(
      map(res => res.ip),
      catchError(() => { return ['0.0.0.0']; })
    ).subscribe(ip => {
      this.client_ip = ip;
      // 檢查 localStorage 是否已經存在 'UserInfo' key
      if (localStorage.getItem('UserInfo')) {
        const userInfo = JSON.parse(localStorage.getItem('UserInfo') as string);
        userInfo.client_ip = this.client_ip;
        localStorage.setItem('UserInfo', JSON.stringify(userInfo));
        this.userSubject.next(userInfo);
      }
    });
  }
  public get currentUserValue(): UserInfo | null {
    return this.userSubject.value; // 獲取存儲的 JWT Token
  }
  isLoggedIn(): boolean {
    const user = this.currentUserValue; // 獲取當前用戶資訊
    if (user && user.AccessToken) {
      const isTokenExpired = this.jwtHelper.isTokenExpired(user.AccessToken);
      if (isTokenExpired) { return false; }
      return true; // Token 存在且未過期
    }
    return false; // 沒有用戶資訊或沒有 Token
  }
  login(data: userLogin): Observable<ApiResponse<UserInfo>> {
    data.password = this.encrypt.getPassword(data.code as string, data.password as string);
    data.client_ip = this.client_ip;
    return this.http.post<ApiResponse<UserInfo>>(`${this.apiUrl}/User/userLogin`, data).pipe(
      map((response: ApiResponse<UserInfo>) => {
        if (response.Status === '0000') {
          localStorage.setItem('UserInfo', JSON.stringify(response.Data));
          const userInfo = JSON.parse(localStorage.getItem('UserInfo') as string);
          userInfo.client_ip = this.client_ip;
          localStorage.setItem('UserInfo', JSON.stringify(userInfo));
          this.userSubject.next(userInfo);
          if (!this.inactivityService) {
            this.inactivityService = this.injector.get(InactivityService);
          }
          this.inactivityService.setupListener();
          this.inactivityService.startTimer();
          this.queryStateService.clearAllQueryStates();
          this.router.navigate(['/sso/dashboard']);
          return response;
        } else {
          throw new Error(response.Message || 'Login failed');
        }
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }
  // 移除存儲的 JWT Token
  logout(): void {
    const userInfoStr = this.getUserInfo();
    const token = userInfoStr ? userInfoStr.AccessToken : null;
    // 如果有 Token 且需要後端登出，才發送請求
    if (token) {
      this.http.post<ApiResponse<any>>(`${this.apiUrl}/User/userLogout`, {}).pipe(
        catchError((error) => {
          // 後端登出失敗不影響前端登出狀態，但可以記錄錯誤
          console.error('後端登出請求失敗:', error);
          // 不再彈出錯誤訊息，因為前端已經顯示成功登出
          return throwError(() => error);
        })
      ).pipe(untilDestroyed(this)).subscribe(); // 不需要 next 和 error 處理，因為主要登出邏輯已在前面執行
    }
    // 統一清除邏輯
    this.clearSessionAndLocalStorage();
  }
  // 新增一個私有方法來統一清除儲存
  private clearSessionAndLocalStorage(): void {
    sessionStorage.clear();
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
    this.queryStateService.clearAllQueryStates();
    this.notemessage.infoBubble('已成功登出');
  }
  // 獲取我的最愛
  getFavorites(user_No?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/GetUserFavorite`, { user_No: user_No }).pipe(
      map((response: any) => {
        sessionStorage.setItem('Favorites', JSON.stringify(response.Data));
        return response;
      }));
  }
  // 更新我的最愛
  UpdateUserFavorite(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/UpdateUserFavorite`, { Favorites: body });
  }
  // 獲取使用者權限
  getFunRightsInfo(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/GetUserDashboard`, {}).pipe(
      map((response: any) => {
        sessionStorage.setItem('FunRightsInfo', JSON.stringify(response.Data.funright_info));
        this._menuUpdated.next(response.Data.funright_info);
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching mock FunRightsInfo', error);
        return throwError(() => error);
      })
    );
  }
  // 獲得系統代碼檔
  queryAllSystemCode(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/queryAllSystemCode`, {}).pipe(
      map((response: any) => {
        sessionStorage.setItem('SYS1000', JSON.stringify(response.Data));
        this._sys1000.next(response.Data);
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching SystemCode', error);
        return throwError(() => error);
      })
    );
  }
  // 當頁面移動，獲取目前頁面使用者權限
  getUserPermissions(progNo: string): FunsrightInfo | undefined {
    try {
      const funs = this._menuUpdated.getValue();
      return funs.find(fun => fun.prog_No === progNo);
    } catch (error) {
      console.error('Error parsing FunRightsInfo from sessionStorage', error);
      return undefined;
    }
  }
  // 獲取使用者資訊
  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('UserInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    } else {
      return null;
    }
  }
  // 改 getOuterToken 回傳型別
  getOuterToken(): Observable<OuterTokenResponse> {
    return this.http.get<OuterTokenResponse>(
      `${this.apiUrl}/SSOLogin/getOuterToken`,
      { headers: { Accept: 'application/json' } }
    );
  }

  querySystemNotice(): Observable<ApiResponse<{ Pub_StartDate: string, Pub_EndDate: string, Pub_Type: string, Pub_Event: string, Pub_Description: string }[]>> {
    return this.http.post<ApiResponse<{ Pub_StartDate: string, Pub_EndDate: string, Pub_Type: string, Pub_Event: string, Pub_Description: string }[]>>(`${this.apiUrl}/User/querySystemNotice`, {})
  }
}
