import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';
import { TLS31020Total } from './tls31020.service';

export interface TLS31070Request {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
  tlt_building: string[]
  tlt_floor: string[]
  area_no: string[]
  bus_type: string[]
  bus_class: string[]
  bus_sclass: string[]
  tlt_kind: string[][]
  tlt_term_type: string[][]
  org_id: string[]
  TaxType: string
  IsRece_Yn: string
}

export interface TLS31070PrintRequest extends TLS31070Request {
  IsMerge: boolean;
  IsExcel: boolean;
}

// 單一型態
export interface TLS31070DetailRequest {
  TXN_DateS: string | Date;
  TXN_DateE: string | Date;
  tlt_building: string[]
  tlt_floor: string[]
  area_no: string[]
  bus_type: string[]
  bus_class: string[][]
  bus_sclass: string[][]
  tlt_kind: string[]
  tlt_term_type: string[]
  org_id: string[]
  paper_type: string
  TaxType: string
  IsRece_Yn: string
}

export interface TLS31070PrintDetailRequest extends TLS31070DetailRequest {
  IsMerge: boolean;
  IsExcel: boolean;
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
}

export interface TLS31070Response {
  QueryData: TLS31070Item[];
  TotalData: TLS31020Total;
}

export interface TLS31070DetailResponse {
  QueryData: TLS31070DetailItem[];
  TotalData: TLS31020Total;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31070Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }
        
  // 查詢各組織之營業報表
  queryTLS31070(body: TLS31070Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31070`, body).pipe(
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
    
  // 查詢單組織展開之營業報表
  queryTLS31070Detail(body: TLS31070DetailRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31070Detail`, body).pipe(
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
      
  // 產出各組織之營業報表
  printTLS31070(body: TLS31070PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31070`, body);
  }
      
  // 產出單組織展開之營業報表
  printTLS31070Detail(body: TLS31070PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31070Detail`, body);
  }
}
