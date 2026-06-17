import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// ============================================================================
// TLS51020 Interfaces (中分類維護作業)
// ============================================================================

/** 查詢中分類資料 Request */
export interface QueryTLS51020Request {
  CAT_LNo?: string[];
  CAT_MNo?: string;
  CAT_MName?: string;
  pageSize?: number;
  pageIndex?: number;
  SortBy?: { field: string; order: number }[];
}

/** 新增中分類資料 Request */
export interface InsertTLS51020Request {
  CAT_LNo: string;
  CAT_MNo: string;
  CAT_MName: string;
  CAT_MRemark?: string;
}

/** 修改中分類資料 Request */
export interface UpdateTLS51020Request {
  id: number;
  CAT_LNo: string;
  CAT_MNo: string;
  CAT_MName: string;
  CAT_MRemark?: string;
}

/** 刪除中分類資料 Request */
export interface DeleteTLS51020Request {
  idList: number[];
}

/** 查詢中分類資料 Response */
export interface QueryTLS51020Response {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MNo: string;
  CAT_MName: string;
  CAT_MRemark?: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  CanDel: boolean;
}

// ============================================================================
// TLS51020 Service
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class Tls51020Service {
  private readonly apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private readonly http: HttpClient) {}

  queryTLS51020(params: QueryTLS51020Request): Observable<ApiResponse<QueryTLS51020Response[]>> {
    return this.http.post<ApiResponse<QueryTLS51020Response[]>>(`${this.apiUrl}/queryTLS51020`, params);
  }

  insertTLS51020(payload: InsertTLS51020Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS51020`, payload);
  }

  updateTLS51020(payload: UpdateTLS51020Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS51020`, payload);
  }

  deleteTLS51020(payload: DeleteTLS51020Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deleteTLS51020`, payload);
  }
}