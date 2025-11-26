import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設 ApiResponse 在這個路徑
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 定義 CPM13010 查詢請求的資料模型
 */
export interface QueryCPM13010Request {
  PKNG_DiscHour?: number; // 停車折抵時數
  PKNG_SaleAmt?: number;  // 消費金額
  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: number }[];
}

/**
 * 定義 CPM13010 新增請求的資料模型
 */
export interface AddCPM13010Request {
  PKNG_SaleAmt: number;  // 消費金額 (必填)
  PKNG_DiscHour: number; // 停車折抵時數 (必填)
}

/**
 * 定義 CPM13010 更新請求的資料模型
 */
export interface UpdateCPM13010Request {
  ID: number;
  PKNG_SaleAmt: number;  // 消費金額 (必填)
  PKNG_DiscHour: number; // 停車折抵時數 (必填)
}

/**
 * 定義 CPM13010 刪除請求的資料模型
 */
export interface DeleteCPM13010Request {
  IDs: number[];
}

/**
 * 定義 CPM13010 查詢回傳的單筆資料模型
 */
export interface QueryCPM13010Response {
  ID: number;
  PKNG_SeqNo: number;
  PKNG_SaleAmt: number;
  PKNG_DiscHour: number;
  PKNG_Status: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Cpm13010Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM13010`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢停車折抵時數設定列表的 API 呼叫
   * @param body 查詢請求物件
   * @returns 包含折抵設定列表和分頁資訊的 API 回傳結果
   */
  queryCPM13010(body: QueryCPM13010Request): Observable<ApiResponse<QueryCPM13010Response[]>> {
    return this.http.post<ApiResponse<QueryCPM13010Response[]>>(`${this.apiUrl}/queryCPM13010`, body);
  }

  /**
   * 新增停車折抵時數設定的 API 呼叫
   * @param body 新增請求物件
   * @returns 新增是否成功的 API 回傳結果
   */
  insertCPM13010(body: AddCPM13010Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/insertCPM13010`, body); // API 後端方法名是 AddCPM13010
  }
  /**
   * 更新停車折抵時數設定的 API 呼叫
   * @param body 更新請求物件
   * @returns 更新是否成功的 API 回傳結果
   */
  updateCPM13010(body: UpdateCPM13010Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateCPM13010`, body); // API 後端方法名是 UpdateCPM13010
  }
  /**
   * 刪除停車折抵時數設定的 API 呼叫
   * @param body 刪除請求物件
   * @returns 刪除是否成功的 API 回傳結果
   */
  deleteCPM13010(body: DeleteCPM13010Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deleteCPM13010`, body); // API 後端方法名是 DeleteCPM13010
  }
}
