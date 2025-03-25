import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EncryptionService } from '../../shared/service/encryption.service';
import { CommonService } from './../../shared/service/common.service';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { userLogin } from '../../models/system/userLogin';
import { environment } from '../../../environments/environment';
import { FunsrightInfo, PermissionsInfo } from '../../models/system/funsrightInfo';
import { UserInfo } from '../../models/system/userInfo';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = environment.ApiUrl;
  private userSubject: BehaviorSubject<UserInfo | null>;
  public user: Observable<UserInfo | null>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private encrypt: EncryptionService,
    private commService: CommonService,
  ) {
    let userStorage: any = localStorage.getItem('UserInfo');
    this.userSubject = new BehaviorSubject(JSON.parse(userStorage)!);
    this.user = this.userSubject.asObservable();
  }

  public get currentUserValue(): UserInfo | null {
    // 獲取存儲的 JWT Token
    return this.userSubject.value;
  }

  // 登錄，並將 token 存儲到本地存儲
  login(data: userLogin): Observable<any> {
    const now = this.commService.getNOW();

    let key = data.account_id?.toLowerCase() + now.utc_nowtime + environment.PasswordKey;
    key = key.substring(0, 16);
    const pass = this.encrypt.encryptTripleDES(data.account_psw as string, key, now.utc_nowtime);

    data.account_psw = pass;


    return this.http.get<UserInfo>(`${this.apiUrl}/assets/service/User/userLogin.json`).pipe(
    // return this.http.post<UserInfo>(`${this.apiUrl}/User/userLogin`, data).pipe(
    // return this.http.post<UserInfo>(`${this.apiUrl}/assets/service/User/userLogin.json`, data).pipe(
    //return this.http.get<UserInfo>(`https://liulyndon.github.io/TSRDERP_Frontend/assets/service/User/userLogin.json`).pipe( // github docs pages
      map((response: any) => {
        localStorage.setItem('UserInfo', JSON.stringify(response.user_info));
        //access_token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImFkbWluIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc3VybmFtZSI6IueuoeeQhuWToSIsImV4cCI6MTcyMDQ5OTQxNCwiaXNzIjoiSW5mb0xpbmsiLCJhdWQiOiJUT00ifQ.l8WnngdF6hqD3fQPoxiZIzJP8de1MNFWlXSk0pmYVtc"
        //login_time:"2024-07-08T12:30:14.422596+08:00"
        //sto_no:"100"
        //sto_sname:"湯姆熊"
        //user_id:"admin"
        //user_name:"管理員"
        localStorage.setItem('FunRightsInfo', JSON.stringify(response.funright_info));
        localStorage.setItem('AuthorizeInfo', JSON.stringify(response.authorize_info));
        //auh_checkpwd: "Y"
        //auh_no: "00001"
        //auh_password: "1234"
        //auh_rights: "Y"
        this.userSubject.next(response.user_info);
        return response;
      }));
  }

  // 移除存儲的 JWT Token
  logout() {
    let logData = {};
/*
    lastValueFrom(this.http.post<any>(`${this.apiUrl}/User/userLogout`, logData))
      .then((data: any) => {
        console.log(logData);
      });
*/
    localStorage.clear();
    window.sessionStorage.clear();

    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  getUserPermissions(progNo: string): FunsrightInfo {
    const initialFunsrightInfo: FunsrightInfo = {};

    const funs = localStorage.getItem("FunRightsInfo");

    if (funs == "undefined" || funs == null || funs == '') {
      return initialFunsrightInfo;
    } else {
      try {
        const funs: FunsrightInfo[] = JSON.parse(localStorage.getItem("FunRightsInfo") || '');
        // filter
        var progs = funs.filter(x => x.prog_no == progNo);
        // Find the maximum values for each property
        const value: FunsrightInfo = progs.reduce((max: FunsrightInfo, prog: FunsrightInfo) => ({
          add_api_path: (prog.add_api_path?.length || 0) > (max.add_api_path?.length || 0)? prog.add_api_path : max.add_api_path,
          delete_api_path: (prog.delete_api_path?.length || 0) > (max.delete_api_path?.length || 0)? prog.delete_api_path : max.delete_api_path,
          edit_api_path: (prog.edit_api_path?.length || 0) > (max.edit_api_path?.length || 0)? prog.edit_api_path : max.edit_api_path,
          export_api_path: (prog.export_api_path?.length || 0) > (max.export_api_path?.length || 0)? prog.export_api_path : max.export_api_path,
          extright1_api_path: (prog.extright1_api_path?.length || 0) > (max.extright1_api_path?.length || 0)? prog.extright1_api_path : max.extright1_api_path,
          extright2_api_path: (prog.extright2_api_path?.length || 0) > (max.extright2_api_path?.length || 0)? prog.extright2_api_path : max.extright2_api_path,
          extright3_api_path: (prog.extright3_api_path?.length || 0) > (max.extright3_api_path?.length || 0)? prog.extright3_api_path : max.extright3_api_path,
          extright4_api_path: (prog.extright4_api_path?.length || 0) > (max.extright4_api_path?.length || 0)? prog.extright4_api_path : max.extright4_api_path,
          extright5_api_path: (prog.extright5_api_path?.length || 0) > (max.extright5_api_path?.length || 0)? prog.extright5_api_path : max.extright5_api_path,
          print_api_path: (prog.print_api_path?.length || 0) > (max.print_api_path?.length || 0)? prog.print_api_path : max.print_api_path,
          query_api_path: (prog.query_api_path?.length || 0) > (max.query_api_path?.length || 0)? prog.query_api_path : max.query_api_path,
          report_api_path: (prog.report_api_path?.length || 0) > (max.report_api_path?.length || 0)? prog.report_api_path : max.report_api_path,
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
}
