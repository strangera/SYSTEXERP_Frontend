import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TLS31010Request {
  IsExcel?: boolean;
  TXN_Date: string | Date;
  tlt_building: string[]
  tlt_floor: string[]
  area_no: string[]
  bus_type: string[]
  bus_class: string[]
  bus_sclass: string[]
  tlt_kind: string[]
  tlt_term_type: string[]
  org_id: string[]
  TaxType: string
  IsRece_Yn: string
}

export interface TLS31010QueryData {
  group_name?: string
  building_desc: string
  org_name: string
  tlt_kind: string
  tlt_no: string
  location_no: string
  tlt_name: string
  budget: number
  AVN_TotSaleAmt: number
  AchievementRate: number
  BudgetRate: number
  PerformanceRate: number
  TxnCount: number
  AvgTicket: number
  tlt_space: number
  MonthlyPSM: number
  MonthlyBudgetTotal: number
  MonthlySalesTotal: number
  CompletionRate: number
}

export interface TLS31010TotalData {
  TotalBudget: number,
  TotalSales: number,
  AvgAchievementRate: number,
  TotalTxnCount: number,
  AvgTicket: number,
  TotalSpace: number,
  AvgPSM: number,
  TotalMonthlyBudget: number,
  TotalMonthlySales: number,
  AvgCompletionRate: number
}

export interface TLS31010Response {
  QueryData: TLS31010QueryData[];
  TotalData: TLS31010TotalData;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31010Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }

  queryTLS31010(body: TLS31010Request): Observable<ApiResponse<TLS31010Response>> {
    return this.http.post<ApiResponse<TLS31010Response>>(`${this.apiUrl}/queryTLS31010`, body);
  }

  printTLS31010(body: TLS31010Request): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31010`, body);
  }
}
