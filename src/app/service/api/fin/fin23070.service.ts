import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// FIN23070-暫付款核銷報表 查詢結果主檔列
export interface Fin23070Data {
  RowNum: number | null;      // 序號
  PrepNo: string | null;      // 預支單號
  VenNo: string | null;       // 廠商/員工代號
  VenName: string | null;     // 廠商/員工名稱
  ApplyDate: string | null;   // 申請日期
  PlanCloseDate: string | null; // 預計核銷日
  PlanPayDate: string | null; // 預計付款日
  PrepAmt: number | null;     // 預支金額
  PostedAmt: number | null;   // 已拋轉核銷金額
  UnpostedAmt: number | null; // 未拋轉核銷金額
  DiffAmt: number | null;     // 差額
  CloseStatus: string | null; // 結案狀態（Y=結案 N=未結案）
}

// FIN23070-暫付款核銷報表 核銷明細列
export interface Fin23070DetailData extends Fin23070Data {
  RedeemNo: string | null;   // 核銷單號
  VouNo: string | null;      // 傳票號碼
  RedeemAmt: number | null;  // 核銷金額
  ActCloseDt: string | null; // 實際核銷日期
}

export interface FIN23070Response {
  Status: string;
  Data: {
    QueryData: Fin23070Data[];
    DetailList: Fin23070DetailData[];
    TotalCount: number;
    TotalPage: number;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

@Injectable({ providedIn: 'root' })
export class FIN23070Service {
  // FIN23070-暫付款核銷報表
  apiUrl: string = environment.ApiUrl + '/FIN0000/APS1000';
  constructor(private http: HttpClient) { }

  // 查詢 暫付款核銷報表
  queryFIN23070(body: any): Observable<FIN23070Response> {
    return this.http.post<FIN23070Response>(`${this.apiUrl}/queryFIN23070`, body);
  }

  // 匯出 暫付款核銷報表 PDF
  exportPDFFIN23070(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFFIN23070`, body, { responseType: 'blob' });
  }

  // 匯出 暫付款核銷報表 Excel
  exportExcelFIN23070(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelFIN23070`, body, { responseType: 'blob' });
  }
}
