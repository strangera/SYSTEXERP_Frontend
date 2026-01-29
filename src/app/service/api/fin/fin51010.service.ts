import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './fin26010.service';

/** 筆數統計 Response */
export interface QueryFIN51010CountResponse {
  SrcSheetType: string;
  Voucher_Name: string;
  CNT: number;
}

/** 查詢主表 Request */
export interface QueryFIN51010Request {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  SrcSheetType?: string;
  VouDate_From?: string | Date;
  VouDate_To?: string | Date;
  Trans_Status?: string;
  PostFlag?: string;
  VouNo?: string;
  Remark?: string;
  AccNo?: string;
  DetailNo?: string;
  NoteDesc?: string;
  SubDetailNo?: string;
}

/** 查詢主表 Response */
export interface QueryFIN51010Response {
  id: number;
  SrcSheetType: string;
  Voucher_Name: string;
  VouDate: string;
  Remark: string;
  Debit_Amt: number;
  Credit_Amt: number;
}

/** 查詢明細 Response */
export interface QueryFIN51010DetailResponse {
  VouNo: string;
  Voucher_Name: string;
  SrcSheetType: string;
  VouDate: string;
  Remark: string;
  SettleNo: string;
  Trans_Status: string;
  CRT_USR_No: string;
  CRT_Date: string;
  UPD_USR_No: string;
  UPD_Date: string;
  LineList: QueryFIN51010DetailLine[];
}

export interface QueryFIN51010DetailLine {
  id: number;
  SerNo: number;
  AccNo: string;
  AccCName: string;
  NoteDesc: string;
  Debit_Amt: number;
  Credit_Amt: number;
  ORG_ID: string;
  ProjectNo: string;
  PTA: string;
  DetailNo: string;
  SubDetailNo: string;
}

/** 更新 Request */
export interface UpdateFIN51010Request {
  GLS6001_ID: number;
  Remark: string;
  DetailList: {
    GLS6002_ID: number;
    NoteDesc: string;
  }[];
}

/** 轉拋 Response */
export interface TransferFIN51010Response {
  ErrCode: number;
  ErrMsg: string;
}

@Injectable({
  providedIn: 'root'
})
export class Fin51010Service {
  apiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) { }

  /** 1. 查詢暫存傳票審核作業憑證種類筆數 */
  queryFIN51010Count(): Observable<ApiResponse<QueryFIN51010CountResponse[]>> {
    return this.http.post<ApiResponse<QueryFIN51010CountResponse[]>>(
      `${this.apiUrl}/FIN0000/GLS1000/queryFIN51010Count`,
      {}
    );
  }

  /** 2. 查詢暫存傳票審核作業 (主表) */
  queryFIN51010(body: QueryFIN51010Request): Observable<ApiResponse<QueryFIN51010Response[]>> {
    return this.http.post<ApiResponse<QueryFIN51010Response[]>>(
      `${this.apiUrl}/FIN0000/GLS1000/queryFIN51010`,
      body
    );
  }

  /** 3. 查詢暫存傳票審核作業明細 */
  queryFIN51010Detail(body: { GLS6001_ID: number }): Observable<ApiResponse<QueryFIN51010DetailResponse[]>> {
    return this.http.post<ApiResponse<QueryFIN51010DetailResponse[]>>(
      `${this.apiUrl}/FIN0000/GLS1000/queryFIN51010Detail`,
      body
    );
  }

  /** 4. 更新暫存傳票審核作業 */
  updateFIN51010(body: UpdateFIN51010Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(
      `${this.apiUrl}/FIN0000/GLS1000/updateFIN51010`,
      body
    );
  }

  /** 5. 轉拋暫存傳票審核作業 (呼叫 SP) */
  transferFIN51010(body: { GLS6001_IDList: string }): Observable<ApiResponse<TransferFIN51010Response>> {
    return this.http.post<ApiResponse<TransferFIN51010Response>>(
      `${this.apiUrl}/FIN0000/GLS1000/transferFIN51010`,
      body
    );
  }
}
