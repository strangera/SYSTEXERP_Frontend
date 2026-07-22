import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ass14040Request {
  YYYYMM: string
}

export interface calcRsponse {
  Status: string,
  "Data": {
    Success: boolean,
    Message: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class Ass14040Service {
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS1000';
  constructor(private http: HttpClient) { }

  // 查詢最近庫存成本結算年月
  queryASS14040(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryASS14040`, {});
  }

  // 執行庫存成本月結試算
  calcASS14040(body: ass14040Request): Observable<calcRsponse> {
    return this.http.post<calcRsponse>(`${this.apiUrl}/calcASS14040`, body);
  }

  // 執行庫存成本月結
  closeASS14040(body: ass14040Request): Observable<calcRsponse> {
    return this.http.post<calcRsponse>(`${this.apiUrl}/closeASS14040`, body);
  }
}
