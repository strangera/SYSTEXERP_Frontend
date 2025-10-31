import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢分類帳彙總報表 Request
export interface QueryFIN55060Request extends BaseQueryRequest {
  TXN_BDATE: string;           // 日期(起)
  TXN_EDATE: string;           // 日期(迄)
  org_idList?: string[];       // 部門
  ProjectNoList?: string[];    // 活動
  AccNoList?: string[];        // 科目代號
  DetailNoList?: string[];     // 廠商代號
}

// 分類帳彙總報表 Response 資料結構
export interface FIN55060Detail {
  AccNo: string;               // 科目代號
  AccCName: string;            // 科目名稱
  DetailNo: string;            // 廠商代號
  ORG_ID: string;              // 部門
  Org_Name: string;            // 部門名稱
  ProjectNo: string;           // 活動
  Debit_Amt: number;           // 借方金額
  Credit_Amt: number;          // 貸方金額
  OpeningBal: number;          // 餘額
}

@Injectable({
  providedIn: 'root'
})
export class FIN55060Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  // 查詢分類帳彙總報表
  queryFIN55060(req: QueryFIN55060Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN55060`, req);
  }
}