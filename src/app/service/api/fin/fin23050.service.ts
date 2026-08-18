import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 查詢未拋轉核銷單號清單 Request (對應 SP_FIN23050Get) */
export interface GetFIN23050Request {
  REDEEM_NO_S?: string | null;
  REDEEM_NO_E?: string | null;
}

/** 查詢未拋轉核銷單號清單單筆 Response */
export interface GetFIN23050Response {
  ID: number;
  REDEEM_NO: string;
  PREP_NO: string;
  PREP_Amt: number;
}

/** 查詢核銷傳票清單明細 Request (對應 SP_FIN23050Query) */
export interface QueryFIN23050Request {
  PREP_NO: string;
  REDEEM_NO: string;
}

/** 查詢核銷傳票清單明細 Response */
export interface QueryFIN23050Response {
  ID: number;
  /** 是否拋轉(目前SP直接給'') */
  YN: string;
  REDEEM_NO: string;
  PREP_NO: string;
  VEN_No: string;
  VEN_Name: string;
  APPY_Date: string;
  CLOSE_Date: string;
  PAY_Date: string;
  PREP_Amt: number;
  /** 已核銷金額(SP目前無此金額) */
  RedeemedAmt: number;
  /** 差額(核銷金額) */
  BalanceAmt: number;
  NoteDesc: string;
}

/** 預覽傳票 Request 單筆(核銷單號+預支單號) */
export interface DetailFIN23050Item {
  REDEEM_NO: string;
  PREP_NO: string;
}

/** 預覽傳票 Request (對應 SP_FIN23050Detail，Items 一次可帶多筆，由 SP 統一重新編序號) */
export interface DetailFIN23050Request {
  Items: DetailFIN23050Item[];
}

/**
 * 預覽傳票-明細單筆(扁平化，含所屬傳票表頭欄位)。
 * SP 內部已把 Items 全部項目的明細合併＋重新編序號，不再是「一個表頭+一組明細」的巢狀結構。
 */
export interface DetailFIN23050Response {
  REDEEM_NO: string;
  PREP_NO: string;
  VouNo: string;
  Voucher_Name: string;
  VoucherType: string;
  VouDate: string;
  Remark: string;
  CRT_USR_Name: string;
  CRT_Date: string;
  /** 999999999 = SP 自動產生的123304轉列虛擬明細，GLS6002 無對應實體列 */
  Detail_ID: string;
  /** SP 依 Items 全部項目合併後重新編號，非 GLS6002 原始序號 */
  SerNo: number;
  AccNo: string;
  AccCName: string;
  VenNo: string;
  NoteDesc: string;
  DebitAmt: number;
  CreditAmt: number;
  Org_ID: string;
  Org_Name: string;
  ProjectNo: string;
}

/** 拋轉傳票明細單筆 (對應 Table Type: FIN23050Details) */
export interface PostFIN23050DetailInput {
  SerNo: number;
  /** 'D'(借方) 或 'C'(貸方) */
  AccDC: string;
  AccNo: string;
  AccAmt: number;
  NoteDesc: string;
}

/** 確定拋轉 Request (對應 SP_FIN23050Posting) */
export interface PostFIN23050Request {
  REDEEM_NO: string;
  PREP_NO: string;
  postFIN23050Details: PostFIN23050DetailInput[];
}

@Injectable({
  providedIn: 'root'
})
export class Fin23050Service {
  apiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) { }

  /** 查詢未拋轉的核銷傳票清單 (呼叫 SP_FIN23050Get) */
  getFIN23050(body: GetFIN23050Request): Observable<ApiResponse<GetFIN23050Response[]>> {
    return this.http.post<ApiResponse<GetFIN23050Response[]>>(
      `${this.apiUrl}/FIN0000/APS1000/getFIN23050`,
      body
    );
  }

  /** 查詢核銷傳票清單明細 (呼叫 SP_FIN23050Query) */
  queryFIN23050(body: QueryFIN23050Request): Observable<ApiResponse<QueryFIN23050Response[]>> {
    return this.http.post<ApiResponse<QueryFIN23050Response[]>>(
      `${this.apiUrl}/FIN0000/APS1000/queryFIN23050`,
      body
    );
  }

  /** 預覽拋轉傳票明細(扁平化，一次可帶多筆核銷單號) (呼叫 SP_FIN23050Detail) */
  detailFIN23050(body: DetailFIN23050Request): Observable<ApiResponse<DetailFIN23050Response[]>> {
    return this.http.post<ApiResponse<DetailFIN23050Response[]>>(
      `${this.apiUrl}/FIN0000/APS1000/detailFIN23050`,
      body
    );
  }

  /** 確定拋轉 (呼叫 SP_FIN23050Posting) */
  postFIN23050(body: PostFIN23050Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/FIN0000/APS1000/postFIN23050`,
      body
    );
  }
}
