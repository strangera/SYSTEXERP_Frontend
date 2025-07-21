import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseDeleteRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';

// Query request interface for TLS26020
export interface TLS26020QueryRequest {
  saleDateFrom: string;      // 銷售日期(起)
  saleDateTo: string;        // 銷售日期(訖)
  storeCodeFrom: string;     // 館別(起)
  storeCodeTo: string;       // 館別(訖)
  organizationName: string[];  // 組織名稱
  floor: string[];             // 樓層
}

// Data result interface for TLS26020
export interface TLS26020Data {
  storeCode: string;         // 館別
  organizationName: string;  // 組織名稱
  counterCode: string;       // 專櫃編號
  locationCode: string;      // 位置編號
  counterName: string;       // 櫃位名稱
  preorderAmount: number;    // 預售金額
  saleAmount: number;        // 銷售金額
  preorderAccum: number;     // 預售累積
}

@Injectable({
  providedIn: 'root'
})
export class TLS26020Service {
  // private apiUrl = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryTLS26020(data: TLS26020QueryRequest): Observable<BaseQueryResponse<TLS26020Data>> {
    // return this.http.post<BaseQueryResponse<TLS26020Data>>(`${this.apiUrl}/queryTLS26020`, data);

    // 回傳假資料
    return of({
      Status: '0000',
      TotalCount: 1,
      Data: [{
        storeCode: '001',
        organizationName: '總公司',
        counterCode: 'C001',
        locationCode: 'L001',
        counterName: '櫃位A',
        preorderAmount: 1000,
        saleAmount: 2000,
        preorderAccum: 3000
      }],
      Message: 'Success',
      TotalPage: 1
    });
  }

}
