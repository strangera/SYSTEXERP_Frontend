import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** 交易日期請求參數 (用於檢查、日結、反日結) */
export interface Tls55010DateRequest {
  TXN_Date: string; // 交易日期，格式通常為 'YYYY-MM-DD'
}

/** 日結作業前檢查結果的單筆資料結構 */
export interface CheckTls55010Data {
  mid: string;
  cls_date: string;
  step_num: number;
  master_key: string;
  check_result: string; // 檢查結果的描述
}

/** 會計分錄明細 (G/L Detail) - _gls6002s */
export interface Gls6002 {
  id: number;
  mid: number;
  gls6001_id: number;
  SerNo: number;
  AccDC: string;
  AccNo: string;
  ACCCNAME: string;
  AccAmt: number;
  ORG_ID: string;
  DetailNo: string;
  VEN_NAME: string;
  SubDetailNo: string;
  ProjectNo: string;
  NoteDesc: string;
  PTA: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/** 會計分錄主檔 (G/L Master) - _gls6001 */
export interface Gls6001 {
  id: number;
  mid: number;
  CompNo: string;
  VouNo: string;
  VouType: string;
  VouDate: string;
  SrcSheetType: string;
  SrcSheetNo: string;
  PostFlag: string;
  INV_YN: string;
  Remark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/** 進貨日結作業 (insertTLS55010) 回傳的資料結構 */
export interface InsertTls55010Data {
  Data: {
    _gls6001: Gls6001;
    _gls6002s: Gls6002[];
  };
}

export interface QueryTLS55010OneMonthData {
  QueryData: QueryTLS55010OneMonthResponse[];
  TotalCount: number;
}

export interface QueryTLS55010OneMonthResponse {
  CLS_DATE: string;
  Cls_ExecDate: string;
  Lock_USR_No: string;
  Lock_USR_Name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Tls55010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`; // 根據 Swagger Path 調整 API URL

  constructor(private http: HttpClient) { }

  /**
   * 查詢最近關帳日期 (GetTLS55010Date)
   * @returns 僅包含狀態碼和訊息的 API Response (最近關帳日通常在 Message 或 Header 中，這裡假設 API Response 結構足夠)
   */
  getTLS55010Date(): Observable<ApiResponse<{ CLS_DATE: string }>> { // Response 的 Data 欄位會直接回傳最近的日期字串，否則可能需要更精確的介面
    return this.http.post<ApiResponse<{ CLS_DATE: string }>>(`${this.apiUrl}/GetTLS55010Date`, {});
  }

  /**
   * 進貨日結作業前檢查 (checkTLS55010)
   * @param request 交易日期
   * @returns 包含檢查結果列表的 API Response
   */
  checkTLS55010(request: Tls55010DateRequest): Observable<ApiResponse<CheckTls55010Data[]>> {
    return this.http.post<ApiResponse<CheckTls55010Data[]>>(`${this.apiUrl}/checkTLS55010`, request);
  }

  /**
   * 執行進貨日結作業 (insertTLS55010)
   * @param request 交易日期
   * @returns 包含產生的會計分錄 (G/L) 資訊的 API Response
   */
  insertTLS55010(request: Tls55010DateRequest): Observable<ApiResponse<InsertTls55010Data>> {
    return this.http.post<ApiResponse<InsertTls55010Data>>(`${this.apiUrl}/insertTLS55010`, request);
  }

  /**
   * 反進貨日結作業 (unLockTLS55010)
   * @param request 交易日期
   * @returns 僅包含狀態碼和訊息的 API Response
   */
  unLockTLS55010(request: Tls55010DateRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/unLockTLS55010`, request);
  }

  queryTLS55010(request: Tls55010DateRequest): Observable<ApiResponse<InsertTls55010Data>> {
    return this.http.post<ApiResponse<InsertTls55010Data>>(`${this.apiUrl}/queryTLS55010`, request);
  }

  queryTLS55010OneMonth(request: Tls55010DateRequest): Observable<ApiResponse<QueryTLS55010OneMonthData>> {
    return this.http.post<ApiResponse<QueryTLS55010OneMonthData>>(`${this.apiUrl}/queryTLS55010_OneMonth`, request);
  }
}
