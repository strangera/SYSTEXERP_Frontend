import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';

export interface TLS31080Request {
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

export interface TLS31080PrintRequest extends TLS31080Request {
  IsMerge: boolean;
  IsExcel: boolean;
}

// 單一型態
export interface TLS31080DetailRequest {
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
  paper_type: string
  TaxType: string
  IsRece_Yn: string
}

export interface TLS31080PrintDetailRequest extends TLS31080DetailRequest {
  IsMerge: boolean;
  IsExcel: boolean;
}

export interface TLS31080Response {
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
}

export interface TLS31080DetailResponse {
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
}

@Injectable({
  providedIn: 'root'
})
export class Tls31080Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }
          
  // 查詢各組織之營業報表
  queryTLS31080(body: TLS31080Request): Observable<ApiResponse<TLS31080Response[]>> {
    return this.http.post<ApiResponse<TLS31080Response[]>>(`${this.apiUrl}/queryTLS31080`, body);
  }
      
  // 查詢單組織展開之營業報表
  queryTLS31080Detail(body: TLS31080DetailRequest): Observable<ApiResponse<TLS31080DetailResponse[]>> {
    return this.http.post<ApiResponse<TLS31080DetailResponse[]>>(`${this.apiUrl}/queryTLS31080Detail`, body);
  }
        
  // 產出各組織之營業報表
  printTLS31080(body: TLS31080PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31080`, body);
  }
        
  // 產出單組織展開之營業報表
  printTLS31080Detail(body: TLS31080PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31080Detail`, body);
  }
}
