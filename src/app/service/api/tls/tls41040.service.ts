import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

/** 2.4.1 查詢條件 (Request Body) */
export interface TLS41040QueryReq {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  ECR_No?: string;
  NOT_BegDateTime?: Date | string | null;
  NOT_EndDateTime?: Date | string | null;
  NOT_Status?: string;
  NOT_Remark?: string;
}

/** 查詢結果明細 (Details) */
export interface TLS41040Detail {
  ID?: number;
  STO_No?: string;
  NOT_DateTime?: Date | string;
  NOT_Type?: string;
  NOT_SeqNo?: number;
  TLT_No?: string;
  tlt_name?: string;
  ECR_Type?: string;
  ECR_GrpNo?: string;
  ECR_No?: string;
  BUILDING_No?: string;
  FLOOR_No?: string;
  Area_No?: string;
  status?: string; // 新增/更新時使用
}

/** 查詢結果主檔 (Data Row) */
export interface TLS41040Data {
  ID: number;
  STO_No: string;
  NOT_DateTime: Date | string;
  NOT_Type: string;
  NOT_BegDateTime: Date | string;
  NOT_EndDateTime: Date | string;
  NOT_Desc: string;
  NOT_Status: string;
  NOT_Remark: string;
  NOT_DispRt: string;
  NOT_DispSpd: string;
  NOT_DispBtn: string;
  NOT_DispCd: string;
  NOT_Prn: string;
  NOT_DtlLimit: string;
  Details: TLS41040Detail[];
}

/** 新增/更新 Request Body */
export interface TLS41040SaveReq {
  ID?: number; // 更新時必填
  NOT_DateTime?: Date | string;
  NOT_BegDateTime: Date | string;
  NOT_EndDateTime: Date | string;
  NOT_Status: string;
  NOT_Remark?: string;
  NOT_DispRt?: string;
  NOT_DispSpd?: string;
  NOT_DispBtn?: string;
  NOT_DispCd?: string;
  NOT_Prn?: string;
  NOT_DtlLimit?: string;
  NOT_Desc: string;
  Detail: TLS41040Detail[];
}

/** 刪除與下傳 Request Body */
export interface TLS41040IdListReq {
  idList: number[];
}

// --- Service ---

@Injectable({
  providedIn: 'root'
})
export class Tls41040Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) { }

  /** 查詢收銀機基本資料管理 */
  queryTLS41040(data: TLS41040QueryReq): Observable<ApiResponse<TLS41040Data[]>> {
    return this.http.post<ApiResponse<TLS41040Data[]>>(`${this.apiUrl}/queryTLS41040`, data);
  }

  /** 新增收銀機基本資料管理 */
  insertTLS41040(data: TLS41040SaveReq): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS41040`, data);
  }

  /** 更新收銀機基本資料管理 */
  updateTLS41040(data: TLS41040SaveReq): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS41040`, data);
  }

  /** 刪除收銀機基本資料管理 (idList) */
  deleteTLS41040(data: TLS41040IdListReq): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteTLS41040`, data);
  }

  /** 根據 ID 下傳 POS (idList) */
  posTLS41040(data: TLS41040IdListReq): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/posTLS41040`, data);
  }
}
