import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface POS6118Request {
  ECR_No: string
  TXN_No: string,
  TLT_No: string,
  NCML_TxnTypeList: string[],
  NCML_PayCrdTypeList: string[],
  NCML_TxnAmt_Start: string,
  NCML_TxnAmt_End: string,
  NCML_TxnDate_Start: string,
  NCML_TxnDate_End: string,
  NCML_TxnTime_Start: string,
  NCML_TxnTime_End: string,
  NCML_CrdNo: string,
  NCML_TmID: string,
  NCML_BatCloseDate_Start: string,
  NCML_BatCloseDate_End: string,
  NCML_CrdTxnFgList: string[],
  NCML_CheckList: string[],
  NCML_ApprovalCode: string,
  NCML_TermNoList: string[]
}
export interface POS6119Request {
  ECR_No: string,
  TXN_No: string,
  TLT_No: string,
  CTBC_TxnTypeList: string[],
  CTBC_TxnAmt_Start: string,
  CTBC_TxnAmt_End: string,
  CTBC_TxnDate_Start: string,
  CTBC_TxnDate_End: string,
  CTBC_CrdNo: string,
  CTBC_TmID: string,
  CTBC_Date_Start: string,
  CTBC_Date_End: string,
  CTBC_DataTypeList: string[],
  CTBC_CheckList: string[],
  CTBC_ApprovalCode: string;
  CTBC_TermNoList: string[]
}
export interface POS6119PRequest {
  ECR_No: string,
  TXN_No: string,
  TLT_No: string,
  CTBC_TxnTypeList: string[],
  CTBC_TxnAmt_Start: string,
  CTBC_TxnAmt_End: string,
  CTBC_TxnDate_Start: string,
  CTBC_TxnDate_End: string,
  CTBC_CrdNo: string,
  CTBC_TmID: string,
  CTBC_BusDate_Start: string,
  CTBC_BusDate_End: string,
  CTBC_CheckList: string[],
  CTBC_ApprovalCode: string
}
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
  NCML_Date: string,
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
  CTBC_PayDate: string,
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

export interface POS6118Insert {
  NCML_File: string,
  NCML_Date: string,
  NCML_SeqNo: number,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  NCML_PayCrdType: string,
  NCML_TxnType: string,
  NCML_TxnAmt: number,
  NCML_CrdNo: string,
  NCML_TmID: string,
  NCML_BatCloseDate: string,
  NCML_ApprovalCode: string,
  NCML_Check: string,
  NCML_CrdTxnFg: string,
  NCML_TermNo: number,
  NCML_TxnTime: string
}

export interface POS6119Insert {
  CTBC_File: string,
  CTBC_Date: string,
  CTBC_SeqNo: number,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  CTBC_DataType: string,
  CTBC_TxnTime: string,
  CTBC_CrdNo: string,
  CTBC_MerID: string,
  CTBC_TmID: string,
  CTBC_TxnCode: string,
  CTBC_TxnAmt: number,
  CTBC_ApprovalCode: string,
  CTBC_Check: string,
  CTBC_TermNo: number,
  CRT_Date: string,
  CRT_USR_No: string,
  UPD_Date: string,
  UPD_USR_No: string
}

export interface POS6119PInsert {
  CTBC_File: string,
  CTBC_Date: string,
  CTBC_SeqNo: number,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  CTBC_CrdNo: string,
  CTBC_TxnDate: string,
  CTBC_TxnAmt: number,
  CTBC_TxnType: string,
  CTBC_PayDate: string,
  CTBC_TmID: string,
  CTBC_ApprovalCode: string,
  CTBC_Check: string,
  CRT_Date: string,
  CRT_USR_No: string,
  UPD_Date: string,
  UPD_USR_No: string
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
  queryPOS6118(body: POS6118Request): Observable<ApiResponse<POS6118Data[]>> {
    return this.http.post<ApiResponse<POS6118Data[]>>(`${this.apiUrl}/queryPOS6118`, body);
  }

  /**
   * 查詢 POS6119（實收信用卡調整作業 - 中信）
   */
  queryPOS6119(body: POS6119Request): Observable<ApiResponse<POS6119Data[]>> {
    return this.http.post<ApiResponse<POS6119Data[]>>(`${this.apiUrl}/queryPOS6119`, body);
  }

  /**
   * 查詢 POS6119P（實收信用卡調整作業 - 中信 P）
   */
  queryPOS6119P(body: POS6119PRequest): Observable<ApiResponse<POS6119PData[]>> {
    return this.http.post<ApiResponse<POS6119PData[]>>(`${this.apiUrl}/queryPOS6119P`, body);
  }
  /**
 * 新增 POS6118（聯合 - 實收信用卡調整作業）
 */
  insertPOS6118(body: POS6118Insert): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertPOS6118`, body);
  }

  /**
   * 新增 POS6119（中信 - 實收信用卡調整作業）
   */
  insertPOS6119(body: POS6119Insert): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertPOS6119`, body);
  }

  /**
   * 新增 POS6119P（中信停車場 - 實收信用卡調整作業）
   */
  insertPOS6119P(body: POS6119PInsert): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertPOS6119P`, body);
  }
  // 刪除資料
  deleteTLS27040(body: { idList: number[], tableName: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteTLS27040`, body);
  }

  // 檢核能否新增
  queryInsCheck(body: {
    SYS_StoreNo: string,
    ECR_No: string,
    TXN_No: string,
    TXN_Date: string,
    tableName: string
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryInsCheck`, body);
  }

  //  更新 POS6118
  updatePOS6118(body: POS6118Data): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updatePOS6118`, body);
  }

  //  更新 POS6119
  updatePOS6119(body: POS6119Data): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updatePOS6119`, body);
  }

  //  更新 POS6119P
  updatePOS6119P(body: POS6119PData): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updatePOS6119P`, body);
  }
}
