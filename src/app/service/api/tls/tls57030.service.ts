import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

// --- Interface 定義 ---

/** 商品庫存表查詢條件 */
export interface QueryTLS57030Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
  HOS_No?: string;
  LOGO_No?: string;
  PLU_MagNo?: string;
  PLU_No?: string;
  PLU_OrgPLUNo?: string;
  STK_Date?: string | Date; // 2025-12-22T17:51:41.906Z
  ShowStockRange?: string;
  DisplayRowNumber?: string;
}

/** 商品庫存表單筆資料項目 */
export interface TLS57030Detail {
  ID: number;
  MID: string;
  LOGO_CH_NAME: string;
  HOS_NAME: string;
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_No: string;
  PLU_OrgPLUNo: string;
  CAT_LName: string;
  CAT_MName: string;
  CAT_SName: string;
  PLU_OrderPrc: number;
  PLU_SalePrc: number;
  STK_CurrentQty: number;
  sumPLU_OrderPrc: number;
  sumPLU_SalePrc: number;
}

@Injectable({
  providedIn: 'root',
})
export class TLS57030Service {
  // 根據 Swagger：/TLS0000/TLS1000/queryTLS57030
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) { }

  /** 查詢商品庫存表作業資料 */
  queryTLS57030(data: QueryTLS57030Request): Observable<ApiResponse<TLS57030Detail[]>> {
    return this.http.post<ApiResponse<TLS57030Detail[]>>(`${this.apiUrl}/queryTLS57030`, data);
  }
}
