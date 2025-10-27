import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

// Query request interface for TLS26020
export interface TLS26020QueryRequest extends BaseQueryRequest {
  Sale_DateStart?: string;      // 銷售日期(起) - ISO 8601 格式
  Sale_DateEnd?: string;        // 銷售日期(訖) - ISO 8601 格式
  tlt_building?: string[];      // 館別
  Org_ID?: string[];            // 組織代碼
  Org_Name?: string;            // 組織名稱
  tlt_floor?: string[];         // 樓層
  ECR_No?: string[];            // 收銀機號碼
  TLT_No?: string[];            // 專櫃編號
}

// 預售總表明細查詢條件
export interface TLS26020DetailRequest {
  tlt_no: string;               // 專櫃編號
  Sale_DateStart: string;       // 銷售日期(起) - ISO 8601 格式
  Sale_DateEnd: string;         // 銷售日期(訖) - ISO 8601 格式
}

// Data result interface for TLS26020 (預售總表資料)
export interface TLS26020Data {
  tlt_no: string;               // 專櫃編號
  tlt_name: string;             // 櫃位名稱
  txn_TotGUI: number;           // 發票總數
  txn_TotSaleAmt: number;       // 銷售總金額
}

// 預售總表明細回應資料
export interface TLS26020DetailData {
  TXN_DATE: string;             // 交易日期 - ISO 8601 格式
  ECR_NO: string;               // 收銀機號
  TXN_NO: number;               // 交易序號
  TXN_GUIBegNo_Pre: string;     // 發票起始號碼前綴
  TXN_GUIBegNo: string;         // 發票起始號碼
  TXN_GUIEndNo: string;         // 發票結束號碼
  TXN_TotGUI: number;           // 發票總數
  TXN_TotSaleAmt: number;       // 銷售總金額
}

@Injectable({
  providedIn: 'root'
})
export class TLS26020Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢預售總表
  queryTLS26020(data: TLS26020QueryRequest): Observable<BaseQueryResponse<TLS26020Data>> {
    return this.http.post<BaseQueryResponse<TLS26020Data>>(`${this.apiUrl}/queryTLS26020`, data);
  }

  // 查詢預售總表明細
  queryTLS26020Detail(data: TLS26020DetailRequest): Observable<BaseQueryResponse<TLS26020DetailData>> {
    return this.http.post<BaseQueryResponse<TLS26020DetailData>>(`${this.apiUrl}/queryTLS26020_Detail`, data);
  }
}
