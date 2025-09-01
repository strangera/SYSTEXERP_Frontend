import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';

export interface TLS31030Request {
  // TXN_DateS: string | Date;
  // TXN_DateE: string | Date;
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

export interface TLS31030Response {
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
  TempCounterSaleAmt: number;
  TempCounterSalesRate: number;
  TempCounterAmtRate: number;
  MonthlyBudgetTotal: number;
  MonthlySalesTotal: number;
  CompletionRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31030Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }
  
  // 查詢各大分類之營業報表
  queryTLS31030(body: TLS31030Request): Observable<ApiResponse<TLS31030Response[]>> {
    return this.http.post<ApiResponse<TLS31030Response[]>>(`${this.apiUrl}/queryTLS31030`, body);
  }

  // 查詢單大分類展開之營業報表
  queryTLS31030Detail(body: TLS31030Request): Observable<ApiResponse<TLS31030Response[]>> {
    return this.http.post<ApiResponse<TLS31030Response[]>>(`${this.apiUrl}/queryTLS31030Detail`, body);
  }

  // 產出各大分類之營業報表
  printTLS31030(body: TLS31030Request): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31030`, body);
  }

  // 產出單大分類展開之營業報表
  printTLS31030Detail(body: TLS31030Request): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31030Detail`, body);
  }
}
