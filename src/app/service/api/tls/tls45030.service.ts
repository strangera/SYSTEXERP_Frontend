import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 查詢收銀機狀態歷史檔資料的 Request 格式
 */
export interface QueryTLS45030Request {
  Txn_Date_Start: Date | null | string;
  Txn_Date_End: Date | null | string;
  ECR_No_List?: string[];
  TLT_No_List?: string[];
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
}

/**
 * 查詢收銀機狀態歷史檔資料的 Response 資料格式
 */
export interface QueryTLS45030ResponseData {
  TXN_Date: string;
  ECR_No: string;
  USR_No: string;
  USR_Name: string;
  EOS_StartUpTime: string;
  EOS_CloseTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class Tls45030Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * 查詢收銀機狀態歷史檔資料
   * @param request 查詢條件
   * @returns 查詢結果的 Observable
   */
  queryTLS45030(request: QueryTLS45030Request): Observable<ApiResponse<QueryTLS45030ResponseData[]>> {
    return this.http.post<ApiResponse<QueryTLS45030ResponseData[]>>(`${this.apiUrl}/queryTLS45030`, request);
  }
}
