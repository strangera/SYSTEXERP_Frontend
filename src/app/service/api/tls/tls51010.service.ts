import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

// ============================================================================
// TLS51010 Interfaces (大分類維護作業)
// ============================================================================

/** 查詢大分類資料 Request */
export interface QueryTLS51010Request {
  CAT_LNo?: string;           // 大分類代碼
  CAT_LName?: string;         // 大分類名稱
  // 專案標準分頁與排序欄位
  pageSize?: number;
  pageIndex?: number;
  SortBy?: { field: string; order: number }[];
}

/** 新增大分類資料 Request */
export interface InsertTLS51010Request {
  CAT_LNo: string;            // 大分類代碼 (必填，長度 <= 6)
  CAT_LName: string;          // 大分類名稱 (必填，長度 <= 40)
  CAT_LRemark?: string;       // 備註說明 (長度 <= 100)
}

/** 修改大分類資料 Request */
export interface UpdateTLS51010Request {
  id: number;                 // id (必填)
  CAT_LNo: string;            // 大分類代碼 (必填，長度 <= 6)
  CAT_LName: string;          // 大分類名稱 (必填，長度 <= 40)
  CAT_LRemark?: string;       // 備註說明 (長度 <= 100)
}

/** 刪除大分類資料 Request */
export interface DeleteTLS51010Request {
  idList: number[];           // id清單 (必填)
}

/** 查詢大分類資料 Response */
export interface QueryTLS51010Response {
  id: number;                 // id
  CAT_LNo: string;            // 大分類代碼
  CAT_LName: string;          // 大分類名稱
  CAT_LRemark?: string;       // 備註說明
  CRT_Date?: string;          // 建立日期
  CRT_USR_No?: string;        // 建立人員
  CRT_USR_Name?: string;      // 建立人員姓名
  UPD_Date?: string;          // 變更日期
  UPD_USR_No?: string;        // 變更人員
  UPD_USR_Name?: string;      // 變更人員姓名
  CanDel: boolean;            // 是否可刪除
}

// ============================================================================
// TLS51010 Service
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class Tls51010Service {
  private readonly apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(
    private readonly http: HttpClient,
  ) { }

  /**
   * 查詢 POS2003 資料表 (大分類資料)
   * @param params 查詢條件
   * @returns 包含 QueryTLS51010Response 陣列的 API 響應
   */
  queryTLS51010(params: QueryTLS51010Request): Observable<ApiResponse<QueryTLS51010Response[]>> {
    return this.http.post<ApiResponse<QueryTLS51010Response[]>>(`${this.apiUrl}/queryTLS51010`, params);
  }

  /**
   * 新增 POS2003 資料
   * @param payload 新增資料內容
   * @returns 回傳包含 insertedId 的 API 響應
   */
  insertTLS51010(payload: InsertTLS51010Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS51010`, payload);
  }

  /**
   * 更新 POS2003 資料表
   * @param payload 更新資料內容
   * @returns 回傳包含 updatedId 的 API 響應
   */
  updateTLS51010(payload: UpdateTLS51010Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS51010`, payload);
  }

  /**
   * 刪除 POS2003 資料
   * @param payload 欲刪除的 ID 清單
   * @returns 回傳是否刪除成功
   */
  deleteTLS51010(payload: DeleteTLS51010Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deleteTLS51010`, payload);
  }
}
