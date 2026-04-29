import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FIN29030Data {
  TotalCount: number;
  TotalPage: number;
  PageIndex: number;
  PageSize: number;
  RowType: number; // 0=明細, 1=小計
  SummaryText: string; // 小計文字
  PAM_No: string; // 付款編號
  CHK_No: string; // 支票號碼
  TicketStatusName: string; // 票據狀態
  PaymentBank: string; // 付款銀行
  IssueDate: Date; // 開票日期
  ExpireDate: Date; // 到期日
  VenNo: string; // 廠客代號
  VenName: string; // 廠客名稱
  TicketAmt: number // 票面金額/小計金額
}

export interface FIN29030Response {
  Status: string;
  Data: FIN29030Data[];
  Error: {
    Code: string;
    Message: string;
    Details: string;
  },
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class Fin29030Service {
  // 開票明細表
  apiUrl: string = environment.ApiUrl + '/FIN0000/APS1000';
  constructor(private http: HttpClient) { }
  // 查詢 開票明細表
  queryFIN29030(body: any): Observable<FIN29030Response> {
    return this.http.post<FIN29030Response>(`${this.apiUrl}/queryFIN29030`, body);
  }

  // 匯出 開票明細表 PDF
  exportPDFFIN29030(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFFIN29030`, body, { responseType: 'blob' });
  }

  // 匯出 開票明細表 Excel
  exportExcelFIN29030(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelFIN29030`, body, { responseType: 'blob' });
  }
}
