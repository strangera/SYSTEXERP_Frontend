import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
/** 查詢在線人員 Request */
export interface IQueryRequest {
  user_No?: string;
  user_Name?: string;
}

/** 查詢在線人員 Response */
export interface IQueryResponse {
  User_No: string;
  User_Name: string;
  From_IP: string;
  Login_time: string; // 後端 DateTime 對應 TS string
  GUID: string;
}
@Injectable({
  providedIn: 'root'
})
export class Sys0791Service {
  // 對應後端 [Tags("SYS0791 在線人員查詢作業")] 的路由
  private readonly apiUrl: string = `${environment.ApiUrl}/SYS0000/BAS2000`;

  constructor(private http: HttpClient) { }

  /**
   * SYS0791: 查詢在線人員
   * @param body 包含 User_No, User_Name 與分頁條件
   */
  querySYS0791(body: IQueryRequest): Observable<ApiResponse<IQueryResponse[]>> {
    return this.http.post<ApiResponse<IQueryResponse[]>>(
      `${this.apiUrl}/querySYS0791`,
      body
    );
  }

  kickUser(guid: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/kickUser`,
      { guid }
    );
  }

  // --- 以下保留你原本的 User 相關方法，但建議路徑確認是否要改回 /User ---

  /** 查詢所有使用者 (原本的方法) */
  queryAllUsers(): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${environment.ApiUrl}/User/queryAllUsers`, {});
  }
}
