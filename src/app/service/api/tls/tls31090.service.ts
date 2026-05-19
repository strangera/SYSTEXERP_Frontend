import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TLS31090Request {
  TxnDate: string;
  TimeMode: string;
  TimeFromHH: number;
  TimeToHH: number;
  StoreNos: string;
  Floors: string;
  Areas: string;
  CatLNos: string[];
  CatMNos: string[][];
  CatSNos: string[][];
  CabinetKinds: string;
  OrgIds: string;
  CounterNos: string;
  ChargeTypes: string;
  Buildings: string;
  IncludeTax: boolean;
  BizInvFlag: string;
}

export interface TLS31090Response {
  BusTypeName: string; // 業種名稱
  TimeType: string;
  H08: number;
  H09: number;
  H10: number;
  H11: number;
  H12: number;
  H13: number;
  H14: number;
  H15: number;
  H16: number;
  H17: number;
  H18: number;
  H19: number;
  H20: number;
  H21: number;
  H22: number;
  H23: number;
  Reentry: number;
  PresaleCheckout: number; // 預售結帳
  Subtotal: number;
  AVN_PreOrderAmt: number; // 預售業績
}

export interface TLS31090DetailResponse {
  tlt_no: string,
  tlt_name: string,
  floor_desc: string;
  TimeType: string;
  H08: number;
  H09: number;
  H10: number;
  H11: number;
  H12: number;
  H13: number;
  H14: number;
  H15: number;
  H16: number;
  H17: number;
  H18: number;
  H19: number;
  H20: number;
  H21: number;
  H22: number;
  H23: number;
  ReentryAmt: number;
  PresaleCheckoutAmt: number; // 預售結帳
  SubTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31090Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }

  // 查詢各各時段之大分類營業報表
  queryTLS31090(body: TLS31090Request): Observable<any> {
    return this.http.post<TLS31090Response>(`${this.apiUrl}/queryTLS31090`, body);
  }


  // 匯出各各時段之大分類營業報表 (EXCEL)
  exportTLS31090(body: TLS31090Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS31090`, body, {
      responseType: 'blob'
    });
  }

  // 匯出各各時段之大分類營業報表 (PDF)
  exportTLS31090PDF(body: TLS31090Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS31090PDF`, body, {
      responseType: 'blob'
    });
  }

  // 查詢各各時段之大分類營業報表 明細
  queryTLS31090Detail(body: TLS31090Request): Observable<any> {
    return this.http.post<TLS31090DetailResponse>(`${this.apiUrl}/queryTLS31090Detail`, body);
  }
}
