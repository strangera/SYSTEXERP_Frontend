import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserCodeService {
  apiUrl: string = environment.ApiUrl;
  constructor(
    private http: HttpClient,
  ) { }

  // 更新 使用者密碼
  changePassword(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/changePassword`, body);
  }

  // 沿用舊密碼，展延密碼到期日 90 天
  extendPassword(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/extendPassword`, {});
  }

  // 重製 使用者密碼
  resetPassword(body: { SYS_StoreNo: string, User_No: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/resetPassword`, body);
  }
}
