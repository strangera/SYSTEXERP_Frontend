import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';
import { UserData } from '../../../shared/models/sys/user.model';

export interface IUserResponse {
  ID: number,
  Code: string,
  CName: string,
  EName: string,
  Password: string,
  Str_date: string,
  End_date: string,
  Status: boolean,
  Description: string,
  Auth_pswd: boolean,
  Email: string,
  JobPosition_id: number
}

@Injectable({
  providedIn: 'root'
})
export class Sys0110Service {
  apiUrl: string = environment.ApiUrl + '/User';

  constructor(private http: HttpClient) { }
  // 查詢所有 tblUser 資料表
  queryAllUsers(): Observable<ApiResponse<IUserResponse[]>> {
    return this.http.post<ApiResponse<IUserResponse[]>>(`${this.apiUrl}/queryAllUsers`, {});
  }
  // 查詢 tblUser 資料表
  queryUser(body: any): Observable<ApiResponse<UserData[]>> {
    return this.http.post<ApiResponse<UserData[]>>(`${this.apiUrl}/queryUser`, body);
  }

  // 新增 tblUser 資料表
  createUser(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/createUser`, body);
  }

  // 更新 tblUser 資料表
  updateUser(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateUser`, body);
  }

  // 刪除 tblUser 資料表
  deleteUser(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/DeleteUser`, body);
  }

  // 查詢 SYS1000 資料表
  queryAllSystemCode(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryAllSystemCode`, body);
  }

  // 查詢 使用者權限 資料表
  queryUserPrivileges(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryUserPrivileges`, body);
  }

  // 查詢 專櫃主檔案 資料表
  queryTLTTALENT_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`, body);
  }
}
