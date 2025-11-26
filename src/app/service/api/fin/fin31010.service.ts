import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 定義 API 請求和回應的模型
export interface QueryFin31010Request {
  CAP_Item: string | null;
  CAP_Name: string | null;
  AccNo: string[] | null;
  Remark: string | null;
  SortBy: { field: string; order: number }[];
  PageSize: number;
  PageIndex: number;
}

export interface QueryFin31010Response {
  CAP_Item: string;
  CAP_Name: string;
  AccNo: string;
  Remark: string;
}

// 根據您的 C# 模型定義新增/修改用的模型
export interface Ars1003 {
  id?: number;
  CAP_Item: string;
  CAP_Name: string;
  AccNo: string;
  Remark: string;
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
export class Fin31010Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN3000/';

  constructor(private http: HttpClient) { }

  /**
   * 執行查詢
   * @param request 查詢條件
   * @returns 包含查詢結果和總筆數的物件
   */
  queryFin31010(request: QueryFin31010Request): Observable<ApiResponse<QueryFin31010Response[]>> {
    return this.http.post<ApiResponse<QueryFin31010Response[]>>(`${this.apiUrl}queryFIN31010`, request);
  }

  /**
   * 新增資料
   * @param data 要新增的資料清單
   * @returns 新增資料的ID清單
   */
  insertFin31010(data: Ars1003): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}insertFIN31010`, data);
  }

  /**
   * 修改資料
   * @param data 要修改的資料
   * @returns 影響的行數
   */
  updateFin31010(data: Ars1003): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}updateFIN31010`, data);
  }

  /**
   * 刪除資料
   * @param capItems 要刪除的收款項目代號清單
   * @returns 影響的行數
   */
  deleteFin31010(CAP_ItemList: string[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}deleteFIN31010`, { CAP_ItemList });
  }
}
