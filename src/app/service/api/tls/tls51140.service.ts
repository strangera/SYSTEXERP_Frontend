
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SortMeta } from 'primeng/api';
import { ApiResponse } from '@service/system/auth.service';

/**
 * 查詢 POS2034_ECR 資料的 Request 格式
 */
export interface QueryTLS45030Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  TLT_NO?: string;
  ECR_No?: string;
}

/**
 * 查詢 POS2034_ECR 資料的 Response 資料格式
 */
export interface QueryTLS45030ResponseData {
  ID: number;
  TLT_NO: string;
  TLT_Name: string;
  ECR_No: string;
  ECR_Name: string;
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
  queryTLS45030(request: QueryTLS45030Request): Observable<ApiResponse<QueryTLS45030ResponseData[]>> {
    const url = `${this.apiUrl}/queryTLS45030`;
    return this.http.post<ApiResponse<QueryTLS45030ResponseData[]>>(url, request);
  }
}
