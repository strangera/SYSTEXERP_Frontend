import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';
import { SortMeta } from 'primeng/api';

/** 顧客意見類別資料結構 */
export interface Cpm12010Data {
  ID: number;
  KIND_ID: string;
  KIND_Name: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/** 查詢 (queryCPM12010) 的請求參數 */
export interface QueryCpm12010Request {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  KIND_ID: string | null;
  KIND_Name: string | null;
}

/** 查詢 (queryCPM12010) 的 API 響應資料結構 */
// 由於 Data 是一個 Cpm12010Data 陣列，直接使用 ApiResponse<Cpm12010Data[]> 即可，不需要額外的 QueryApiResponse 介面

/** 下拉選單 (dropdownCPM12010) 的資料結構 */
export interface DropdownCpm12010Data {
  KIND_ID: string;
  KIND_Name: string;
}

/** 新增 (insertCPM12010) 的請求參數 */
export interface InsertCpm12010Request {
  KIND_Name: string;
}

/** 更新 (updateCPM12010) 的請求參數 */
export interface UpdateCpm12010Request {
  ID: number;
  KIND_ID: string;
  KIND_Name: string;
}

/** 刪除 (deleteCPM12010) 的請求參數 */
export interface DeleteCpm12010Request {
  IDList: number[];
}

// --- 服務 (Service) ---

@Injectable({
  providedIn: 'root'
})
export class Cpm12010Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`; // 根據 Swagger Path 調整 API URL

  constructor(private http: HttpClient) { }

  /**
   * 查詢 CSS1002 顧客意見類別資料 (分頁)
   * @param request 查詢參數
   * @returns 包含顧客意見類別資料的 API Response
   */
  queryCPM12010(request: QueryCpm12010Request): Observable<ApiResponse<Cpm12010Data[]>> {
    return this.http.post<ApiResponse<Cpm12010Data[]>>(`${this.apiUrl}/queryCPM12010`, request);
  }

  /**
   * 取得顧客意見類別下拉選單資料
   * @returns 包含 KIND_ID 和 KIND_Name 的 API Response
   */
  dropdownCPM12010(): Observable<ApiResponse<DropdownCpm12010Data[]>> {
    return this.http.post<ApiResponse<DropdownCpm12010Data[]>>(`${this.apiUrl}/dropdownCPM12010`, {});
  }

  /**
   * 新增 CSS1002 顧客意見類別資料
   * @param request 包含 KIND_Name 的新增參數
   * @returns 僅包含狀態碼和訊息的 API Response
   */
  insertCPM12010(request: InsertCpm12010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertCPM12010`, request);
  }

  /**
   * 更新 CSS1002 顧客意見類別資料
   * @param request 包含 ID, KIND_ID, KIND_Name 的更新參數
   * @returns 僅包含狀態碼和訊息的 API Response
   */
  updateCPM12010(request: UpdateCpm12010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateCPM12010`, request);
  }

  /**
   * 刪除 CSS1002 顧客意見類別資料
   * @param request 包含 ID 列表的刪除參數
   * @returns 僅包含狀態碼和訊息的 API Response
   */
  deleteCPM12010(request: DeleteCpm12010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteCPM12010`, request);
  }
}
