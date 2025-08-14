import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確

export interface IPOS56040DetailData {
  PLU_MagNo: string; // 商品管理編號
  PLU_No: string; // 國際條碼
  PLU_Name: string; // 商品名稱
  MVD_BuyPrc: number; // 進單價
  STK_CurrentQty: number; // 目前庫存
  HOS_NO: string; // 品牌
  APPLY_Qty: number; // 調撥申請數量
  APPLY_BuyNet: number;  // 調撥申請進價未稅小計 MVD_BuyPrc進單價* APPLY_Qty調撥申請數量
  MVD_Remark: string; // 單項說明
}

export interface IQueryPOS56040DetailResponse {
  id: number,
  PLU_MagNo: string,
  PLU_Name: string,
  PLU_No: string,
  PLU_Unit: string,
  UNIT_NAME: string,
  PLU_BoxQty: number,
  PLU_StockTaxType: string,
  PLU_SalePrc_UNI: number,
  PLU_SalePrc: number,
  PLU_TaxType: string
}

export interface IQueryPOS56040DetailRequest {
  OUT_HOS_No: string; // 查詢編號 (商品管理編號/國際條碼/廠商貨號)
  LOGO_No?: string; // 商品名稱 (查詢條件，可選)
  STK_CurrentQty: number;
}

@Injectable({
  providedIn: 'root',
})
export class Tls56080Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2016 (採購單主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52010Data 陣列的 API 響應
   */
  queryTLS52010(params: any): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/queryTLS52010`, params);
  }

}
