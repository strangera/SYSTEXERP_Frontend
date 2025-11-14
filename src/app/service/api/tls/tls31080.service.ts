import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TLS31080Request {
  TxnDate: string;
  TimeMode: string;
  TimeFromHH: number;
  TimeToHH: number;
  StoreNos: string;
  Floors: string;
  Areas: string;
  CatLNos: string;
  CatMNos: string;
  CabinetKinds: string;
  OrgIds: string;
  CounterNos: string;
  ChargeTypes: string;
  Buildings: string;
  IncludeTax: boolean;
  BizInvFlag: string;
}

export interface TLS31080Response {
  floor_desc: string;
  TimeType: string;
  H08: number;
  H09: number;
  H10: number;
  H11: number;
  H12: number;
  H13: number;
  H14: number;
  H15: number;
  H16: number;
  H17: number;
  H18: number;
  H19: number;
  H20: number;
  H21: number;
  H22: number;
  H23: number;
  Reentry: number;
  Subtotal: number;
}

export interface TLS31080DetailResponse {
  tlt_no: string,
  tlt_name: string,
  floor_desc: string;
  TimeType: string;
  H08: number;
  H09: number;
  H10: number;
  H11: number;
  H12: number;
  H13: number;
  H14: number;
  H15: number;
  H16: number;
  H17: number;
  H18: number;
  H19: number;
  H20: number;
  H21: number;
  H22: number;
  H23: number;
  ReentryAmt: number;
  SubTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31080Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }
          
  // 查詢各時段之營業報表
  queryTLS31080(body: TLS31080Request): Observable<any> {
    return this.http.post<TLS31080Response>(`${this.apiUrl}/queryTLS31080`, body);
  }
              
  // 匯出各時段之營業報表
  exportTLS31080(body: TLS31080Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportTLS31080`, body);
  }

  // 查詢各時段之營業報表
  queryTLS31080Detail(body: TLS31080Request): Observable<any> {
    return this.http.post<TLS31080DetailResponse>(`${this.apiUrl}/queryTLS31080Detail`, body);
  }
        
  // 產出單時段展開之營業報表
  // printTLS31080Detail(body: TLS31080PrintDetailRequest): Observable<ApiResponse<{ Print_URL: string }>> {
  //   return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31080Detail`, body);
  // }
}
