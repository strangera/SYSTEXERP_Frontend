import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TLS31020Total } from './tls31020.service';

export interface TLS31060Request {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
  TLT_NO: string[];
  tlt_building: string[];
  tlt_floor: string[];
  area_no: string[];
  bus_type: string[];
  bus_class: string[][];
  bus_sclass: string[][];
  tlt_kind: string[];
  tlt_term_type: string[];
  org_id: string[];
  TaxType: string;
  IsRece_Yn: string;
  // --- 動態欄位重構點 ---
  PreSale?: boolean;
  ConsumerNum?: boolean;
}

export interface TLS31060PrintRequest extends TLS31060Request {
  IsMerge: boolean;
  IsExcel: boolean;
}

// 單一組織展開 Request
export interface TLS31060DetailRequest {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
  TLT_NO: string[];
  tlt_building: string[];
  tlt_floor: string[];
  area_no: string[];
  bus_type: string[];
  bus_class: string[][];
  bus_sclass: string[][];
  tlt_kind: string[];
  tlt_term_type: string[];
  org_id: string; // 單組織
  TaxType: string;
  IsRece_Yn: string;
  pageSize?: number;
  // --- 動態欄位重構點 ---
  PreSale?: boolean;
  ConsumerNum?: boolean;
}

export interface TLS31060PrintDetailRequest extends TLS31060DetailRequest {
  IsMerge: boolean;
  IsExcel: boolean;
}

export interface TLS31060Item {
  org_id: string;
  org_name: string;
  budget: number;
  AVN_TotSaleAmt: number;
  AchievementRate: number;
  BudgetRate: number;
  PerformanceRate: number;
  TxnCount: number;
  AvgTicket: number;
  tlt_space: number;
  MonthlyPSM: number;
  MonthlyPayment: number;
  TempCounterSaleAmt: number;
  TempCounterSalesRate: number;
  TempCounterAmtRate: number;
  MonthlyBudgetTotal: number;
  MonthlySalesTotal: number;
  CompletionRate: number;
  // --- 動態欄位重構點 ---
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

export interface TLS31060DetailItem {
  building_desc: string;
  org_name: string;
  tlt_kind: string;
  tlt_no: string;
  location_no: string;
  tlt_name: string;
  budget: number;
  AVN_TotSaleAmt: number;
  AchievementRate: number;
  BudgetRate: number;
  PerformanceRate: number;
  TxnCount: number;
  AvgTicket: number;
  tlt_space: number;
  MonthlyPSM: number;
  MonthlyPayment: number;
  MonthlyBudgetTotal: number;
  MonthlySalesTotal: number;
  CompletionRate: number;
  // --- 動態欄位重構點 ---
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

export interface TLS31060Response {
  Data: TLS31060Item[];
  TotalData: TLS31020Total;
}

export interface TLS31060DetailResponse {
  QueryData: TLS31060DetailItem[];
  TotalData: TLS31020Total;
}

export interface TLS31060QueryResult {
  Data: TLS31060Item[];
  TotalCount: number;
  Message: string;
  TotalData: TLS31020Total;
}

export interface TLS31060DetailQueryResult {
  Data: TLS31060DetailItem[];
  TotalCount: number;
  Message: string;
  TotalData: TLS31020Total;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31060Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢各組織之營業報表
  queryTLS31060(body: TLS31060Request): Observable<TLS31060QueryResult> {
    return this.http.post<ApiResponse<TLS31060Response>>(`${this.apiUrl}/queryTLS31060`, body).pipe(
      map(res => ({
        Data: res.Data?.Data ?? [],
        TotalCount: res.TotalCount,
        Message: res.Message,
        TotalData: res.Data?.TotalData
      } as TLS31060QueryResult))
    );
  }

  // 查詢單組織展開之營業報表
  queryTLS31060Detail(body: TLS31060DetailRequest): Observable<TLS31060DetailQueryResult> {
    return this.http.post<ApiResponse<TLS31060DetailResponse>>(`${this.apiUrl}/queryTLS31060Detail`, body).pipe(
      map(res => ({
        Data: res.Data?.QueryData ?? [],
        TotalCount: res.TotalCount,
        Message: res.Message,
        TotalData: res.Data?.TotalData,
      } as TLS31060DetailQueryResult))
    );
  }

  // 產出各組織之營業報表
  printTLS31060(body: TLS31060PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31060`, body);
  }

  // 產出單組織展開之營業報表
  printTLS31060Detail(body: TLS31060PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31060Detail`, body);
  }
}