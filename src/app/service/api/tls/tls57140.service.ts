import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

/**
 * 商品迴轉率 請求參數 (QueryTLS57140Request)
 */
export interface QueryTLS57140Request {
  /** 顯示方式 */
  ShowType: QueryTLS57140ShowType;
  /** 年月 (YYYY-MM) */
  STK_YM?: string;
  /** 倉別代碼 (複選) */
  HOS_No?: string[];
  /** 品牌代碼 (複選) */
  LOGO_No?: string[];
  /** 商品管理編號/國際條碼/廠商貨號 */
  PLU_MagNo?: string;
  /** 分頁索引 */
  PageIndex: number;
  /** 分頁大小 */
  PageSize: number;
  /** 排序 */
  SortBy?: SortMeta[];
}

/**
 * 商品迴轉率 回傳資料模型
 */
export interface QueryTLS57140Response {
  /** 彙總資料 */
  SumData: QueryTLS57140SummaryResponse[];
  /** 明細資料 */
  DetailData: QueryTLS57140DetailResponse[];
}

/**
 * 商品迴轉率 (明細) 單筆資料模型
 */
export interface QueryTLS57140DetailResponse {
  /** 品牌代碼 */
  LOGO_No?: string;
  /** 品牌名稱 */
  LOGO_NAME?: string;
  /** 商品管理編號 */
  PLU_MagNo?: string;
  /** 品名 */
  PLU_NAME?: string;
  /** 國際條碼 */
  PLU_NO?: string;
  /** 廠商貨號 */
  PLU_OrgPLUNo?: string;
  /** 標準進價 */
  PLU_OrderPrc?: number;
  /** 商品售價 */
  PLU_SalePrc?: number;
  /** 銷售數量 */
  PLU_SaleQty: number;
  /** 期初存貨 */
  STK_PriorQty: number;
  /** 期末存貨 */
  STK_CurrentQty: number;
  /** 迴轉率 */
  INV_TURNOVER: number;
}

/**
 * 商品迴轉率 (彙總) 單筆資料模型
 */
export interface QueryTLS57140SummaryResponse {
  /** 品牌代碼 */
  LOGO_No?: string;
  /** 品牌名稱 */
  LOGO_NAME?: string;
  /** 銷售數量 */
  STK_SaleQty: number;
  /** 期初存貨 */
  STK_PriorQty: number;
  /** 期末存貨 */
  STK_CurrentQty: number;
  /** 迴轉率 */
  INV_TURNOVER: number;
}

/** 顯示方式
 * 彙總 = `M`
 * 明細 = `D`
 */
export enum QueryTLS57140ShowType {
  /** 彙總 */
  Summary = 'M',
  /** 明細 */
  Detail = 'D',
}

interface QueryTLS57140TableReportDataItem {
  Data: QueryTLS57140DetailResponse[] | QueryTLS57140SummaryResponse[];
  TotalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class Tls57140Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢商品迴轉率資料的 API 呼叫
   * @param body 查詢請求物件
   * @returns 查詢結果
   */
  queryTLS57140(body: QueryTLS57140Request): Observable<QueryTLS57140TableReportDataItem> {
    const url = `${this.apiUrl}/queryTLS57140`;
    return this.http.post<ApiResponse<QueryTLS57140Response>>(url, body).pipe(
      map(res => {
        const data = body.ShowType === QueryTLS57140ShowType.Detail ? res.Data.DetailData : res.Data.SumData;
        return {
          Data: data || [],
          TotalCount: res.TotalCount || 0,
        }
      })
    );
  }
}

