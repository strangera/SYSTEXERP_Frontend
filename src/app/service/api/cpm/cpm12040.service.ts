import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// --- 介面 (Interfaces) ---

/** 顧客意見來源資料結構 (對應 SYS1000) */
export interface Cpm12040Data {
  ID: number;
  SYS_Code: string; // 意見來源代碼
  SYS_Name: string; // 意見來源名稱
  SYS_Sort: number; // 排序
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/** 查詢 (queryCPM12040) 的請求參數 */
export interface QueryCpm12040Request {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  SYS_Code: string | null;
  SYS_Name: string | null;
}

/** 新增 (insertCPM12040) 的請求參數 */
export interface InsertCpm12040Request {
  SYS_Name: string;
  SYS_Sort: number;
}

/** 更新 (updateCPM12040) 的請求參數 */
export interface UpdateCpm12040Request {
  ID: number;
  SYS_Name: string;
  SYS_Sort: number;
}

/** 刪除 (deleteCPM12040) 的請求參數 */
export interface DeleteCpm12040Request {
  IDList: number[];
}

// --- 服務 (Service) ---

@Injectable({
  providedIn: 'root'
})
export class Cpm12040Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`; // 根據 Swagger Path 調整 API URL

  constructor(private http: HttpClient) { }

  /**
   * 查詢 SYS1000 (SUGG_SOURCE) 顧客意見來源資料 (分頁)
   * @param request 查詢參數
   * @returns 包含顧客意見來源資料的 API Response
   */
  queryCPM12040(request: QueryCpm12040Request): Observable<ApiResponse<Cpm12040Data[]>> {
    return this.http.post<ApiResponse<Cpm12040Data[]>>(`${this.apiUrl}/queryCPM12040`, request);
  }

  /**
   * 新增 SYS1000 (SUGG_SOURCE) 顧客意見來源資料
   * @param request 包含 SYS_Name 和 SYS_Sort 的新增參數
   * @returns 僅包含狀態碼和訊息的 API Response
   */
  insertCPM12040(request: InsertCpm12040Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertCPM12040`, request);
  }

  /**
   * 更新 SYS1000 (SUGG_SOURCE) 顧客意見來源資料
   * @param request 包含 ID, SYS_Name, SYS_Sort 的更新參數
   * @returns 僅包含狀態碼和訊息的 API Response
   */
  updateCPM12040(request: UpdateCpm12040Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateCPM12040`, request);
  }

  /**
   * 刪除 SYS1000 (SUGG_SOURCE) 顧客意見來源資料
   * @param request 包含 ID 列表的刪除參數
   * @returns 僅包含狀態碼和訊息的 API Response
   */
  deleteCPM12040(request: DeleteCpm12040Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteCPM12040`, request);
  }
}
