import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設 ApiResponse 在這個路徑
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 定義 SYS0780 通用查詢請求的資料模型
 * 包含分頁和排序資訊
 */
export interface QuerySYS0780Request {
  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: number }[];
}

/**
 * 當授權型態為「使用者」時的回傳模型：僅包含使用者代號和名稱。
 */
export interface QuerySYS0780Response {
  User_No: string;
  User_Name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Sys0780Service {
  private apiUrl = `${environment.ApiUrl}/SYS0000/SYS0780`;

  constructor(private http: HttpClient) { }

  querySYS0780(body: QuerySYS0780Request): Observable<ApiResponse<QuerySYS0780Response[]>> {
    return this.http.post<ApiResponse<QuerySYS0780Response[]>>(`${this.apiUrl}/querySYS0780`, body);
  }
}
