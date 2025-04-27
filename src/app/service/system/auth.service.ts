import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EncryptionService } from '../../shared/service/encryption.service';
import { catchError, map } from 'rxjs/operators';
import { userLogin } from '../../shared/models/system/userLogin';
import { environment } from '../../../environments/environment';
import { FunsrightInfo, PermissionsInfo } from '../../shared/models/system/funsrightInfo';
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
    const url = `${this.apiUrl}/User/userLogin`;
    return this.http.post<ApiResponse<UserInfo>>(url, data).pipe(
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
    const initialFunsrightInfo: FunsrightInfo = {};

    const funs = sessionStorage.getItem("FunRightsInfo");

    if (funs == "undefined" || funs == null || funs == '') {
      return initialFunsrightInfo;
    } else {
      try {
        const funs: FunsrightInfo[] = JSON.parse(sessionStorage.getItem("FunRightsInfo") || '');
        // filter
        const progs = funs.filter(x => x.prog_no == progNo);
        // Find the maximum values for each property
        const value: FunsrightInfo = progs.reduce((max: FunsrightInfo, prog: FunsrightInfo) => ({
          add_api_path: (prog.add_api_path?.length || 0) > (max.add_api_path?.length || 0) ? prog.add_api_path : max.add_api_path,
          delete_api_path: (prog.delete_api_path?.length || 0) > (max.delete_api_path?.length || 0) ? prog.delete_api_path : max.delete_api_path,
          edit_api_path: (prog.edit_api_path?.length || 0) > (max.edit_api_path?.length || 0) ? prog.edit_api_path : max.edit_api_path,
          export_api_path: (prog.export_api_path?.length || 0) > (max.export_api_path?.length || 0) ? prog.export_api_path : max.export_api_path,
          extright1_api_path: (prog.extright1_api_path?.length || 0) > (max.extright1_api_path?.length || 0) ? prog.extright1_api_path : max.extright1_api_path,
          extright2_api_path: (prog.extright2_api_path?.length || 0) > (max.extright2_api_path?.length || 0) ? prog.extright2_api_path : max.extright2_api_path,
          extright3_api_path: (prog.extright3_api_path?.length || 0) > (max.extright3_api_path?.length || 0) ? prog.extright3_api_path : max.extright3_api_path,
          extright4_api_path: (prog.extright4_api_path?.length || 0) > (max.extright4_api_path?.length || 0) ? prog.extright4_api_path : max.extright4_api_path,
          extright5_api_path: (prog.extright5_api_path?.length || 0) > (max.extright5_api_path?.length || 0) ? prog.extright5_api_path : max.extright5_api_path,
          print_api_path: (prog.print_api_path?.length || 0) > (max.print_api_path?.length || 0) ? prog.print_api_path : max.print_api_path,
          query_api_path: (prog.query_api_path?.length || 0) > (max.query_api_path?.length || 0) ? prog.query_api_path : max.query_api_path,
          report_api_path: (prog.report_api_path?.length || 0) > (max.report_api_path?.length || 0) ? prog.report_api_path : max.report_api_path,
          permissions: [],
        }), initialFunsrightInfo);

        //
        if (value.add_api_path) {
          value.permissions?.push(PermissionsInfo.add);
        }
        if (value.delete_api_path) {
          value.permissions?.push(PermissionsInfo.delete);
        }
        if (value.edit_api_path) {
          value.permissions?.push(PermissionsInfo.edit);
        }
        if (value.export_api_path) {
          value.permissions?.push(PermissionsInfo.export);
        }
        if (value.extright1_api_path) {
          value.permissions?.push(PermissionsInfo.extright1);
        }
        if (value.extright2_api_path) {
          value.permissions?.push(PermissionsInfo.extright2);
        }
        if (value.extright3_api_path) {
          value.permissions?.push(PermissionsInfo.extright3);
        }
        if (value.extright4_api_path) {
          value.permissions?.push(PermissionsInfo.extright4);
        }
        if (value.extright5_api_path) {
          value.permissions?.push(PermissionsInfo.extright5);
        }
        if (value.print_api_path) {
          value.permissions?.push(PermissionsInfo.print);
        }
        if (value.query_api_path) {
          value.permissions?.push(PermissionsInfo.query);
        }
        if (value.report_api_path) {
          value.permissions?.push(PermissionsInfo.report);
        }
        return value;
      } catch (error) {
        console.error('Error', error);
        return initialFunsrightInfo;
      }
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
    return this.http.get<any>(`assets/service/User/userLogin.json`).pipe(
      map((response: any) => {
        if (response && response.funright_info) {
          sessionStorage.setItem('FunRightsInfo', JSON.stringify(response.funright_info));
          this._menuUpdated.next(response.funright_info);
          sessionStorage.setItem('AuthorizeInfo', JSON.stringify(response.authorize_info));
        } else {
          console.error('funright_info not found in mock data');
        }
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
