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
  PostFlag: string;
  Trans_Status: string;
  id: number;
  SrcSheetType: string;
  Voucher_Name: string;
  VouDate: string;
  Remark: string;
  Debit_Amt: number;
  Credit_Amt: number;
  TransVouNo?: string;
}

/** 查詢明細 Response */
export interface QueryFIN51010DetailResponse {
  VouNo: string;
  TransVouNo: string;
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
  VouDate: string;
  Remark: string;
  DetailList: {
    GLS6002_ID: number;
    AccNo: string;      // 新增
    NoteDesc: string;
    ORG_ID: string;     // 新增
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
  queryFIN51010Count(PostFlag: string | null): Observable<ApiResponse<QueryFIN51010CountResponse[]>> {
    return this.http.post<ApiResponse<QueryFIN51010CountResponse[]>>(
      `${this.apiUrl}/FIN0000/GLS1000/queryFIN51010Count`,
      { PostFlag }
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

  // 作廢
  voidFIN51010(body: { GLS6001_IDList: string }): Observable<ApiResponse<TransferFIN51010Response>> {
    return this.http.post<ApiResponse<TransferFIN51010Response>>(
      `${this.apiUrl}/FIN0000/GLS1000/voidFIN51010`,
      body
    );
  }

  /** 匯入HR傳票資料作業 (呼叫 SP) */
  importHRVouFIN51010(): Observable<ApiResponse<TransferFIN51010Response>> {
    return this.http.post<ApiResponse<TransferFIN51010Response>>(
      `${this.apiUrl}/FIN0000/GLS1000/Import_HR_VouFIN51010`,
      {} // 無參數仍需傳遞空物件
    );
  }

  /** 查詢 PT 進項發票資料 */
  queryPTInvoice(body: { GLS6001_ID: number }): Observable<ApiResponse<QueryFIN51010InvoiceLine[]>> {
    return this.http.post<ApiResponse<QueryFIN51010InvoiceLine[]>>(
      `${this.apiUrl}/FIN0000/GLS1000/queryPTInvoice`, body
    );
  }

  /** 查詢 WT 進項發票資料 */
  queryWTInvoice(body: { VouNo: string }): Observable<ApiResponse<QueryFIN51010InvoiceLine[]>> {
    return this.http.post<ApiResponse<QueryFIN51010InvoiceLine[]>>(
      `${this.apiUrl}/FIN0000/GLS1000/queryWTInvoice`, body
    );
  }
  /** 查詢 PU 進項發票資料 */
  queryPUInvoice(body: { GLS6001_ID: number }): Observable<ApiResponse<QueryFIN51010InvoiceLine[]>> {
    return this.http.post<ApiResponse<QueryFIN51010InvoiceLine[]>>(
      `${this.apiUrl}/FIN0000/GLS1000/queryPUInvoice`, body
    );
  }
}


/** 假設進項發票的欄位結構與傳票明細類似，或是你有特定的發票 Interface */
export interface QueryFIN51010InvoiceLine {
  VoucherType: string,
  TrackNo: string,
  InvoiceNo: string,
  InvoiceDate: string,
  DeclareYM: string,
  VendorTaxID: string,
  InvoiceUsage: string,
  InvoiceAmount: number,
  TaxType: string,
  NetAmount: number,
  TaxAmount: number,
  DeductionCodeDesc: string,
  CategoryType: string,
  SourceDocNo: string,
  TotalCount: number,
}
