import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 暫付款核銷查詢 Request */
export interface QueryFIN23040Request {
  Type: number; // 1=已核銷清單, 2=未核銷預支單, 3=依單號查金額
  REDEEM_NO?: string | null;
  PREP_NO?: string | null;
  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: number }[];
}

/** Type = 1：查詢已核銷清單 Response */
export interface QueryFIN23040Type1Response {
  id: number;
  yn: string;        // 是否可刪除或修改 (Y/N)
  redeeM_NO: string;  // 核銷單號
  preP_NO: string;   // 預支單號
  redeemAmt: number; // 核銷金額
}

/** Type = 2：查詢所有尚未核銷的預支單號 Response */
export interface QueryFIN23040Type2Response {
  id: number;
  preP_NO: string;
  veN_No: string;
  veN_Name: string;
  appY_Date: string;
  closE_Date: string;
  paY_Date: string;
  preP_Amt: number;
  redeemedAmt: number;
  balanceAmt: number;
}

/** Type = 3：依預支單號查詢預支金額 Response */
export interface QueryFIN23040Type3Response {
  preP_Amt: number;
}

// 聯集型別，方便組件端相容
export type QueryFIN23040Response = QueryFIN23040Type1Response | QueryFIN23040Type2Response | QueryFIN23040Type3Response;
/** 刪除/作廢暫付款核銷 Request */
export interface VoidFIN23040Request {
  stO_No: string;     // 分店編號 (對齊前端 Token 常規或資料欄位)
  preP_NO: string;    // 預支單號
  redeeM_NO: string;   // 核銷單號
}
@Injectable({
  providedIn: 'root'
})
export class Fin23040Service {
  apiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) { }

  /** 查詢暫付款核銷相關清單 (呼叫 SP_FIN23040Query) */
  queryFIN23040(body: QueryFIN23040Request): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/FIN0000/APS1000/queryFIN23040`,
      body
    );
  }
  /** 刪除/作廢暫付款核銷 (呼叫 SP_FIN23040Void) */
  voidFIN23040(body: VoidFIN23040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/FIN0000/APS1000/voidFIN23040`,
      body
    );
  }
}