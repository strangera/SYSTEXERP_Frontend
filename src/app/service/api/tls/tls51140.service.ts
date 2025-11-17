
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SortMeta } from 'primeng/api';
import { ApiResponse } from '@service/system/auth.service';

/**
 * 查詢 POS2034_ECR 資料的 Request 格式
 */
export interface QueryTLS51140Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  TLT_NO?: string | null;
  ECR_No?: string | null;
}

export interface QueryTLS51140ResponseData {
  id: string;
  TLT_NO: string;
  TLT_Name: string;
  ECR_No: string;
  ECR_Name: string;
  HOS_No: string;
  HOS_Name: string;
  Remark: string;
}
/**
 * 查詢 POS2034_ECR 資料的 Response 資料格式
 */
export interface QueryTLS51140ByTltNoResponseData {
  id: number;
  TLT_NO: string;
  TLT_Name: string;
  ECR_No: string;
  ECR_Name: string;
  building_no?: string;
  building_name?: string;
  floor_no?: string;
  floor_name?: string;
  area_no?: string;
  area_name?: string;
  HOS_No: string;
  HOS_Name: string;
  Remark: string;
  Store_way: string;
  Approve_status: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface InsertTLS51140Request {
  TLT_NO: string;
  ECR_No: string;
  HOS_No: string;
  Remark: string;
}

export interface UpdateTLS51140Request {
  ID?: number;
  TLT_NO: string;
  ECR_No: string;
  HOS_No: string;
  Remark: string;
}

export interface DeleteTLS51140Request {
  TLT_NO_List: string[];
}
@Injectable({
  providedIn: 'root'
})
export class Tls51140Service {

  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2034_ECR 資料
   * @param request 查詢條件
   * @returns 查詢結果的 Observable
   */
  queryTLS51140(request: QueryTLS51140Request): Observable<ApiResponse<QueryTLS51140ResponseData[]>> {
    const url = `${this.apiUrl}/queryTLS51140`;
    return this.http.post<ApiResponse<QueryTLS51140ResponseData[]>>(url, request);
  }

  insertTLS51140(data: InsertTLS51140Request[]): Observable<ApiResponse<number>> {
    const url = `${this.apiUrl}/insertTLS51140`;
    return this.http.post<ApiResponse<number>>(url, data);
  }

  updateTLS51140(data: UpdateTLS51140Request[]): Observable<ApiResponse<number>> {
    const url = `${this.apiUrl}/updateTLS51140`;
    return this.http.post<ApiResponse<number>>(url, data);
  }

  queryTLS51140ByTltNo(TltNo: string, HOS_No: string): Observable<ApiResponse<QueryTLS51140ByTltNoResponseData[]>> {
    const url = `${this.apiUrl}/queryTLS51140ByTltNo`;
    return this.http.post<ApiResponse<QueryTLS51140ByTltNoResponseData[]>>(url, { TLT_NO: TltNo, HOS_No: HOS_No });
  }

  /**
     * 刪除 POS2034_ECR 資料
     * @param request 包含 TLT_NO 清單的 Request
     * @returns 刪除結果的 Observable
     */
  deleteTLS51140(request: DeleteTLS51140Request): Observable<ApiResponse<boolean>> {
    const url = `${this.apiUrl}/deleteTLS51140`;
    return this.http.post<ApiResponse<boolean>>(url, request);
  }
}
