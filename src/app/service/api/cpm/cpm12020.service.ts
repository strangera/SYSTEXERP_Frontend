import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

// --- Interfaces ---

/** 查詢請求 */
export interface CPM12020Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  ORG_ID?: string;
  CLASS_CODE?: string;
  CLASS_NAME?: string;
}

/** 查詢結果內容 */
export interface CPM12020Response {
  TotalCount: number;
  ID: number;
  CLASS_CODE: string;
  ORG_ID: string;
  CLASS_NAME: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/** 新增請求 */
export interface InsertCPM12020Request {
  ORG_ID: string;
  CLASS_CODE: string;
  CLASS_NAME: string;
}

/** 更新請求 */
export interface UpdateCPM12020Request {
  ID: number;
  ORG_ID: string;
  CLASS_CODE: string;
  CLASS_NAME: string;
}

/** 刪除請求 */
export interface DeleteCPM12020Request {
  idList: number[];
}

// --- Service ---

@Injectable({
  providedIn: 'root'
})
export class Cpm12020Service {
  // 根據 Swagger 修正路徑
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) { }

  /** 查詢顧客意見責任單位維護 */
  queryCPM12020(body: CPM12020Request): Observable<ApiResponse<CPM12020Response[]>> {
    return this.http.post<ApiResponse<CPM12020Response[]>>(`${this.apiUrl}/queryCPM12020`, body);
  }

  /** 新增顧客意見責任單位維護 */
  insertCPM12020(body: InsertCPM12020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertCPM12020`, body);
  }

  /** 更新顧客意見責任單位維護 */
  updateCPM12020(body: UpdateCPM12020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateCPM12020`, body);
  }

  /** 刪除顧客意見責任單位維護 */
  deleteCPM12020(body: DeleteCPM12020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteCPM12020`, body);
  }
}
