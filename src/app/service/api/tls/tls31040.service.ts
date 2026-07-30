import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TLS31020Total } from './tls31020.service';

export interface TLS31040Request {
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
  PreSale?: boolean;
  ConsumerNum?: boolean;
  pageSize?: number;
  pageIndex?: number;
}

export interface TLS31040Item {
  tlt_kind: string;
  tlt_kindName: string;
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
  // --- 動態欄位 ---
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

export interface TLS31040PrintRequest extends TLS31040Request {
  IsMerge: boolean;
  IsExcel: boolean;
}

// 單一櫃別明細 Request
export interface TLS31040DetailRequest {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
  TLT_NO: string[];
  tlt_building: string[];
  tlt_floor: string[];
  area_no: string[];
  bus_type: string[];
  bus_class: string[][];
  bus_sclass: string[][];
  tlt_kind: string;
  tlt_term_type: string[];
  org_id: string[];
  TaxType: string;
  IsRece_Yn: string;
  PreSale?: boolean;
  ConsumerNum?: boolean;
  pageSize?: number;
  pageIndex?: number;
}

export interface TLS31040PrintDetailRequest extends TLS31040DetailRequest {
  IsMerge: boolean;
  IsExcel: boolean;
}

// 單一櫃別明細 Item
export interface TLS31040DetailItem {
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
  // --- 明細動態欄位 ---
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

export interface TLS31040Response {
  Data: TLS31040Item[];
  TotalData: TLS31020Total;
}

export interface TLS31040DetailResponse {
  Data: TLS31040DetailItem[];
  TotalData: TLS31020Total;
}

@Injectable({
  providedIn: 'root',
})
export class Tls31040Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢各櫃別之營業報表
  queryTLS31040(body: TLS31040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31040`, body).pipe(
      map((res) => {
        return {
          Data: res.Data?.Data,
          TotalCount: res.TotalCount,
          Message: res.Message,
          TotalData: res.Data?.TotalData,
        };
      })
    );
  }

  // 查詢單櫃別展開之營業報表
  queryTLS31040Detail(body: TLS31040DetailRequest): Observable<any> {
    return this.http
      .post<ApiResponse<TLS31040DetailResponse>>(`${this.apiUrl}/queryTLS31040Detail`, body)
      .pipe(
        map((res) => {
          return {
            Data: res.Data?.Data,
            TotalCount: res.TotalCount,
            Message: res.Message,
            TotalData: res.Data?.TotalData,
          };
        })
      );
  }

  // 產出各櫃別之營業報表
  printTLS31040(body: TLS31040PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31040`, body);
  }

  // 產出單櫃別展開之營業報表
  printTLS31040Detail(body: TLS31040PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31040Detail`, body);
  }
}