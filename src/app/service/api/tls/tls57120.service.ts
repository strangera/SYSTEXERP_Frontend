import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

/**
 * 滯銷品分析 請求參數
 */
export interface QueryTLS57120Request {
  /** 顯示方式 M: 彙總, D: 明細 */
  ShowType: QueryTLS57120ShowType;
  /** 基準月份 (YYYYMM) */
  BaseYM: string;
  /** 倉別代碼 */
  HOS_No?: string;
  /** 品牌代碼 */
  LOGO_No?: string;
  /** 日期範圍(起) */
  DateFrom?: string;
  /** 日期範圍(訖) */
  DateTo?: string;
  /** 期間天數 */
  PeriodDays?: number;
  /** 分頁索引 */
  PageIndex: number;
  /** 分頁大小 */
  PageSize: number;
  /** 排序 */
  SortBy?: SortMeta[];
}

/**
 * 滯銷品分析 (彙總) 單筆資料模型
 */
export interface QueryTLS57120SummaryResponse {
  /** 品牌名稱 */
  LOGO_NAME: string;
  /** 期末數量 */
  TOT_STK_CurrentQty: number;
  /** 期末成本 */
  TOT_STK_CurrentCost: number;
  /** 滯銷品庫存數量 */
  STK_CurrentQty: number;
  /** 滯銷品庫存成本 */
  StockCost: number;
  /** 成本佔比 */
  CostPercentage: number;
}

/**
 * 滯銷品分析 (明細) 單筆資料模型
 */
export interface QueryTLS57120DetailResponse {
  /** 品牌名稱 */
  LOGO_NAME: string;
  /** 商品管理編號 */
  PLU_MagNo: string;
  /** 品名 */
  PLU_Name: string;
  /** 國際條碼 */
  PLU_NO: string;
  /** 廠商貨號 */
  PLU_ORGPLUNO: string;
  /** 售價 */
  PLU_SALEPRC: number;
  /** 平均成本 */
  STK_UnitCost: number;
  /** 期末數量 */
  STK_CurrentQty: number;
  /** 期末成本 */
  STK_CurrentCost: number;
  /** 庫存成本 */
  StockCost: number;
  /** 最近銷貨日期 */
  MAX_SALE_DATE: string;
}

/**
 * 滯銷品分析 回傳資料模型
 */
export interface QueryTLS57120Response {
  /** 彙總資料 */
  SumData: QueryTLS57120SummaryResponse[];
  /** 明細資料 */
  DetailData: QueryTLS57120DetailResponse[];
  /** 總計資料 */
  TotalData: QueryTLS57120TotalResponse;
}

/**
 * 滯銷品分析 總計資料模型
 */
export interface QueryTLS57120TotalResponse {
  /** 期末數量總計 */
  TOT_STK_CurrentQty: number;
  /** 期末成本總計 */
  TOT_STK_CurrentCost: number;
  /** 滯銷品庫存數量總計 */
  STK_CurrentQty: number;
  /** 滯銷品庫存成本總計 */
  StockCost: number;
  /** 成本佔比 */
  CostPercentage: number;
  /** 售價總計 */
  PLU_SALEPRC: number;
  /** 平均成本總計 */
  STK_UnitCost: number;
}

/** 顯示方式
 * 彙總 = `M`
 * 明細 = `D`
 */
export enum QueryTLS57120ShowType {
  /** 彙總 */
  Summary = 'M',
  /** 明細 */
  Detail = 'D',
}

interface QueryTLS57120TableReportDataItem {
  Data: QueryTLS57120DetailResponse[] | QueryTLS57120SummaryResponse[];
  TotalCount: number;
  TotalData: QueryTLS57120TotalResponse | null;
}

@Injectable({
  providedIn: 'root'
})
export class Tls57120Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢滯銷品分析資料的 API 呼叫
   * @param body 查詢請求物件
   * @returns 查詢結果
   */
  queryTLS57120(body: QueryTLS57120Request): Observable<QueryTLS57120TableReportDataItem> {
    const url = `${this.apiUrl}/queryTLS57120`;
    return this.http.post<ApiResponse<QueryTLS57120Response>>(url, body).pipe(
      map(res => {
        const data = body.ShowType === QueryTLS57120ShowType.Detail ? res.Data.DetailData : res.Data.SumData;
        return {
          Data: data || [],
          TotalCount: res.TotalCount || 0,
          TotalData: res.Data.TotalData || null,
        };
      })
    );
  }
}

