import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TLS31070Request {
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
}

export interface TLS31070DetailRequest {
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
  paper_type: string;
  TaxType: string;
  IsRece_Yn: string;
  pageIndex: number;
  pageSize: number;
  PreSale?: boolean;
  ConsumerNum?: boolean;
}

export interface TLS31070Item {
  paper_type: string;
  paper_type_desc: string;
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
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

export interface TLS31070DetailItem {
  tlt_no: string;
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
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

export interface TLS31070TotalData {
  TotalBudget: number;
  TotalSales: number;
  AvgAchievementRate: number;
  TotalTxnCount: number;
  AvgTicket: number;
  TotalSpace: number;
  AvgPSM: number;
  AvgMonthlyPayment?: number;
  TotalTempCounterSales: number;
  TotalMonthlyBudget: number;
  TotalMonthlySales: number;
  AvgCompletionRate: number;
  AvgBudgetRate?: number;
  AvgPerformanceRate?: number;
  AvgTempCounterSalesRate?: number;
  AvgTempCounterAmtRate?: number;
  TotalPrePerformance?: number;
  TotalConsumerNum?: number;
  TotalConsumerOrder?: number;
}

export interface TLS31070PrintRequest extends TLS31070Request {
  IsMerge: boolean;
  IsExcel: boolean;
}

export interface TLS31070PrintDetailRequest extends TLS31070DetailRequest {
  IsMerge: boolean;
  IsExcel: boolean;
}

export interface TLS31070Response {
  Data: TLS31070Item[];
  TotalData: TLS31070TotalData;
  TotalCount: number;
  Message?: string;
}

export interface TLS31070DetailResponse {
  Data: TLS31070DetailItem[];
  TotalData: TLS31070TotalData;
  TotalCount: number;
  Message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31070Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢各營業型態之營業報表
  queryTLS31070(body: TLS31070Request): Observable<TLS31070Response> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31070`, body).pipe(
      map(res => {
        return {
          Data: res.Data?.Data ?? [],
          TotalCount: res.TotalCount ?? 0,
          Message: res.Message,
          TotalData: res.Data?.TotalData
        };
      })
    );
  }

  // 查詢單營業型態展開之營業報表
  queryTLS31070Detail(body: TLS31070DetailRequest): Observable<TLS31070DetailResponse> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31070Detail`, body).pipe(
      map(res => {
        return {
          Data: res.Data?.Data ?? [],
          TotalCount: res.TotalCount ?? 0,
          Message: res.Message,
          TotalData: res.Data?.TotalData,
        };
      })
    );
  }

  // 產出各營業型態之營業報表
  printTLS31070(body: TLS31070PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31070`, body);
  }

  // 產出單營業型態展開之營業報表
  printTLS31070Detail(body: TLS31070PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31070Detail`, body);
  }
}