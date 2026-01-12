import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢產生電匯付款資料 Request
export interface QueryFIN25010Request extends BaseQueryRequest {
  PAM_No?: string;           // 匯款來源單號
  D_Date_b?: string;         // 建立日期(起)
  D_Date_e?: string;         // 建立日期(迄)
  PTA_Date_b?: string;       // 收/付款日(起)
  PTA_Date_e?: string;       // 收/付款日(迄)
  Remit_Status?: string;     // 是否形成電匯(Y/N)
  WSLIP_NO?: string;         // 匯款單號(電匯單號)
  payday_Counts?: string;    // 付款天數
}

// 產生電匯付款資料 Response
export interface FIN25010Data {
  ID: number;                // 主鍵ID
  PAM_No?: string;           // 匯款來源單號
  D_Date?: string;           // 建立日期
  PTA_Date?: string;         // 付款日期
  Remit_Status?: string;     // 是否形成電匯(Y/N)
  WSLIP_NO?: string;         // 匯款單號
}

// 查詢下拉選單 Request
export interface QueryDropFIN25010Request extends BaseQueryRequest {
  PTA_Date_b?: string;  // 收/付款日(起)
  PTA_Date_e?: string;  // 收/付款日(迄)
  Remit_Status?: string;         // 是否形成電匯(Y/N)
  PAM_No?: string;               // 匯款來源單號
}

// 查詢下拉選單 Response
export interface QueryDropFIN25010Response {
  PAM_No?: string;               // 匯款來源單號
  D_Date?: string;               // 建立日期
  Remit_Status?: string;         // 是否形成電匯(Y/N)
}

// 查詢產生電匯付款資料 新增查詢Request
export interface QueryAddFIN25010Request extends BaseQueryRequest {
  ACP_ExpectPayDate?: string;  // 收/付款日
  ven_no_b?: string;           // 廠客代號(起)
  ven_no_e?: string;           // 廠客代號(迄)
  ACP_No?: string;             // 應付帳款ID
  Voucher_Kind?: string;     // 傳票型態
  VEN_PayType?: string;       // 付款方式
}

// 查詢產生電匯付款資料 新增查詢Response
export interface QueryAddFIN25010Response {
  ID: number;
  acp_no?: string;
  ven_no?: string;
  ven_name?: string;
  IN_TYPE?: string;
  ACP_Amt?: number;
  acp_DATE?: string;
  PTA_Date?: string;
  NoteDesc?: string;
  ACCNO?: string;
  ACP_STATUS?: string;
  Voucher_Kind?: string;
  VEN_PayType?: string;
  ORG_ID?: string;
  ACP_YYYYMM?: string;
  ACP_TERMNO?: string;
  Remit_Status?: string;
  RMT_TYPE?: string;
}

// 新增 APS3009 資料表 Request
export interface InsertFIN25010Request {
  D_Date?: string;            // 建立日期
  APS3009?: APS3009Item[];    // APS3009 資料表項目
}

export interface APS3009Item {
  ID: number;                // ID
  RMT_TYPE?: string;          // 應收應付別(1=應付, 2=應收)
  VEN_No?: string;            // 廠客代號
  APAR_No?: string;           // 應收/應付單號
  ACP_YYYYMM?: string;        // 應付帳款年月
  acp_termno?: number;        // 帳款帳次
  ACP_Amt?: number;           // 帳款金額
  PTA_Date?: string;          // 沖帳日期
  NoteDesc?: string;          // 摘要(傳票上的摘要)
  IN_TYPE?: string;           // 資料來源別(1=應付, 2=應收, 3=保留款)
  Remit_Status?: string;      // 是否產生電匯(Y/N) (0=作廢N 2=建立Y)
}

@Injectable({
  providedIn: 'root'
})
export class FIN25010Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN25010(req: QueryFIN25010Request): Observable<BaseQueryResponse<FIN25010Data>> {
    return this.http.post<BaseQueryResponse<FIN25010Data>>(`${this.apiUrl}/queryFIN25010`, req);
  }

  // 查詢下拉選單
  queryDropFIN25010(req: QueryDropFIN25010Request): Observable<BaseQueryResponse<QueryDropFIN25010Response>> {
    return this.http.post<BaseQueryResponse<QueryDropFIN25010Response>>(`${this.apiUrl}/query_dropFIN25010`, req);
  }

  // 新增頁面-查詢產生電匯付款資料
  queryAddFIN25010(req: QueryAddFIN25010Request): Observable<BaseQueryResponse<QueryAddFIN25010Response>> {
    return this.http.post<BaseQueryResponse<QueryAddFIN25010Response>>(`${this.apiUrl}/query_addFIN25010`, req);
  }

  // 新增 APS3009 資料表
  insertFIN25010(data: InsertFIN25010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN25010`, data);
  }
}