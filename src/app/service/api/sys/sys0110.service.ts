import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserData } from '../../../shared/models/sys/user.model';

export interface IUserResponse {
  // 對應 id (numeric(19, 0))，numeric(19,0)在TypeScript可對應number
  id: number;

  // 對應 user_No (varchar(16))
  user_No: string;

  // 對應 user_Name (nvarchar(20))
  user_Name: string;

  // 對應 user_Password (varchar(100))
  user_Password: string;

  // 對應 title (varchar(6))
  title: string;

  // 對應 org_id (varchar(20))
  org_id: string;

  // 對應 str_date (date)。如果資料庫欄位可能為 null，則需用 union type 處理。
  str_date: string | null;

  // 對應 end_date (date)。如果資料庫欄位可能為 null，則需用 union type 處理。
  end_date: string | null;

  // 對應 status (char(1))
  status: string;

  // 對應 user_type (char(1))
  user_type: string;

  // 對應 user_email (varchar(100))
  user_email: string;

  // 對應 tlt_no (varchar(10))
  tlt_no: string;

  // 對應 remarks (nvarchar(100))
  remarks: string;

  // 對應 user_priority (char(1))
  user_priority: string;

  // 對應 CRT_Date (datetime)。如果資料庫欄位可能為 null，則需用 union type 處理。
  CRT_Date: string | null;

  // 對應 CRT_USR_No (varchar(16))
  CRT_USR_No: string;

  // 對應 CRT_USR_Name (nvarchar(20))
  CRT_USR_Name: string;

  // 對應 UPD_Date (datetime)。如果資料庫欄位可能為 null，則需用 union type 處理。
  UPD_Date: string | null;

  // 對應 UPD_USR_No (varchar(10))
  UPD_USR_No: string;

  // 對應 UPD_USR_Name (nvarchar(20))
  UPD_USR_Name: string;

  // 對應 USER_PwdExpireDate (datetime)。如果資料庫欄位可能為 null，則需用 union type 處理。
  USER_PwdExpireDate: string | null;
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

  // 查詢 SYS3700 資料表
  queryUserDetail(body: any): Observable<ApiResponse<UserData[]>> {
    return this.http.post<ApiResponse<UserData[]>>(`${this.apiUrl}/queryUserDetail`, body);
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
