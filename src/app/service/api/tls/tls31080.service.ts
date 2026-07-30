import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TLS31080Request {
  TxnDate: string;
  TimeMode: string;
  TimeFromHH?: number | null;
  TimeToHH?: number | null;
  StoreNos?: string;
  Floors?: string;
  Areas?: string;
  CatLNos?: string;
  CatMNos?: string;
  CatSNos?: string;
  CabinetKinds?: string;
  OrgIds?: string;
  CounterNos?: string;
  ChargeTypes?: string;
  Buildings?: string;
  IncludeTax?: boolean;
  TaxType?: number; // 專供 Detail API 映射 (1=含稅, 0=未稅)
  BizInvFlag?: string;

  // 動態顯示開關
  PreSale?: boolean;
  ConsumerNum?: boolean;

  pageIndex?: number;
  pageSize?: number;
}

export interface TLS31080Response {
  floor_desc: string;
  TimeType: string;
  H00: number; H01: number; H02: number; H03: number; H04: number; H05: number;
  H06: number; H07: number; H08: number; H09: number; H10: number; H11: number;
  H12: number; H13: number; H14: number; H15: number; H16: number; H17: number;
  H18: number; H19: number; H20: number; H21: number; H22: number; H23: number;
  Reentry: number;
  PresaleCheckout: number;
  PrePerformance?: number; // 預售業績
  ConsumerNum?: number;    // 消費人數
  ConsumerOrder?: number;  // 消費客單
  Subtotal: number;
  TotalCount: number;
  TotalPage?: number;
}

export interface TLS31080DetailResponse {
  tlt_no: string;
  tlt_name: string;
  floor_desc: string;
  TimeType: string;
  H00: number; H01: number; H02: number; H03: number; H04: number; H05: number;
  H06: number; H07: number; H08: number; H09: number; H10: number; H11: number;
  H12: number; H13: number; H14: number; H15: number; H16: number; H17: number;
  H18: number; H19: number; H20: number; H21: number; H22: number; H23: number;
  ReentryAmt: number;
  PresaleCheckoutAmt: number;
  PrePerformance?: number; // 預售業績
  ConsumerNum?: number;    // 消費人數
  ConsumerOrder?: number;  // 消費客單
  SubTotal: number;
}

/// API 泛型回傳結構
export interface ApiResult<TData, TTotal> {
  Data: TData;
  TotalData: TTotal;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31080Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢各時段之營業報表 (主報表)
  queryTLS31080(body: TLS31080Request): Observable<any> {
    return this.http.post<ApiResult<TLS31080Response[], any>>(`${this.apiUrl}/queryTLS31080`, body);
  }

  // 匯出各時段之營業報表 (EXCEL)
  exportTLS31080(body: TLS31080Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS31080`, body, { responseType: 'blob' });
  }

  // 匯出各時段之營業報表 (PDF)
  exportTLS31080PDF(body: TLS31080Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS31080PDF`, body, { responseType: 'blob' });
  }

  // 查詢時段之營業報表 (明細)
  queryTLS31080Detail(body: TLS31080Request): Observable<any> {
    return this.http.post<ApiResult<TLS31080DetailResponse[], any>>(`${this.apiUrl}/queryTLS31080Detail`, body);
  }
}