import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface POS6118Data {
  ID: number,
  MID: number,
  ECR_No: string,
  TXN_No: number,
  TLT_NO: string,
  NCML_TxnAmt: number,
  NCML_TmID: string,
  NCML_BatCloseDate: string,
  NCML_PayCrdType: string,
  NCML_CrdNo: string,
  NCML_TxnDate: string,
  NCML_TxnTime: string,
  NCML_TxnType: string,
  NCML_ApprovalCode: string,
  NCML_CrdTxnFg: string,
  NCML_TermNo: number,
  NCML_Check: string,
  acquiring_Bank: string,
  CRT_USR_No: string,
  CRT_Date: string,
  UPD_USR_No: string,
  UPD_Date: string
}

export interface POS6119Data {
  ID: number,
  MID: number,
  ECR_No: string,
  TXN_No: number,
  TLT_NO: string,
  CTBC_TxnAmt: number,
  CTBC_TmID: string,
  CTBC_Date: string,
  CTBC_CrdNo: string,
  CTBC_TxnTime: string,
  CTBC_TxnCode: string,
  CTBC_ApprovalCode: string,
  CTBC_DataType: string,
  CTBC_TermNo: number,
  CTBC_Check: string,
  acquiring_Bank: string,
  CRT_USR_No: string,
  CRT_Date: string,
  UPD_USR_No: string,
  UPD_Date: string
}

export interface POS6119PData {
  ID: number,
  MID: number,
  ECR_No: string,
  TXN_No: number,
  TLT_NO: string,
  CTBC_TxnAmt: number,
  CTBC_TmID: string,
  CTBC_BusDate: string,
  CTBC_CrdNo: string,
  CTBC_TxnDate: string,
  CTBC_TxnType: string,
  CTBC_ApprovalCode: string,
  CTBC_DataType: string,
  CTBC_TermNo: number,
  CTBC_Check: string,
  acquiring_Bank: string,
  CRT_USR_No: string,
  CRT_Date: string,
  UPD_USR_No: string,
  UPD_Date: string
}

@Injectable({
  providedIn: 'root'
})
export class TLS27040Service {

  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS6118（實收信用卡調整作業 - 聯合）
   */
  queryPOS6118(body: any): Observable<ApiResponse<POS6118Data[]>> {
    return this.http.post<ApiResponse<POS6118Data[]>>(`${this.apiUrl}/queryPOS6118`, body);
  }

  /**
   * 查詢 POS6119（實收信用卡調整作業 - 中信）
   */
  queryPOS6119(body: any): Observable<ApiResponse<POS6119Data[]>> {
    return this.http.post<ApiResponse<POS6119Data[]>>(`${this.apiUrl}/queryPOS6119`, body);
  }

  /**
   * 查詢 POS6119P（實收信用卡調整作業 - 中信 P）
   */
  queryPOS6119P(body: any): Observable<ApiResponse<POS6119PData[]>> {
    return this.http.post<ApiResponse<POS6119PData[]>>(`${this.apiUrl}/queryPOS6119P`, body);
  }
}
