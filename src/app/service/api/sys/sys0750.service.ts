import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設 ApiResponse 在這個路徑
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 定義 SYS0750 查詢請求的資料模型
 */
export interface QuerySYS0750Request {
  // 對應 Role_No (varchar(10))，這是查詢的必要參數
  Role_No: string;
  // 分頁資訊
  pageIndex?: number;
  pageSize?: number;
  // 排序資訊
  SortBy?: { field: string; order: number }[];
}

/**
 * 定義 SYS0750 查詢回傳的單筆資料模型
 * 這對應後端 QuerySYS0750Response
 */
export interface QuerySYS0750Response {
  // 對應 User_No (varchar(10))
  User_No: string;
  // 對應 User_Name (nvarchar(20))
  User_Name: string;
  // 對應 title (varchar(6)) - 職稱代碼
  Title?: string;
  // 對應 Org_ID (varchar(20)) - 組織代碼
  Org_ID?: string;
  // 對應 Org_Name - 組織名稱 (SYS3100)
  Org_Name?: string;
  // 對應 str_date (date) - 有效起始日期
  Str_Date?: string;
  // 對應 end_date (date) - 有效截止日期
  End_Date?: string;
  // 對應 status (char(1)) - 使用者狀態
  Status?: string;
  // 對應 user_type (char(1)) - 使用者型態
  User_Type?: string;
  // 對應 user_email (varchar(100)) - 使用者email帳號
  User_Email?: string;
  // 對應 TLT_No (varchar(12)) - 所屬專櫃編號
  TLT_No?: string;
  // 對應 remarks (nvarchar(100)) - 備註
  Remarks?: string;
  // 對應 user_priority (char(1)) - 使用者等級
  User_Priority?: string;
  // 對應 USER_PwdExpireDate (datetime) - 密碼到期日
  USER_PwdExpireDate?: string;
  // 對應 CRT_Date (datetime) - 建立日期
  CRT_Date?: string;
  // 對應 CRT_USR_No (varchar(16)) - 建立人員
  CRT_USR_No?: string;
  // 對應 CRT_USR_Name (nvarchar(20)) - 建立人員姓名
  CRT_USR_Name?: string;
  // 對應 UPD_Date (datetime) - 變更日期
  UPD_Date?: string;
  // 對應 UPD_USR_No (varchar(16)) - 變更人員
  UPD_USR_No?: string;
  // 對應 UPD_USR_Name (nvarchar(20)) - 變更人員姓名
  UPD_USR_Name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Sys0750Service {
  // 將 API URL 指向 SYS0750 的控制器路徑
  private apiUrl = `${environment.ApiUrl}/SYS0000/SYS0750`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢哪些使用者有設定指定的角色權限的 API 呼叫
   * @param body 包含 Role_No 和分頁/排序資訊的請求物件
   * @returns 包含使用者列表和分頁資訊的 API 回傳結果
   */
  querySys0750(body: QuerySYS0750Request): Observable<ApiResponse<QuerySYS0750Response[]>> {
    return this.http.post<ApiResponse<QuerySYS0750Response[]>>(`${this.apiUrl}/querySYS0750`, body);
  }
}
