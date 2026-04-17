import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { Observable, take } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Query request interface for TLS26030
export interface TLS26030QueryRequest extends BaseQueryRequest {
  Sale_DateStart?: string;      // 銷售日期(起) - ISO 8601 格式
  Sale_DateEnd?: string;        // 銷售日期(訖) - ISO 8601 格式
  tlt_building?: string[];      // 館別
  Org_ID?: string[];            // 組織代碼
  tlt_floor?: string[];         // 樓層
  ECR_No?: string[];            // 收銀機號碼
  TLT_No?: string[];            // 專櫃編號
}

// Data result interface for TLS26030 (預售明細表資料)
export interface TLS26030Data {
  TXN_Date: string;             // 銷售日期
  ECR_No: string | null;        // 收銀機號
  TXN_No: string | null;        // 交易序號
  TLT_No: string | null;        // 專櫃編號
  tlt_name: string | null;      // 專櫃名稱
  TXN_TotSaleAmt: number;       // 預售金額
  Recog_Amt: number | null;     // 認列金額
  Batch_No: string | null;      // 認列批號
  Preorder_status: string | null; // 預售狀態
  CANCEL_Date: string | null;   // 作廢日期
  CANCEL_ECR_No: string | null; // 作廢機號
  CANCEL_TXN_No: string | null; // 作廢序號
  Close_Date: string | null;    // 結帳日期
  Close_Ecr_No: string | null;  // 結帳機號
  Close_Txn_No: string | null;  // 結帳序號
}

@Injectable({
  providedIn: 'root'
})
export class TLS26030Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢預售明細表
  queryTLS26030(data: TLS26030QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS26030`, data);
  }

  /** 匯出 Excel */
  exportExcelTLS26030(payload: TLS26030QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportTLS26030_Excel`, payload, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }

  /** 匯出 PDF */
  exportPDFTLS26030(payload: TLS26030QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportTLS26030_PDF`, payload, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }
}
