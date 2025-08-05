import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

// Query request interface for TLS26020
export interface TLS26020QueryRequest extends BaseQueryRequest {
  Sale_DateStart: string;     // 銷售日期(起)
  Sale_DateEnd: string;       // 銷售日期(訖)
  tlt_building: string[];     // 館別
  Org_Name: string[];           // 組織名稱
  tlt_floor: string[];        // 樓層
}

// Data result interface for TLS26020 (SALCHARGEM table)
export interface TLS26020Data {
  tlt_building: string;         // 館別
  Building_desc: string;        // 館別說明
  Org_Name: string;             // 組織名稱
  tlt_no: string;               // 專櫃編號
  location_no: string;          // 位置編號
  tlt_name: string;             // 櫃位名稱
  sad_sale_amt: number;         // 銷售金額
  sad_preorder_money: number;   // 預售金額
  sad_preorder_amt: number;     // 預售累積
}


@Injectable({
  providedIn: 'root'
})
export class TLS26020Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryTLS26020(data: TLS26020QueryRequest): Observable<BaseQueryResponse<TLS26020Data>> {
    return this.http.post<BaseQueryResponse<TLS26020Data>>(`${this.apiUrl}/queryTLS26020`, data);
  }
}