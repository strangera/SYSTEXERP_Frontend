import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確
import { SortMeta } from 'primeng/api';

//
// 調整後的介面定義
//
// 查詢 POS2008M (商品促銷主檔) 的請求介面
export interface IQueryTLS52050Request {
  MAM_No?: string;
  VEN_No?: string;
  LOGO_No?: string[];
  MAM_Status?: string[];
  APPLY_USR_No?: string[];
  APPLY_Date_Start?: string;
  APPLY_Date_End?: string;
  APRV_USR_No?: string[];
  APRV_Date_Start?: string;
  APRV_Date_End?: string;
  showReturnPriceOrdersOnly?: boolean;

  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
}

// 查詢 POS2008M (商品促銷主檔) 的單筆響應資料介面
export interface ITLS52050Data {
  Id: number;
  MAM_No: string;
  SYS_StoreNo: string;
  VEN_No: string;
  LOGO_No: string;
  MAM_BegDate: string;
  MAM_EndDate: string;
  MAM_Status: string;
  MAM_Method: string;
  MAM_TotAmt: number;
  MAM_MaxCondition: number;
  MAM_DiscType: string;
  MAM_Source: string;
  MAM_InvDesc: string;
  APPLY_Date: string;
  APPLY_USR_Name: string;
  APRV_Date: string;
  APRV_USR_Name: string;
}

// 插入 POS2008M 的單項明細資料介面
export interface IInsertTLS52050Detail {
  PLU_MagNo: string;
  PLU_OrderPrcRate: number;
  PLU_OrderPrc: number;
  MAM_OrderPrc: number;
  PLU_SalePrc: number;
  MAM_UnitPrc: number;
}

// 插入 POS2008M (商品促銷主檔) 的請求介面
export interface IInsertTLS52050Request {
  LOGO_No: string;
  VEN_No: string;
  MAM_Remark?: string;
  MAM_BegDate?: string;
  MAM_EndDate?: string;
  MAM_Method?: string;
  MAM_Status?: number;
  MAM_Type?: number;
  MAM_Source?: number;
  MAM_DateType?: number;
  MAM_Week1?: string;
  MAM_Week2?: string;
  MAM_Week3?: string;
  MAM_Week4?: string;
  MAM_Week5?: string;
  MAM_Week6?: string;
  MAM_Week7?: string;
  MAM_Day?: number;
  details: IInsertTLS52050Detail[];
}

@Injectable({
  providedIn: 'root',
})
export class Tls52050Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2008M (商品促銷主檔) 資料表
   * @param params 查詢條件 (IQueryTLS52050Request)
   * @returns 包含 ITLS52050Data 陣列的 API 響應
   */
  queryTLS52050(params: IQueryTLS52050Request): Observable<ApiResponse<ITLS52050Data[]>> {
    return this.http.post<ApiResponse<ITLS52050Data[]>>(`${this.apiUrl}/queryTLS52050`, params);
  }

  /**
   * 插入 POS2008M (商品促銷主檔) 資料表
   * @param data 插入資料 (IInsertTLS52050Request)
   * @returns 包含操作結果的 API 響應
   */
  insertTLS52050(data: IInsertTLS52050Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS52050`, data);
  }
  updateStatusTLS52050(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS52050`, data);
  }
  // 取得標籤檔資料
  getLabelTLS52050(params: { MAM_No: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/getLabelTLS52050`, params);
  }
}
