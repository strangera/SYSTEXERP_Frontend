import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { EncryptionService } from '../../shared/service/encryption.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { userLogin } from '../../shared/models/system/userLogin';
import { environment } from '../../../environments/environment';
import { FunsrightInfo } from '../../shared/models/system/funsrightInfo';
import { UserInfo } from '../../shared/models/system/userInfo';
import { NotificationService } from '../../shared/component/notification-message/notification.service';
import { QueryStateService } from '../../shared/service/query-state.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { registerLocaleData } from '@angular/common';
import zhHant from '@angular/common/locales/zh-Hant';
registerLocaleData(zhHant, 'zh-Hant-TW');

export interface ApiResponse<T> {
  Status: string;
  Data: T;
  Error: string;
  Meta: {
    Timestamp: string;
    RequestId: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = environment.ApiUrl;
  private userSubject: BehaviorSubject<UserInfo | null>;
  public user: Observable<UserInfo | null>;
  private _menuUpdated = new BehaviorSubject<any[]>([]);
  menuUpdated = this._menuUpdated.asObservable();
  private jwtHelper: JwtHelperService;
  updateMenu(newData: any[]): void {
    this._menuUpdated.next(newData);
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private encrypt: EncryptionService,
    private notemessage: NotificationService,
    private queryStateService: QueryStateService,
    private httpBackend: HttpBackend,
  ) {
    const userStorage: any = this.getUserInfo();
    this.userSubject = new BehaviorSubject(userStorage);
    this.user = this.userSubject.asObservable();
    // 檢查 sessionStorage 中是否有已儲存的權限資料
    const storedFunRightsInfo = sessionStorage.getItem('FunRightsInfo');
    if (storedFunRightsInfo) {
      const parsedFunRightsInfo = JSON.parse(storedFunRightsInfo) as FunsrightInfo[];
      this._menuUpdated.next(parsedFunRightsInfo); // 使用儲存的資料更新選單
    }
    this.jwtHelper = new JwtHelperService();
  }
  public get currentUserValue(): UserInfo | null {
    return this.userSubject.value; // 獲取存儲的 JWT Token
  }
  isLoggedIn(): boolean {
    const user = this.currentUserValue; // 獲取當前用戶資訊
    if (user && user.AccessToken) {
      // 使用 jwtHelper 判斷 Token 是否過期
      const isTokenExpired = this.jwtHelper.isTokenExpired(user.AccessToken);
      if (isTokenExpired) {
        console.warn('Access Token expired. User needs to re-login.');
        // 如果 Token 過期，可以考慮在這裡直接執行登出操作
        // 但更好的做法是在 HttpInterceptor 中集中處理 401 錯誤
        // this.logout();
        return false;
      }
      return true; // Token 存在且未過期
    }
    return false; // 沒有用戶資訊或沒有 Token
  }
  // 獲取 Token 的方法，提供給 JwtModule 的 tokenGetter 使用
  // 確保 JwtModule 可以正確獲取到 AccessToken
  getToken(): string | null {
    const user = this.currentUserValue;
    return user ? user.AccessToken : null;
  }
  login(data: userLogin): Observable<ApiResponse<UserInfo>> {
    data.password = this.encrypt.getPassword(data.code as string, data.password as string);
    const newHttpClient = new HttpClient(this.httpBackend);
    return newHttpClient.get<{ ip: string }>("http://api.ipify.org/?format=json").pipe(
      map(result => {
        data.client_ip = result.ip;
        return data;
      }), switchMap(updatedData =>
        this.http.post<ApiResponse<UserInfo>>(`${this.apiUrl}/User/userLogin`, updatedData).pipe(
          map((response: ApiResponse<UserInfo>) => {
            if (response.Status === '0000') {
              this.userSubject.next(response.Data);
              localStorage.setItem('UserInfo', JSON.stringify(response.Data));
              this.router.navigate(['/sso/dashboard']);
              return response;
            } else {
              throw new Error(response.Message || 'Login failed');
            }
          }),
          catchError(err => {
            this.notemessage.errorBubble('登入失敗，請確認帳號密碼');
            return throwError(() => err);
          })
        )
      ),
      catchError(err => {
        this.notemessage.errorBubble('無法確認您的目前位址');
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
      ).subscribe(); // 不需要 next 和 error 處理，因為主要登出邏輯已在前面執行
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
}
