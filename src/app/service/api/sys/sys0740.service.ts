import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設 ApiResponse 在這個路徑
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 定義 SYS0740 查詢角色權限的請求資料模型
 */
export interface QuerySYS0740Request {
  // 對應 Prog_No (varchar(10))，這是查詢的必要參數
  Prog_No: string;
  // 分頁資訊
  pageIndex?: number;
  pageSize?: number;
  // 排序資訊
  SortBy?: { field: string; order: number }[];
}

/**
 * 定義 SYS0740 查詢角色權限回傳的單筆資料模型
 * 這對應後端 QuerySYS0740Response
 */
export interface QuerySYS0740Response {
  // 對應 Role_No (varchar(10))
  Role_No: string;
  // 對應 Role_Name (nvarchar(30))
  Role_Name: string;
  // 新增欄位：具有權限之功能行為 (功能中文名稱，例如："新增,查詢")
  FunctionBehaviors: string;
}

/**
 * 定義作業代碼下拉選單的回傳資料模型
 */
export interface ProgNoDropdownResponse {
  Prog_No: string;
  Prog_Name: string;
  label?: string; // 為了 PrimeNG Dropdown 顯示
}

@Injectable({
  providedIn: 'root'
})
export class Sys0740Service {
  // 將 API URL 指向 SYS0740 的控制器路徑
  private apiUrl = `${environment.ApiUrl}/SYS0000/SYS0740`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢哪些角色對指定作業有權限的 API 呼叫
   * @param body 包含 Prog_No 和分頁/排序資訊的請求物件
   * @returns 包含角色權限列表和分頁資訊的 API 回傳結果
   */
  querySys0740(body: QuerySYS0740Request): Observable<ApiResponse<QuerySYS0740Response[]>> {
    return this.http.post<ApiResponse<QuerySYS0740Response[]>>(`${this.apiUrl}/querySYS0740`, body);
  }

  /**
   * 查詢所有可執行的作業代碼列表，供下拉選單使用
   * @returns 包含作業代碼和名稱的列表
   */
  queryProgNoDropdown(): Observable<ApiResponse<ProgNoDropdownResponse[]>> {
    // 這裡使用 POST 請求，因為後端定義為 POST
    return this.http.post<ApiResponse<ProgNoDropdownResponse[]>>(`${this.apiUrl}/queryProgNoDropdown`, {});
  }
}
