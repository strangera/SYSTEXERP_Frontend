import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢分類帳 Request
export interface QueryFIN55050Request extends BaseQueryRequest {
  DateFrom: string;           // 日期(起)
  DateTo: string;             // 日期(迄)
  OrgIdList?: string[];        // 部門
  AccNoList?: string[];        // 科目代號
  VendorNoList?: string[];     // 廠商代號
  PTAFrom?: string;            // 立沖代號(起)
  PTATo?: string;              // 立沖代號(迄)
  TargetNoList?: string[];     // 對象別編號
  Notes?: string;              // 摘要
  VouTypeList?: string[];      // 傳票型態
  VouStatusList?: string[];    // 傳票狀態
  IsTarget: string;           // 是否為對象別(Y=是/N=否)
}

// 傳票 Response 資料結構
export interface FIN55050Detail {
  VouNo: string;               // 傳票號碼
  Ven_Name: string;            // 廠商代號/簡稱
  VouStatus: string;           // 傳票狀態
  ORG_ID: string;              // 部門
  Org_Name: string;            // 部門名稱
  ProjectNo: string;           // 活動
  PTA: string;                 // 立沖代號
  NoteDesc: string;            // 摘要
  AccAmt_D: number;            // 借方金額
  AccAmt_C: number;            // 貸方金額
  OpeningBal: number;          // 餘額
}

@Injectable({
  providedIn: 'root'
})
export class FIN55050Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  // 查詢分類帳
  queryFIN55050(req: QueryFIN55050Request): Observable<any> {
    return this.http.post<BaseQueryResponse<FIN55050Detail>>(`${this.apiUrl}/queryFIN55050`, req);
  }
}