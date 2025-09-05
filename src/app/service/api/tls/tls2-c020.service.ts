import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// --- TLS2c020 查詢參數 Model 定義 ---
export interface TLS2c020QueryRequest {
  cls_date: string;               // 日期
  ECR_No: string;                 // 收銀機代碼
}

// --- TLS2c020 回應資料 Model 定義 ---
export interface TLS2C020Data {
  id?: number;
  mid?: number;
  cls_date?: string;
  step_num?: number;
  master_key?: string;
  check_result?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TLS2c020Service {

  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢SALCLOSE_ERROR資料表
  queryTLS2c020(params: TLS2c020QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2C020`, params);
  }
}