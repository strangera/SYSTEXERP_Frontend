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
  TXN_No?: number; // 交易序號
}

export interface TLS24010DetailRequest {
  SYS_StoreNo: string; // 店號,
  TXN_Date: string; // 銷售日期,
  ECR_No: string, // 收銀機號,
  TXN_No: number, // 交易序號,
}

export interface TLS24010Data {
  TXN_Date: string; // 銷售日期
  ECR_No: string; // 收銀機號
  TXN_No: string; // 交易序號
  TLT_No: string; // 專櫃編號
  TLT_Name: string; // 專櫃名稱
  TXN_Mode: string; // 交易型態
  store_way?: string; // 櫃位類型
  talent_id?: number; // 專櫃合約編號
  TXN_GUIPaper: string; // 補登類別
}

export interface POS5007Data {
  id: number; // 唯一識別碼
  PLU_MagNo: string; // 商品編號
  PLU_No: string; // 國際條碼
  TXN_Qty: number;// 數量
  PLU_SalePrc: number; // 單價金額
  TXN_Amt: number; // 單價小計金額
  TXN_Disc: number; // 單價折扣讓金額
  TXN_SaleAmt: number; // 單價銷售金額
  TLT_ID: string; // 類別
  PLU_TaxType: string; // 稅別
  TXN_DiscCode: string; // 折扣別
}

export interface POS5008Data {
  id?: number; // 唯一識別碼
  PAY_Type: string; // 付款別
  TXN_PayAmt?: number; // 付款金額
  CRD_Type?: string; // 信用卡別
  TERM_No?: string; // 期別
}

@Injectable({
  providedIn: 'root',
})
export class Tls24010Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2006 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS24010Data 陣列的 API 響應
   */
  queryTLS24010(params: TLS24010Request): Observable<ApiResponse<TLS24010Data[]>> {
    return this.http.post<ApiResponse<TLS24010Data[]>>(`${this.apiUrl}/queryTLS24010`, params);
  }
  /**
   * 查詢 POS2007 POS2008 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS24010Data 陣列的 API 響應
   */
  queryTLS24010_Detail(params: TLS24010DetailRequest): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/queryTLS24010_Detail`, params);
  }
}
