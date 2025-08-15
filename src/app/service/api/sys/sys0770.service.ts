import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service'; // 假設 ApiResponse 在這個路徑

/**
 * 定義 SYS0770 通用查詢請求的資料模型
 * 包含分頁和排序資訊
 */
export interface QuerySYS0770Request {
  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: number }[];
}

/**
 * 當授權型態為「使用者」時的回傳模型：僅包含使用者代號和名稱。
 */
export interface QueryUsersResponse {
  User_No: string;
  User_Name: string;
}

/**
 * 當授權型態為「角色」時的回傳模型：包含使用者代號、名稱和其擁有的角色。
 */
export interface QueryUserRolesResponse {
  User_No: string;
  User_Name: string;
  Role_No: string;
  Role_Name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Sys0770Service {
  private apiUrl = `${environment.ApiUrl}/SYS0000/SYS0770`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢所有使用者，當授權型態為「使用者」時使用
   * @param body 查詢請求 (包含分頁和排序)
   * @returns 所有使用者代號和名稱列表
   */
  queryAllUsers(body: QuerySYS0770Request): Observable<ApiResponse<QueryUsersResponse[]>> {
    return this.http.post<ApiResponse<QueryUsersResponse[]>>(`${this.apiUrl}/querySYS0770AllUsers`, body);
  }

  /**
   * 查詢所有使用者及其擁有的角色，當授權型態為「角色」時使用
   * @param body 查詢請求 (包含分頁和排序)
   * @returns 使用者、角色代號和名稱列表
   */
  queryUserRoles(body: QuerySYS0770Request): Observable<ApiResponse<QueryUserRolesResponse[]>> {
    return this.http.post<ApiResponse<QueryUserRolesResponse[]>>(`${this.apiUrl}/querySYS0770UserRoles`, body);
  }
}
