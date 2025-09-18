import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

// Query request interface for TLS26030
export interface TLS26030QueryRequest extends BaseQueryRequest {
  Sale_DateStart?: string;      // 銷售日期(起) - ISO 8601 格式
  Sale_DateEnd?: string;        // 銷售日期(訖) - ISO 8601 格式
  tlt_building?: string[];      // 館別
  Org_ID?: string[];            // 組織代號
  Org_Name?: string;            // 組織名稱
  tlt_floor?: string[];         // 樓層
  SYS_StoreNo?: string;         // 店號
  ECR_No?: string[];            // 收銀機號碼 - 新增
  TLT_No?: string[];            // 專櫃編號 - 新增
}

// Data result interface for TLS26030 (預售明細表資料)
export interface TLS26030Data {
  TXN_Date: string;             // 交易日期
  ECR_No: string;               // 收銀機號
  TXN_No: string;               // 交易序號
  TXN_TotSaleAmt: number;       // 銷售總金額
  CANCEL_Date: string;          // 作廢日期
  CANCEL_ECR_No: string;        // 作廢收銀機號
  CANCEL_TXN_No: string;        // 作廢交易序號
  TLT_No: string;               // 專櫃編號
  tlt_name: string;             // 專櫃名稱
  ORG_ID: string;               // 組織代號
  Org_Name: string;             // 組織名稱
  Preorder_status: string;      // 預售狀態
  Recog_Amt: number;            // 認列金額
  Batch_No: string;             // 批號
  Close_Date: string;           // 結帳日期
  Close_Ecr_No: string;         // 結帳收銀機號
  Close_Txn_No: string;         // 結帳交易序號
}

@Injectable({
  providedIn: 'root'
})
export class TLS26030Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢預售明細表
  queryTLS26030(data: TLS26030QueryRequest): Observable<BaseQueryResponse<TLS26030Data>> {
    return this.http.post<BaseQueryResponse<TLS26030Data>>(`${this.apiUrl}/queryTLS26030`, data);
  }
}
