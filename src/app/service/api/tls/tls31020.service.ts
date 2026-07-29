import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TLS31020Request {
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

export interface TLS31020PrintRequest extends TLS31020Request {
  "IsMerge": boolean,
  "IsExcel": boolean
}

export interface TLS31020DetailRequest {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
  TLT_NO: string[]
  tlt_building: string[]
  tlt_floor: string;
  area_no: string[]
  bus_type: string[]
  bus_class: string[][]
  bus_sclass: string[][]
  tlt_kind: string[]
  tlt_term_type: string[]
  org_id: string[]
  TaxType: string
  IsRece_Yn: string
  pageSize?: number
  PreSale?: boolean;
  ConsumerNum?: boolean;
}

export interface TLS31020DetialPrintRequest extends TLS31020DetailRequest {
  "IsMerge": boolean,
  "IsExcel": boolean
}

export interface TLS31020Item {
  tlt_floor: string;
  floor_desc: string;

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

export interface TLS31020DetailItem {
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
  PrePerformance?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
}

// ---營業報表統計(response和mapping response) 和 footerShowTotal 會和後面的-70一起共用---
export interface TLS31020Total {
  TotalBudget: number;
  TotalSales: number;
  TotalPreOrderAmt: number;
  TotalPrePerformance: number;
  AvgAchievementRate: number;
  AvgBudgetRate: number;       // 補上
  AvgPerformanceRate: number;  // 補上
  TotalTxnCount: number;
  AvgTicket: number;
  TotalConsumerNum: number;
  TotalConsumerOrder: number;
  TotalSpace: number;
  AvgPSM: number;
  AvgMonthlyPayment: number;
  TotalTempCounterSales: number;
  TotalMonthlyBudget: number;
  TotalMonthlySales: number;
  TotalMonthlyPreOrder: number;
  AvgCompletionRate: number;
}
export interface footerShowTotal {
  budget?: number;
  AVN_TotSaleAmt?: number;
  PreOrderAmt?: number;          // ✅ 補上
  PrePerformance?: number;
  AchievementRate?: number;
  BudgetRate?: number;
  PerformanceRate?: number;
  TxnCount?: number;
  AvgTicket?: number;
  ConsumerNum?: number;
  ConsumerOrder?: number;
  tlt_space?: number;
  MonthlyPSM?: number;
  MonthlyPayment?: number;
  TempCounterSaleAmt?: number;
  TempCounterSalesRate?: number;
  TempCounterAmtRate?: number;
  MonthlyBudgetTotal?: number;
  MonthlySalesTotal?: number;
  MonthlyPreOrderTotal?: number; // ✅ 補上
  CompletionRate?: number;
}
export interface TLS31020Response {
  QueryData: TLS31020Item[];
  TotalData: TLS31020Total;
}

export interface TLS31020DetailResponse {
  QueryData: TLS31020DetailItem[];
  TotalData: TLS31020Total;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31020Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }

  //查詢各樓層之營業報表
  queryTLS31020(body: TLS31020Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31020`, body).pipe(
      map(res => {
        return {
          Data: res.Data?.QueryData,
          TotalCount: res.TotalCount,
          Message: res.Message,
          TotalData: res.Data?.TotalData
        };
      })
    );
  }

  //查詢 單樓層之營業報表
  queryTLS31020Detail(body: TLS31020DetailRequest): Observable<any> {
    return this.http.post<ApiResponse<TLS31020DetailResponse>>(`${this.apiUrl}/queryTLS31020Detail`, body).pipe(
      map(res => {
        return {
          Data: res.Data?.QueryData,
          TotalCount: res.TotalCount,
          Message: res.Message,
          TotalData: res.Data?.TotalData,
        };
      })
    );
  }

  //產出各樓層之營業報表
  printTLS31020(body: TLS31020PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31020`, body);
  }

  //產出 單樓層之營業報表
  printTLS31020Detail(body: TLS31020DetialPrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31020Detail`, body);
  }
}
