import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';

export interface TLS31020Request {
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

export interface TLS31020Response {
  tlt_floor: string,
  floor_desc: string,
  budget: number,
  AVN_TotSaleAmt: number,
  AchievementRate: number,
  BudgetRate: number,
  PerformanceRate: number,
  TxnCount: number,
  AvgTicket: number,
  tlt_space: number,
  MonthlyPSM: number,
  TempCounterSaleAmt: number,
  TempCounterSalesRate: number,
  TempCounterAmtRate: number,
  MonthlyBudgetTotal: number,
  MonthlySalesTotal: number,
  CompletionRate: number
}

@Injectable({
  providedIn: 'root'
})
export class Tls31020Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
    constructor(private http: HttpClient) { }
  
    //查詢各樓層之營業報表
    queryTLS31020(body: TLS31020Request): Observable<ApiResponse<TLS31020Response[]>> {
      return this.http.post<ApiResponse<TLS31020Response[]>>(`${this.apiUrl}/queryTLS31020`, body);
    }

    //查詢 單樓層之營業報表
    queryTLS31020Detail(body: TLS31020Request): Observable<ApiResponse<TLS31020Response[]>> {
      return this.http.post<ApiResponse<TLS31020Response[]>>(`${this.apiUrl}/queryTLS31020Detail`, body);
    }

    //產出各樓層之營業報表
    printTLS31020(body: TLS31020Request): Observable<ApiResponse<{ Print_URL: string }>> {
      return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31020`, body);
    }

    //產出 單樓層之營業報表
    printTLS31020Detail(body: TLS31020Request): Observable<ApiResponse<{ Print_URL: string }>> {
      return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31020Detail`, body);
    }
}
