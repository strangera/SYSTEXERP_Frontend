import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Query request interface for TLS26020
export interface TLS26020QueryRequest extends ApiRequest {
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
  queryTLS26020(data: TLS26020QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS26020`, data);
  }

  // 查詢預售總表明細
  queryTLS26020Detail(data: TLS26020DetailRequest): Observable<ApiResponse<TLS26020DetailData[]>> {
    return this.http.post<ApiResponse<TLS26020DetailData[]>>(`${this.apiUrl}/queryTLS26020_Detail`, data);
  }

  /** 匯出 Excel */
  exportExcelTLS26020(payload: TLS26020QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportTLS26020_Excel`, payload, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }

  /** 匯出 PDF */
  exportPDFTLS26020(payload: TLS26020QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportTLS26020_PDF`, payload, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }
}
