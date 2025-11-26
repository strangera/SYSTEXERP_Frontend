import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 定義 SYS0710 查詢回傳的單筆資料模型
 * 這對應後端扁平化結構的 QueryUserPermissionResponse
 */
export interface Sys0710Response {
  // 對應 User_No (varchar(16))
  user_No: string;
  // 對應 User_Name (nvarchar(20))
  user_Name: string;
  // 對應 MainSystemCode (varchar(10))
  mainSystemCode: string;
  // 對應 MainSystemName (nvarchar(20))
  mainSystemName: string;
  // 對應 SubsystemCode (varchar(10))
  subsystemCode: string;
  // 對應 SubsystemName (nvarchar(20))
  subsystemName: string;
  // 對應 Prog_No (varchar(10))
  prog_No: string;
  // 對應 Prog_Name (nvarchar(50))
  prog_Name: string;
  // 對應 FunctionButtons (varchar(max))
  functionButtons: string;
}

@Injectable({
  providedIn: 'root'
})
export class Sys0710Service {
  // 將 API URL 指向 SYS0710 的控制器路徑
  private apiUrl = `${environment.ApiUrl}/SYS0000/SYS0700`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢使用者系統權限列表的 API 呼叫
   * @param body 包含 user_No 和分頁資訊的請求物件
   * @returns 包含權限列表和分頁資訊的 API 回傳結果
   */
  querySys0710(body: { user_No: string }): Observable<ApiResponse<Sys0710Response[]>> {
    return this.http.post<ApiResponse<Sys0710Response[]>>(`${this.apiUrl}/querySYS0710`, body);
  }
}
