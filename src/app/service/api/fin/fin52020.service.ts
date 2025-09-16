import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseDeleteRequest, BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

// --- TDS52020 查詢參數 Model 定義 ---
export interface FIN52020QueryRequest extends BaseQueryRequest {
  VoucherKind?: string;         // 型態代號
  VoucherName?: string;         // 型態名稱
}

// --- TDS52020 回應資料 Model 定義 ---
export interface FIN52020Data {
  Id: number;
  VoucherKind: string;
  VoucherName: string;
}

// --- 新增 TDS52020 資料請求 Model ---
export interface FIN52020InsertRequest {
  VoucherKind: string;
  VoucherName: string;
}

// --- 更新 TDS52020 資料請求 Model ---
export interface FIN52020UpdateRequest {
  Id: number;
  VoucherName: string;
}

@Injectable({
  providedIn: 'root'
})
export class Fin52020Service {
  private apiUrl = environment.ApiUrl + '/FIN50000/FIN52020'; 

  constructor(private http: HttpClient) { }

  // 查詢 TDS52020 資料
  queryFIN52020(data: FIN52020QueryRequest): Observable<BaseQueryResponse<FIN52020Data>> {
    return this.http.post<BaseQueryResponse<FIN52020Data>>(`${this.apiUrl}/queryFIN52020`, data);
  }

  // 新增 TDS52020 資料
  insertFIN52020(payload: FIN52020InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN52020`, payload);
  }

  // 更新 TDS52020 資料
  updateFIN52020(payload: FIN52020UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN52020`, payload);
  }

  // 刪除 TDS52020 資料
  deleteFIN52020(payload: BaseDeleteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN52020`, payload);
  }
}
