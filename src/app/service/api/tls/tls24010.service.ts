import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確

export interface TLS24010Request {
  TXN_GUIPaper: string; // 補登類別
  TXN_Date: string; // 銷售日期
  ECR_No?: string; // 收銀機號
  TLT_No?: string; // 專櫃編號
  TXN_No?: string; // 交易序號
}

export interface TLS24010Data {
  TXN_Date: string; // 銷售日期
  ECR_No: string; // 收銀機號
  TXN_No: string; // 交易序號
  TLT_No: string; // 專櫃編號
  TLT_Name: string; // 專櫃名稱
  TXN_Mode: string; // 交易型態
}

@Injectable({
  providedIn: 'root',
})
export class Tls24010Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2008M (商品促銷主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS24010Data 陣列的 API 響應
   */
  queryTLS24010(params: TLS24010Request): Observable<ApiResponse<TLS24010Data[]>> {
    return this.http.post<ApiResponse<TLS24010Data[]>>(`${this.apiUrl}/queryTLS24010`, params);
  }
}
