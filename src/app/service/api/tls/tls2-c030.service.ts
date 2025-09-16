import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

// --- TLS2C030 查詢參數 Model 定義 ---
export interface TLS2C030QueryRequest extends BaseQueryRequest {
  onedatedd: string;               // 結帳日期
}

// --- TLS2C030 回應資料 Model 定義 ---
export interface TLS2C030Data {
  id?: number;
  mid?: number;
  cls_date?: string;               // 關帳日期
  day_lock_date?: string;          // 日關帳鎖定日期
  day_USR_No?: string;            // 日關帳鎖定人員
  day_USR_Name?: string;          // 日關帳鎖定人員姓名
}

@Injectable({
  providedIn: 'root'
})
export class TLS2C030Service {

  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢SALCLOSE資料表
  queryTLS2C030(params: TLS2C030QueryRequest): Observable<BaseQueryResponse<TLS2C030Data>> {
    return this.http.post<BaseQueryResponse<TLS2C030Data>>(`${this.apiUrl}/queryTLS2C030`, params);
  }

  // 確定日結
  definedatecheckoutTLS2C030(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/definedatecheckoutTLS2C030`, params);
  }

  // 反日結
  undefinedatecheckoutTLS2C030(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/undefinedatecheckoutTLS2C030`, params);
  }
}