import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TLS31050Request {
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
  pageIndex?: number;
  pageSize?: number;
  // --- 動態欄位 ---
  PreSale?: boolean;
  ConsumerNum?: boolean;
}

export interface TLS31050PrintRequest extends TLS31050Request {
  IsMerge: boolean;
  IsExcel: boolean;
}

export interface TLS31050Item {
  tlt_term_type: string;
  tlt_term_desc: string;
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
  PreOrderSaleAmt?: number;
  // --- 動態欄位 ---
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

// 單一抽成別明細 Request
export interface TLS31050DetailRequest {
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
  tlt_term_type: string; // 展開單一抽成別
  org_id: string[];
  TaxType: string;
  IsRece_Yn: string;
  pageIndex: number;
  pageSize: number;
  // --- 動態欄位 ---
  PreSale?: boolean;
  ConsumerNum?: boolean;
}

export interface TLS31050PrintDetailRequest extends TLS31050DetailRequest {
  IsMerge: boolean;
  IsExcel: boolean;
}

export interface TLS31050DetailItem {
  building_desc: string;
  org_name: string;
  tlt_kind: string;
  tlt_no: string;
  location_no: string;
  tlt_name: string;
  budget: number;
  AVN_TotSaleAmt: number;
  AchievementRate: number;
  NormalSales: number;
  SpecialSales: number;
  Discount95Sales: number;
  Discount90Sales: number;
  Discount80Sales: number;
  Discount70Sales: number;
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
  // --- 動態欄位 ---
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

export interface TLS31050Total {
  TotalBudget: number;
  TotalSales: number;
  AvgAchievementRate: number;
  AvgBudgetRate: number;
  AvgPerformanceRate: number;
  AvgTempCounterSalesRate: number;
  AvgTempCounterAmtRate: number;
  TotalTxnCount: number;
  AvgTicket: number;
  TotalSpace: number;
  AvgPSM: number;
  AvgMonthlyPayment: number;
  TotalTempCounterSales: number;
  TotalMonthlyBudget: number;
  TotalMonthlySales: number;
  AvgCompletionRate: number;
  TotalPreOrderSaleAmt?: number;
  // --- 動態欄位 ---
  TotalPrePerformance?: number;
  TotalConsumerNum?: number;
  TotalConsumerOrder?: number;
}

export interface footer31050Total {
  budget?: number;
  AVN_TotSaleAmt?: number;
  AchievementRate?: number;
  BudgetRate?: number;
  PerformanceRate?: number;
  TxnCount?: number;
  AvgTicket?: number;
  tlt_space?: number;
  MonthlyPSM?: number;
  MonthlyPayment?: number;
  TempCounterSaleAmt?: number;
  TempCounterSalesRate?: number;
  TempCounterAmtRate?: number;
  MonthlyBudgetTotal?: number;
  MonthlySalesTotal?: number;
  CompletionRate?: number;
  PreOrderSaleAmt?: number;
  // --- 動態欄位 ---
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

export interface TLS31050Response {
  QueryData: TLS31050Item[];
  TotalData: TLS31050Total;
}

export interface TLS31050DetailResponse {
  QueryData: TLS31050DetailItem[];
  TotalData: TLS31050Total;
}

@Injectable({
  providedIn: 'root',
})
export class Tls31050Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢各抽成別之營業報表
  queryTLS31050(body: TLS31050Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31050`, body).pipe(
      map((res) => {
        return {
          Data: res.Data?.QueryData,
          TotalCount: res.TotalCount,
          Message: res.Message,
          TotalData: res.Data?.TotalData,
        };
      })
    );
  }

  // 查詢單抽成別展開之營業報表
  queryTLS31050Detail(body: TLS31050DetailRequest): Observable<any> {
    return this.http.post<ApiResponse<TLS31050DetailResponse>>(`${this.apiUrl}/queryTLS31050Detail`, body).pipe(
      map((res) => {
        return {
          Data: res.Data?.QueryData,
          TotalCount: res.TotalCount,
          Message: res.Message,
          TotalData: res.Data?.TotalData,
        };
      })
    );
  }

  // 產出各抽成別之營業報表
  printTLS31050(body: TLS31050PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31050`, body);
  }

  // 產出單抽成別展開之營業報表
  printTLS31050Detail(body: TLS31050PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31050Detail`, body);
  }
}