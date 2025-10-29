import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢傳票 Request
export interface QueryFIN55050Request extends BaseQueryRequest {
  VOUDATE_Start?: string;      // 日期起
  VOUDATE_End?: string;        // 日期迄
  ORG_ID?: string;             // 部門
  ProjectNo?: string;          // 活動代碼
  AccNo?: string;              // 科目代號
  VOUNO?: string;              // 傳票號碼
  DetailNo?: string;           // 廠商代號
  PTA?: string;                // 立沖代號
  SubDetailNo?: string;        // 對象別編號
  AccountKey?: string;         // 對帳KEY
  NoteDesc?: string;           // 摘要
  VOUCHER_KIND?: string;       // 傳票型態
  PostFlag?: string;           // 傳票狀態
}

// 傳票 Response 資料結構
export interface FIN55050Data {
  ID: number;                  // 主鍵ID
  VOUNO?: string;              // 傳票號碼
  DETAILNO?: string;           // 廠商代號/簡稱
  POSTFLAG?: string;           // 狀態
  ORG_ID?: string;             // 部門
  ORG_NAME?: string;           // 部門名稱
  ProjectNo?: string;          // 活動
  PTA?: string;                // 立沖代號
  NoteDesc?: string;           // 摘要
  D_AMT?: number;              // 借方金額
  C_AMT?: number;              // 貸方金額
  Balance?: number;            // 餘額
  CRT_Date?: string;           // 建立日期
  CRT_USR_No?: string;         // 建立人員
  CRT_USR_Name?: string;       // 建立人員名稱
  UPD_Date?: string;           // 變更日期
  UPD_USR_No?: string;         // 變更人員
  UPD_USR_Name?: string;       // 變更人員名稱
}

@Injectable({
  providedIn: 'root'
})
export class FIN55050Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN5000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN55050(req: QueryFIN55050Request): Observable<BaseQueryResponse<FIN55050Data>> {
    return this.http.post<BaseQueryResponse<FIN55050Data>>(`${this.apiUrl}/queryFIN55050`, req);
  }
}