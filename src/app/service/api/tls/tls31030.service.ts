import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TLS31020Total } from './tls31020.service';

export interface TLS31030Request {
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

export interface TLS31030DetailRequest {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
  TLT_NO: string[];
  tlt_building: string[];
  tlt_floor: string[];
  area_no: string[];
  bus_type: string;
  bus_class: string[][];
  bus_sclass: string[][];
  tlt_kind: string[];
  tlt_term_type: string[];
  org_id: string[];
  TaxType: string;
  IsRece_Yn: string;
  pageSize: number;
  PreSale?: boolean;
  ConsumerNum?: boolean;
}

export interface TLS31030Item {
  bus_type: string;
  bus_type_name: string;
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

export interface TLS31030DetailItem {
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

export interface TLS31030PrintRequest extends TLS31030Request {
  IsExcel: boolean;
}

export interface TLS31030PrintDetailRequest extends TLS31030DetailRequest {
  IsExcel: boolean;
}

export interface TLS31030Response {
  QueryData: TLS31030Item[];
  TotalData: TLS31020Total;
}

export interface TLS31030DetailResponse {
  QueryData: TLS31030DetailItem[];
  TotalData: TLS31020Total;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31030Service {
  private readonly apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  queryTLS31030(body: TLS31030Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31030`, body).pipe(
      map(res => ({
        Data: res.Data?.QueryData,
        TotalCount: res.TotalCount,
        Message: res.Message,
        TotalData: res.Data?.TotalData
      }))
    );
  }

  queryTLS31030Detail(body: TLS31030DetailRequest): Observable<any> {
    return this.http.post<ApiResponse<TLS31030DetailResponse>>(`${this.apiUrl}/queryTLS31030Detail`, body).pipe(
      map(res => ({
        Data: res.Data?.QueryData,
        TotalCount: res.TotalCount,
        Message: res.Message,
        TotalData: res.Data?.TotalData,
      }))
    );
  }

  printTLS31030(body: TLS31030PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31030`, body);
  }

  printTLS31030Detail(body: TLS31030PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31030Detail`, body);
  }
}