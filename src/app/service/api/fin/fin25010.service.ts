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

// 查詢產生電匯付款資料 新增查詢Request
export interface QueryAddFIN25010Request extends BaseQueryRequest {
  ACP_ExpectPayDate?: string;  // 收/付款日
  ven_no_b?: string;           // 廠客代號(起)
  ven_no_e?: string;           // 廠客代號(迄)
  ACP_No?: string;             // 應付帳款ID
  IN_TYPE?: string;            // 傳票型態
  RMT_TYPE?: string;           // 付款方式(1:電匯,2:開票,3:現金)
}

// 查詢產生電匯付款資料 新增查詢Response
export interface QueryAddFIN25010Response {
  ID: number;                  // ID
  acp_no?: string;             // 應收/付帳款編號 (單據別+YYYYMMDD+XXXX)
  ven_no?: string;             // 廠客代號
  ACP_Amt?: string;            // 付款金額
  acp_DATE?: string;           // 立帳日期
  PTA_Date?: string;           // 預計付款日期 ACP_ExpectPayDate
  NoteDesc?: string;           // 摘要(傳票上的摘要)
  ACCNO?: string;              // 會計科目
  ACP_STATUS?: string;         // 應付帳款狀態(0=作廢 2=建立)
  IN_TYPE?: string;            // 資料來源別
  RMT_TYPE?: string;           // 付款方式(1:電匯,2:開票,3:現金)
  ORG_ID?: string;             // 組織代碼(SYS3100)
  ACP_YYYYMM?: string;         // 應付帳款年月
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
  acp_termno?: string;        // 帳款帳次
  ACP_Amt?: string;           // 帳款金額
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

  // 新增頁面-查詢產生電匯付款資料
  queryAddFIN25010(req: QueryAddFIN25010Request): Observable<BaseQueryResponse<QueryAddFIN25010Response>> {
    return this.http.post<BaseQueryResponse<QueryAddFIN25010Response>>(`${this.apiUrl}/query_addFIN25010`, req);
  }

  // 新增 APS3009 資料表
  insertFIN25010(data: InsertFIN25010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN25010`, data);
  }
}