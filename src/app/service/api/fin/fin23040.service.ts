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

/**
 * Type = 1：查詢已核銷清單 Response
 * 修復重點：後端 Program.cs 對 AddJsonOptions 設定 `PropertyNamingPolicy = null`，
 * 代表 API 回傳的 JSON key 完全保留 C# 屬性原始大小寫(不會轉 camelCase)。
 * 這裡欄位命名務必逐一對照 FIN23040Response.cs 的 C# 屬性名稱(大小寫全部照抄)，
 * 之前(本頁新建當天)誤植成假想的 camelCase 寫法，導致所有欄位實際上都讀不到值(undefined)。
 */
export interface QueryFIN23040Type1Response {
  ID: number;
  YN: string;        // 是否可刪除或修改 (Y/N)
  REDEEM_NO: string; // 核銷單號
  PREP_NO: string;   // 預支單號
  RedeemAmt: number; // 核銷金額
}

/** Type = 2：查詢所有尚未核銷的預支單號 Response */
export interface QueryFIN23040Type2Response {
  ID: number;
  PREP_NO: string;
  VEN_No: string;
  VEN_Name: string;
  APPY_Date: string;
  CLOSE_Date: string;
  PAY_Date: string;
  PREP_Amt: number;
  RedeemedAmt: number;
  BalanceAmt: number;
}

/** Type = 3：依預支單號查詢預支金額 Response */
export interface QueryFIN23040Type3Response {
  PREP_Amt: number;
}

// 聯集型別，方便組件端相容
export type QueryFIN23040Response = QueryFIN23040Type1Response | QueryFIN23040Type2Response | QueryFIN23040Type3Response;

/** 刪除/作廢暫付款核銷 Request */
export interface VoidFIN23040Request {
  STO_No: string;     // 分店編號
  PREP_NO: string;    // 預支單號
  REDEEM_NO: string;  // 核銷單號
}

/** 刪除/作廢暫付款核銷 Response */
export interface VoidFIN23040Response {
  Success: boolean;
  Message: string | null;
}

/** 核銷明細查詢 Request (對應 SP_FIN23040Detail) */
export interface DetailFIN23040Request {
  REDEEM_NO: string;
  PREP_NO: string;
}

/** 核銷明細查詢 Response (對應 SP_FIN23040Detail，一列對應一筆傳票分錄明細) */
export interface DetailFIN23040Response {
  ID: number;
  AccNo: string;
  AccCName: string;
  Remark: string;
  ACP_Type: string;
  PUR_VoucherType: string | null;
  PUR_GUINo: string | null;
  PUR_GUIDate: string | null;
  PUR_ExpGLDate: string;
  PUR_VenUniform: string | null;
  PUR_DirectType: string | null;
  PUR_Amt: number | null;
  PUR_TaxType: string;
  PUR_Net: number | null;
  PUR_Tax: number | null;
  ORG_ID: string | null;
  ProjectNo: string | null;
  ACCT_KEY: string | null;
  PUR_DiscNo: string | null;
  PUR_Type: string | null;
  PUR_Comb_Cnt: number | null;
}

/** 新增/修改暫付款核銷 Request (對應 SP_FIN23040Save) */
export interface SaveFIN23040Request {
  ActionMode: 'I' | 'U';
  STO_No: string;
  PREP_NO: string;
  REDEEM_NO?: string | null; // I 時傳 null；U 時必填傳入既有單號
  InvoiceList: FIN23040InvoiceItem[]; // 💡 改為多筆發票明細陣列 (對應後端 TVP)
}

/** 發票明細子項目 */
export interface FIN23040InvoiceItem {
  AccNo: string;
  PUR_Remark: string;
  ACP_Type: string;
  PUR_VoucherType?: string | null;
  PUR_GUINo?: string | null;
  PUR_GUIDate: string;
  PUR_ExpGLDate: string; // YYYYMM
  PUR_VenUniform?: string | null;
  PUR_DirectType?: string | null;
  PUR_Amt?: number | null;
  PUR_TaxType: string;
  PUR_Net: number;
  PUR_Tax?: number | null;
  ORG_ID?: string | null;
  ProjectNo?: string | null;
  ACCT_KEY?: string | null;
  PUR_DiscNo?: string | null;
  PUR_Type?: string | null;
  PUR_Comb_Cnt?: number | null;
}

/** 新增/修改暫付款核銷 Response (對應 SP_FIN23040Save OUTPUT) */
export interface SaveFIN23040Response {
  Success: boolean;
  REDEEM_NO: string | null;
  Message: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class Fin23040Service {
  apiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) { }

  /** 查詢暫付款核銷相關清單 (呼叫 SP_FIN23040Query，依 Type 回傳不同結構，由呼叫端依 Type narrow 型別) */
  queryFIN23040(body: QueryFIN23040Request): Observable<ApiResponse<QueryFIN23040Response[]>> {
    return this.http.post<ApiResponse<QueryFIN23040Response[]>>(
      `${this.apiUrl}/FIN0000/APS1000/queryFIN23040`,
      body
    );
  }

  /** 查詢暫付款核銷明細 (呼叫 SP_FIN23040Detail) */
  detailFIN23040(body: DetailFIN23040Request): Observable<ApiResponse<DetailFIN23040Response[]>> {
    return this.http.post<ApiResponse<DetailFIN23040Response[]>>(
      `${this.apiUrl}/FIN0000/APS1000/detailFIN23040`,
      body
    );
  }

  /** 新增/修改暫付款核銷 (呼叫 SP_FIN23040Save) */
  saveFIN23040(body: SaveFIN23040Request): Observable<ApiResponse<SaveFIN23040Response>> {
    return this.http.post<ApiResponse<SaveFIN23040Response>>(
      `${this.apiUrl}/FIN0000/APS1000/saveFIN23040`,
      body
    );
  }

  /** 刪除/作廢暫付款核銷 (呼叫 SP_FIN23040Void) */
  voidFIN23040(body: VoidFIN23040Request): Observable<ApiResponse<VoidFIN23040Response>> {
    return this.http.post<ApiResponse<VoidFIN23040Response>>(
      `${this.apiUrl}/FIN0000/APS1000/voidFIN23040`,
      body
    );
  }
}