import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EncryptionService } from '../../shared/service/encryption.service';
import { catchError, map } from 'rxjs/operators';
import { userLogin } from '../../shared/models/system/userLogin';
import { environment } from '../../../environments/environment';
import { FunsrightInfo } from '../../shared/models/system/funsrightInfo';
import { UserInfo } from '../../shared/models/system/userInfo';
import { NotificationService } from '../../shared/component/notification-message/notification.service';

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
  updateMenu(newData: any[]): void {
    this._menuUpdated.next(newData);
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private encrypt: EncryptionService,
    private notemessage: NotificationService,
  ) {
    const userStorage: any = sessionStorage.getItem('UserInfo');
    this.userSubject = new BehaviorSubject(JSON.parse(userStorage));
    this.user = this.userSubject.asObservable();
    // 檢查 sessionStorage 中是否有已儲存的權限資料
    const storedFunRightsInfo = sessionStorage.getItem('FunRightsInfo');
    if (storedFunRightsInfo) {
      const parsedFunRightsInfo = JSON.parse(storedFunRightsInfo) as FunsrightInfo[];
      this._menuUpdated.next(parsedFunRightsInfo); // 使用儲存的資料更新選單
    }
  }
  public get currentUserValue(): UserInfo | null {
    return this.userSubject.value; // 獲取存儲的 JWT Token
  }
  login(data: userLogin): Observable<ApiResponse<UserInfo>> {
    data.password = this.encrypt.getPassword(data.code as string, data.password as string);
    return this.http.post<ApiResponse<UserInfo>>(`${this.apiUrl}/User/userLogin`, data).pipe(
      map((response: ApiResponse<UserInfo>) => {
        if (response.Status === '0000') {
          this.userSubject.next(response.Data);
          sessionStorage.setItem('UserInfo', JSON.stringify(response.Data));
          this.router.navigate(['/SSO/dashboard']);
          return response;
        } else {
          throw new Error(response.Message || 'Login failed');
        }
      }),
      catchError(err => {
        this.notemessage.errorBubble('登入失敗，請確認帳號密碼');
        return throwError(() => err);
      })
    );
  }
  // login(data: userLogin): Observable<UserInfo> {
  //   const now = this.commService.getNOW();
  //   const key = `${data.code?.toLowerCase()}${now.utc_nowtime}${environment.PasswordKey}`.substring(0, 16);
  //   data.password = this.encrypt.encryptTripleDES(data.password as string, key, now.utc_nowtime);
  //   // data.password = "W0kPywQIWtw=";
  //   const url = `${this.apiUrl}/User/userLogin`;
  //   console.log('🔐 Login API URL:', url);
  //   console.log('📦 Login data:', data);

  //   return this.http.post<ApiResponse<UserInfo>>(url, data).pipe(
  //     map((response: ApiResponse<UserInfo>) => {
  //       if (response.Status === '0000') {
  //         sessionStorage.setItem('UserInfo', JSON.stringify(response.Data));
  //         this.userSubject.next(response.Data);
  //         return response.Data;
  //       } else {
  //         throw new Error(response.Message || 'Login failed');
  //       }
  //     })
  //   );
  // }

  // 移除存儲的 JWT Token
  logout(): void {
    const userInfoStr = sessionStorage.getItem('UserInfo');
    const token = userInfoStr ? JSON.parse(userInfoStr).AccessToken : null;

    if (!token) {
      sessionStorage.clear();
      this.userSubject.next(null);
      // this.queryStateService.clearAllQueryStates();
      this.router.navigate(['/account/login'], { replaceUrl: true });
      this.notemessage.infoBubble('已成功登出');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    this.http.post<ApiResponse<any>>(`${this.apiUrl}/User/userLogout`, {}, { headers }).pipe(
      catchError((error) => {
        console.error('Logout error:', error);
        this.notemessage.errorBubble('登出失敗，請稍後再試');
        return throwError(() => error);
      })
    ).subscribe({
      next: () => {
        sessionStorage.clear();
        this.userSubject.next(null);
        this.router.navigate(['/account/login'], { replaceUrl: true });
        this.notemessage.infoBubble('已成功登出');
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }


  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  getUserPermissions(progNo: string): FunsrightInfo {
    const initialFunsrightInfo: FunsrightInfo = {
      id: 0,
      prog_no: '',
      prog_id: '',
      prog_name: '',
      prog_up: '',
      module_no: '',
      sub_module_no: '',
      prog_ispage: '',
      prog_stopflag: '',
      prog_sort: 0,
      label: '',
      PrivilegeBehavior: [],
    };

    try {
      const funs: FunsrightInfo[] = JSON.parse(sessionStorage.getItem("FunRightsInfo") || '');
      return initialFunsrightInfo;
    } catch (error) {
      console.error('Error', error);
      return initialFunsrightInfo;
    }
  }

  getFavorites(user_No?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/GetUserFavorite`, { user_No: user_No }).pipe(
      map((response: any) => {
        sessionStorage.setItem('Favorites', JSON.stringify(response.Data));
        return response;
      }));
  }
  UpdateUserFavorite(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/UpdateUserFavorite`, { Favorites: body });
  }

  getFunRightsInfo(): Observable<any> {
    return this.http.get<any>(`assets/service/User/FunRightsInfo.json`).pipe(
      // return this.http.post<any>(`${this.apiUrl}/User/GetUserDashboard`, {}).pipe(
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

  getUserInfo(): any {
    const userInfo = sessionStorage.getItem('UserInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    } else {
      return null;
    }
  }
}
