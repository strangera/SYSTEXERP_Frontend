import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** 後端 queryFIN32020Response 對應 */
export interface Fin32020Row {
  Id: number;
  ADJ_No?: string | null;
  ADJ_Date?: string | null;
  Remark?: string | null;
  _Details?: Fin32020DetailRow[] | null;
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
export interface Fin32020QueryRequest extends BaseQueryRequest {
  ADJ_No?: string | null;
  ADJ_Date_From?: string | null;
  ADJ_Date_To?: string | null;
  Remark?: string | null;
  VouNo_From?: string | null;
  VouNo_To?: string | null;
  [key: string]: any;
}

/** 新增 Request：對應 insertFIN32020Request */
export interface Fin32020InsertRequest {
  ADJ_Date: string;
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

/** ✅ 調整科目查詢 Request（你說的新 body） */
export interface Fin32020GetAdjAccRequest {
  CAR_AccNo?: string | null;
  CAR_type?: string | null;
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
export interface Fin32020GetARSRequest extends BaseQueryRequest {
  VEN_No?: string | null;
  ARS_Date_From?: string | null;
  ARS_Date_To?: string | null;
}

/** ✅ GLS1005 下拉 */
export interface Gls1005DropDownItem {
  No: string;
  Name: string;
  ABAT_YN: string;
}

@Injectable({ providedIn: 'root' })
export class FIN32020Service {
  /** FIN0000/ARS1000 */
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  /** GLS1005 下拉（你提供的 localhost 路徑） */
  private glsUrl = `${environment.ApiUrl}`;

  constructor(private http: HttpClient) {}

  queryFIN32020(body: Fin32020QueryRequest): Observable<ApiResponse<Fin32020Row[]>> {
    return this.http.post<ApiResponse<Fin32020Row[]>>(
      `${this.apiUrl}/queryFIN32020`,
      body
    );
  }

  queryFIN32020Detail(ADJ_No: string): Observable<ApiResponse<Fin32020DetailRow[]>> {
    return this.http.post<ApiResponse<Fin32020DetailRow[]>>(
      `${this.apiUrl}/queryFIN32020Detail`,
      { ADJ_No }
    );
  }

  insertFIN32020(body: Fin32020InsertRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/insertFIN32020`,
      body
    );
  }

  updateFIN32020(body: Fin32020UpdateRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/updateFIN32020`,
      body
    );
  }

  /** ✅ 查詢調整科目：改成帶 body */
  getAdjAcc(body: Fin32020GetAdjAccRequest): Observable<ApiResponse<Fin32020AdjAccRow[]>> {
    return this.http.post<ApiResponse<Fin32020AdjAccRow[]>>(
      `${this.apiUrl}/queryFIN32020GetAdjAcc`,
      body ?? {}
    );
  }

  getARS(body: Fin32020GetARSRequest): Observable<ApiResponse<Fin32020ARSRow[]>> {
    return this.http.post<ApiResponse<Fin32020ARSRow[]>>(
      `${this.apiUrl}/queryFIN32020GetARS`,
      body
    );
  }

  /** ✅ GLS1005 科目下拉：/queryGLS1005_DropDownList */
  getGLS1005DropDown(): Observable<ApiResponse<Gls1005DropDownItem[]>> {
    return this.http.post<ApiResponse<Gls1005DropDownItem[]>>(
      `${this.glsUrl}/queryGLS1005_DropDownList`,
      {}
    );
  }
}

export { ApiResponse };
