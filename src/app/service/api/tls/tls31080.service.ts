import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';
import { TLS31020Total } from './tls31020.service';

export interface TLS31080Request {
  // TXN_DateS: string | Date;
  // TXN_DateE: string | Date;
  // tlt_building: string[]
  // tlt_floor: string[]
  // area_no: string[]
  // bus_type: string[]
  // bus_class: string[][]
  // bus_sclass: string[][]
  // tlt_kind: string[]
  // tlt_term_type: string[]
  // org_id: string[]
  // TaxType: string
  // IsRece_Yn: string

  TxnDate: string | Date;
  TimeMode: string;
  TimeFromHH: number;
  TimeToHH: number;
  StoreNos: string[];
  Floors: string[];
  Areas: string[];
  CatLNos: string[];
  CatMNos: string[];
  CabinetKinds: string[];
  OrgIds: string[];
  CounterNos: string[];
  ChargeTypes: string[];
  Buildings: string[];
  IncludeTax: string;
  BizInvFlag: string;
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
  bus_class: string[][]
  bus_sclass: string[][]
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

export interface TLS31080Item {
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

export interface TLS31080DetailItem {
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

export interface TLS31080Response {
  Data: TLS31080Item[];
  TotalData: TLS31020Total;
}

export interface TLS31080DetailResponse {
  Data: TLS31080DetailItem[];
  TotalData: TLS31020Total;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31080Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }
          
  // 查詢各時段之營業報表
  // queryTLS31080(body: TLS31080Request): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/queryTLS31080`, body).pipe(
  //         map(res => {
  //           return {
  //             Data: res.Data?.Data,
  //             TotalCount: res.TotalCount,
  //             Message: res.Message,
  //             TotalData: res.Data?.TotalData 
  //           };
  //         })
  //       );
  // }
  queryTLS31080(body: TLS31080Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31080`, body);
  }
      
  // 查詢各時段展開之營業報表
  queryTLS31080Detail(body: TLS31080DetailRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS31080Detail`, body).pipe(
          map(res => {
            return {
              Data: res.Data?.Data,
              TotalCount: res.TotalCount,
              Message: res.Message,
              TotalData: res.Data?.TotalData 
            };
          })
        );
  }
        
  // 產出單時段之營業報表
  printTLS31080(body: TLS31080PrintRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31080`, body);
  }
        
  // 產出單時段展開之營業報表
  printTLS31080Detail(body: TLS31080PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31080Detail`, body);
  }
}
