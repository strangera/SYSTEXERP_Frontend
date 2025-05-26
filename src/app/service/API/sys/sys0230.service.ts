import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Sys0230Service {
  apiUrl: string = environment.ApiUrl + '/UserRole';

  constructor(private http: HttpClient) { }

  // ---給SYS0230---
  // 查詢 角色之使用者
  queryRoleUsers(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryRoleUsers`, body);
  }

  // 更新 角色user
  updateRoleUsers(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateRoleUsers`, body);
  }

  // ---給SYS0220---
  // 查詢 使用者之角色
  queryUserRoles(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryUserRoles`, body);
  }

  // 更新 使用者之角色
  updateUserRoles(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateUserRoles`, body);
  }
}
