import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';

export interface TLS31040Request {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
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

export interface TLS31040PrintRequest extends TLS31040Request {
  IsMerge: boolean;
  IsExcel: boolean;
}

// 單一櫃別
export interface TLS31040DetailRequest {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
  tlt_building: string[]
  tlt_floor: string[]
  area_no: string[]
  bus_type: string // 這裡只有一個大分類
  bus_class: string[]
  bus_sclass: string[]
  tlt_kind: string
  tlt_term_type: string[]
  org_id: string[]
  TaxType: string
  IsRece_Yn: string
}

export interface TLS31040PrintDetailRequest extends TLS31040DetailRequest {
  IsMerge: boolean;
  IsExcel: boolean;
}

export interface TLS31040Response {
  tlt_kind: string;
  tlt_kind_name: string;
  
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
}

export interface TLS31040DetailResponse {
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
}

@Injectable({
  providedIn: 'root'
})
export class Tls31040Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
    constructor(private http: HttpClient) { }
    
    // 查詢各櫃別之營業報表
    queryTLS31040(body: TLS31040Request): Observable<ApiResponse<TLS31040Response[]>> {
      return this.http.post<ApiResponse<TLS31040Response[]>>(`${this.apiUrl}/queryTLS31040`, body);
    }

    // 查詢單櫃別展開之營業報表
    queryTLS31040Detail(body: TLS31040DetailRequest): Observable<ApiResponse<TLS31040DetailResponse[]>> {
      return this.http.post<ApiResponse<TLS31040DetailResponse[]>>(`${this.apiUrl}/queryTLS31040Detail`, body);
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
