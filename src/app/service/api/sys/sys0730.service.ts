import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 定義 SYS0730 查詢請求的資料模型
 * 與後端 QuerySYS0730Request 匹配
 */
export interface QuerySYS0730Request {
  Role_No: string;
}

/**
 * 定義 SYS0730 查詢回傳的單筆資料模型
 * 與後端 QuerySYS0730Response 匹配
 */
export interface QuerySYS0730Response {
  // 對應 Role_No (varchar(10))
  Role_No: string;
  // 對應 Role_Name (nvarchar(30))
  Role_Name: string;
  // 對應 MainSystemCode (varchar(10))
  MainSystemCode: string;
  // 對應 MainSystemName (nvarchar(20))
  MainSystemName: string;
  // 對應 SubsystemCode (varchar(10))
  SubsystemCode: string;
  // 對應 SubsystemName (nvarchar(20))
  SubsystemName: string;
  // 對應 Prog_No (varchar(10))
  Prog_No: string;
  // 對應 Prog_Name (nvarchar(50))
  Prog_Name: string;
  // 對應 FunctionButtons (varchar(max))，現在會是中文名稱
  FunctionButtons: string;
}

@Injectable({
  providedIn: 'root'
})
export class Sys0730Service {
  // 將 API URL 指向 SYS0730 的控制器路徑
  private apiUrl = `${environment.ApiUrl}/SYS0000/SYS0730`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢角色系統權限列表的 API 呼叫
   * @param body 包含 Role_No 和分頁/排序資訊的請求物件
   * @returns 包含權限列表和分頁資訊的 API 回傳結果
   */
  querySys0730(body: QuerySYS0730Request): Observable<ApiResponse<QuerySYS0730Response[]>> {
    return this.http.post<ApiResponse<QuerySYS0730Response[]>>(`${this.apiUrl}/querySYS0730`, body);
  }
}
