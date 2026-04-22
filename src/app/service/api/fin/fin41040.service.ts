import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FIN41040data {
  budget_year: string; // 年度
  budget_version: string; // 最新版本
  new_budget_year?: string; // 產生年度
  new_budget_version?: string; // 產生版本
}

export interface FIN41040response {
  Status: string;
  Data: FIN41040data;
  Error: {
    Code: string;
    Message: string;
    Details: string;
  },
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

export interface FIN41040copy {
  old_budget_year: string; // 舊年度
  old_version: string; // 舊版本
  new_budget_year: string; // 新年度
  new_version: string; // 新版本
  old_budget_yy: string; // 舊預算年
  new_budget_yy: string; // 新預算年
  old_budget_status: string; // 舊預算狀態
  new_budget_status: string; // 新預算狀態
  old_detail_count: number; // 舊明細筆數
  new_detail_count: number; // 新明細筆數
}

export interface FIN41040copyResponse {
  Status: string;
  Data: FIN41040copy;
  Error: {
    Code: string;
    Message: string;
    Details: string;
  },
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

@Injectable({
  providedIn: 'root'
})

export class Fin41040Service {
  // FIN41040 產生年中版本作業
  apiUrl: string = environment.ApiUrl + '/Controllers/FIN40000';
  constructor(private http: HttpClient) { }

  // 查詢 產生年中版本作業
  queryFIN41040(body: any): Observable<FIN41040response> {
    return this.http.post<FIN41040response>(`${this.apiUrl}/queryFIN41040`, body);
  }

  // 複製 產生年中版本作業
  copyFIN41040(body: any): Observable<FIN41040copyResponse> {
    return this.http.post<FIN41040copyResponse>(`${this.apiUrl}/copyFIN41040`, body);
  }
}
