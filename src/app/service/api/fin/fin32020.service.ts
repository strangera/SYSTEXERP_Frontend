import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

/** 後端 queryFIN32020Response 對應 */
export interface Fin32020Row {
  Id: number;

  ADJ_No?: string | null;    // 調整單號
  ADJ_Date?: string | null;  // 調整日期 (字串)
  Remark?: string | null;    // 備註

  _Details?: Fin32020DetailRow[] | null; // 明細清單
  TotalCount?: number;

  [key: string]: any;
}

/** 後端 queryFIN32020detailResponse 對應 */
export interface Fin32020DetailRow {
  Detail_id?: number;
  STO_No?: string | null;
  SeqNo?: number | null;
  AccNo?: string | null;
  AccCName?: string | null;
  ADJ_Amt?: number | null;
  Detail_Remark?: string | null;
  ARS_No?: string | null;
  VouNo?: string | null;
  gls3001_id?: number | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  TotalCount?: number;
}

/** 查詢 Request：對應 queryFIN32020Request */
export interface Fin32020QueryRequest {
  ADJ_No?: string | null;         // 調整單號
  ADJ_Date_From?: string | null;  // 調整日期起 yyyy-MM-dd
  ADJ_Date_To?: string | null;    // 調整日期迄 yyyy-MM-dd
  Remark?: string | null;         // 備註 (模糊)
  VouNo_From?: string | null;     // 傳票編號起
  VouNo_To?: string | null;       // 傳票編號迄

  PageIndex?: number;
  PageSize?: number;
  SortBy?: { field: string; order: number }[];
  OrderBy?: string | null;
  Offset?: number | null;

  [key: string]: any;
}

/** 新增 Request：對應 insertFIN32020Request */
export interface Fin32020InsertRequest {
  ADJ_Date: string; // yyyy-MM-dd
  Remark?: string | null;
  _Details: Fin32020DetailRow[];
}

/** 更新 Request：對應 updateFIN32020Request */
export interface Fin32020UpdateRequest extends Fin32020InsertRequest {
  ADJ_No: string;
}

/** 調整科目清單：對應 queryFIN32020GetAdjAccResponse */
export interface Fin32020AdjAccRow {
  CAR_AccNo: string;
  AccCName: string;
  CAR_type: string;
}

/** 查詢應收帳款資料：對應 queryFIN32020GetARSResponse */
export interface Fin32020ARSRow {
  ARS_No?: string | null;
  VEN_No?: string | null;
  ARS_Date?: string | null;
  PTA_Date?: string | null;
  ARS_Amt?: number | null;
  NoteDesc?: string | null;
}

/** 查詢應收帳款資料 Request：對應 queryFIN32020GetARSRequest */
export interface Fin32020GetARSRequest {
  VEN_No?: string | null;
  ARS_Date_From?: string | null;
  ARS_Date_To?: string | null;
  PageIndex?: number;
  PageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class FIN32020Service {
  /** 對應 FIN32020Controller */
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢應收帳款調整作業列表：/queryFIN32020 */
  queryFIN32020(
    body: Fin32020QueryRequest
  ): Observable<ApiResponse<Fin32020Row[]>> {
    return this.http.post<ApiResponse<Fin32020Row[]>>(
      `${this.apiUrl}/queryFIN32020`,
      body
    );
  }

  /** 查詢明細：/queryFIN32020Detail */
  queryFIN32020Detail(
    ADJ_No: string
  ): Observable<ApiResponse<Fin32020DetailRow[]>> {
    return this.http.post<ApiResponse<Fin32020DetailRow[]>>(
      `${this.apiUrl}/queryFIN32020Detail`,
      { ADJ_No }
    );
  }

  /** 新增：/insertFIN32020，回傳 ADJ_No */
  insertFIN32020(
    body: Fin32020InsertRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/insertFIN32020`,
      body
    );
  }

  /** 更新：/updateFIN32020，回傳 ADJ_No */
  updateFIN32020(
    body: Fin32020UpdateRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/updateFIN32020`,
      body
    );
  }

  /** 查詢調整科目：/queryFIN32020GetAdjAcc */
  getAdjAcc(): Observable<ApiResponse<Fin32020AdjAccRow[]>> {
    return this.http.post<ApiResponse<Fin32020AdjAccRow[]>>(
      `${this.apiUrl}/queryFIN32020GetAdjAcc`,
      {}
    );
  }

  /** 查詢應收帳款資料：/queryFIN32020GetARS */
  getARS(
    body: Fin32020GetARSRequest
  ): Observable<ApiResponse<Fin32020ARSRow[]>> {
    return this.http.post<ApiResponse<Fin32020ARSRow[]>>(
      `${this.apiUrl}/queryFIN32020GetARS`,
      body
    );
  }
}

export { ApiResponse };
