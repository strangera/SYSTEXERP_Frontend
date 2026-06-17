import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

// ============================================================================
// TLS51030 Interfaces (小分類維護作業)
// ============================================================================

/** 查詢小分類資料 Request */
export interface QueryTLS51030Request {
  CAT_LNo?: string[];         // 大分類代碼
  CAT_MNo?: string[][];       // 中分類代碼 (後端定義為 string[][])
  CAT_SNo?: string;           // 小分類代碼
  CAT_SName?: string;         // 小分類名稱
  CAT_SRemark?: string;       // 備註說明
  // 專案標準分頁與排序欄位
  pageSize?: number;
  pageIndex?: number;
  SortBy?: { field: string; order: number }[];
}

/** 新增小分類資料 Request */
export interface InsertTLS51030Request {
  CAT_LNo: string;            // 大分類代碼 (必填，長度 <= 6)
  CAT_MNo: string;            // 中分類代碼 (必填，長度 <= 6)
  CAT_SNo: string;            // 小分類代碼 (必填，長度 <= 6)
  CAT_SName: string;          // 小分類名稱 (必填，長度 <= 40)
  CAT_SRemark?: string;       // 備註說明 (長度 <= 100)
}

/** 修改小分類資料 Request */
export interface UpdateTLS51030Request {
  id: number | string;        // id (C# 為 long，前端相容 number 或 string)
  CAT_LNo: string;            // 大分類代碼 (必填，長度 <= 6)
  CAT_MNo: string;            // 中分類代碼 (必填，長度 <= 6)
  CAT_SNo: string;            // 小分類代碼 (必填，長度 <= 6)
  CAT_SName: string;          // 小分類名稱 (必填，長度 <= 40)
  CAT_SRemark?: string;       // 備註說明 (長度 <= 100)
}

/** 刪除小分類資料 Request */
export interface DeleteTLS51030Request {
  idList: number[];           // id清單 (必填)
}

/** 查詢小分類資料 Response */
export interface QueryTLS51030Response {
  id: number;        // id (long)
  CAT_LNo: string;            // 大分類代碼
  CAT_LName: string;          // 大分類名稱
  CAT_MNo: string;            // 中分類代碼
  CAT_MName: string;          // 中分類名稱
  CAT_SNo: string;            // 小分類代碼
  CAT_SName: string;          // 小分類名稱
  CAT_SRemark?: string;       // 備註說明
  CRT_Date?: string;          // 建立日期
  CRT_USR_No?: string;        // 建立人員
  CRT_USR_Name?: string;      // 建立人員姓名
  UPD_Date?: string;          // 變更日期
  UPD_USR_No?: string;        // 變更人員
  UPD_USR_Name?: string;      // 變更人員姓名
  CanDel: boolean;            // 是否可刪除
}

// ============================================================================
// TLS51030 Service
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class Tls51030Service {
  private readonly apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(
    private readonly http: HttpClient,
  ) { }

  /**
   * 查詢 POS20032 資料表 (小分類資料)
   * @param params 查詢條件
   * @returns 包含 QueryTLS51030Response 陣列的 API 響應
   */
  queryTLS51030(params: QueryTLS51030Request): Observable<ApiResponse<QueryTLS51030Response[]>> {
    return this.http.post<ApiResponse<QueryTLS51030Response[]>>(`${this.apiUrl}/queryTLS51030`, params);
  }

  /**
   * 新增 POS20032 資料
   * @param payload 新增資料內容
   * @returns 回傳新增成功的 ID
   */
  insertTLS51030(payload: InsertTLS51030Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS51030`, payload);
  }

  /**
   * 更新 POS20032 資料表
   * @param payload 更新資料內容
   * @returns 回傳更新成功的 ID
   */
  updateTLS51030(payload: UpdateTLS51030Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS51030`, payload);
  }

  /**
   * 刪除 POS20032 資料
   * @param payload 欲刪除的 ID 清單
   * @returns 回傳是否刪除成功
   */
  deleteTLS51030(payload: DeleteTLS51030Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deleteTLS51030`, payload);
  }
}
