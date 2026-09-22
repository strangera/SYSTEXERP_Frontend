import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, take } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApiRequest,
  ApiResponse
} from '@shared/utils/rxjs-operators/validate-api-response';

/**
 * TLS26050 查詢參數
 */
export interface TLS26050QueryRequest extends ApiRequest {

  // =========================================================
  // 報表類型
  // =========================================================

  /**
   * 報表類型
   */
  reportType?: string;


  // =========================================================
  // 日期查詢條件
  // =========================================================

  /**
   * 日期（日報表）
   * 例如：2025-04-16
   */
  onedatedd?: string;

  /**
   * 比較日期（日報表）
   * 例如：2026-04-16
   */
  onedatedd_c?: string;


  /**
   * 年度（週報表）
   */
  onedateyy?: string;

  /**
   * 週數
   */
  weeks?: string;

  /**
   * 開始日期（週報表）
   */
  startdate?: string;

  /**
   * 結束日期（週報表）
   */
  enddate?: string;


  /**
   * 比較年度（週報表）
   */
  onedateyy_c?: string;

  /**
   * 比較週數
   */
  weeks_c?: string;

  /**
   * 比較開始日期
   */
  startdate_c?: string;

  /**
   * 比較結束日期
   */
  enddate_c?: string;


  /**
   * 年月（月報表）
   */
  onedatemm?: string;

  /**
   * 比較年月（月報表）
   */
  onedatemm_c?: string;


  /**
   * 半年報表年度
   */
  halfyear_onedateyy?: string;

  /**
   * 半年別
   */
  halfyear?: string;

  /**
   * 比較半年報表年度
   */
  halfyear_onedateyy_c?: string;

  /**
   * 比較半年別
   */
  halfyear_c?: string;


  /**
   * 年報表年度
   */
  year_onedateyy?: string;

  /**
   * 比較年報表年度
   */
  year_onedateyy_c?: string;


  /**
   * 區間開始日期
   */
  sad_startdate?: string;

  /**
   * 區間結束日期
   */
  sad_enddate?: string;

  /**
   * 比較區間開始日期
   */
  sad_startdate_c?: string;

  /**
   * 比較區間結束日期
   */
  sad_enddate_c?: string;


  // =========================================================
  // 活動查詢條件
  // =========================================================

  /**
   * 活動 ID
   */
  eventID?: string;

  /**
   * 活動開始日期
   */
  event_startdate?: string;

  /**
   * 活動結束日期
   */
  event_enddate?: string;


  /**
   * 比較活動 ID
   */
  eventID_c?: string;

  /**
   * 比較活動開始日期
   */
  event_startdate_c?: string;

  /**
   * 比較活動結束日期
   */
  event_enddate_c?: string;


  // =========================================================
  // 合約 / 專櫃查詢條件
  // =========================================================

  /**
   * 館別
   *
   * TLS26050 主查詢：
   * string[]
   *
   * 例如：
   * ["A1"]
   *
   * 注意：
   * TLS26070 的 tlt_building 是 string，
   * 兩支 API 型別不同。
   */
  tlt_building?: string[];

  /**
   * 樓層
   */
  floor?: string[];

  /**
   * 區域
   */
  region?: string[];

  /**
   * 大分類
   *
   * 例如：
   * ["40"]
   */
  bus_type?: string[];

  /**
   * 中分類
   *
   * 後端型別：
   * string[][]
   */
  bus_class?: string[][];

  /**
   * 櫃別
   */
  tlt_kind?: string[];

  /**
   * 抽成別
   */
  tlt_term_type?: string[];

  /**
   * 組織代號
   *
   * 例如：
   * ["102120"]
   */
  org_id?: string[];

  /**
   * 專櫃編號
   */
  tlt_no?: string[];

  /**
   * 是否含稅
   */
  tax?: boolean;
}


/**
 * 週報表起訖日期查詢參數
 */
export interface TLS26050WeekQueryRequest {

  /**
   * 年度
   */
  onedateyy: string;

  /**
   * 週數
   */
  weeks: string;
}


/**
 * 週報表起訖日期回應
 */
export interface TLS26050WeekResponse {

  /**
   * 週開始日期
   */
  WeekStart: string;

  /**
   * 週結束日期
   */
  WeekEnd: string;
}


/**
 * TLS26050 查詢結果
 */
export interface TLS26050Data {

  /**
   * ID
   */
  id: number;

  /**
   * 群組名稱
   */
  group_name: string;

  /**
   * 館別
   */
  tlt_building: string;

  /**
   * 專櫃編號
   */
  talent_id: string;


  // =========================================================
  // TEAM / 組織
  // =========================================================

  /**
   * TEAM 編號
   *
   * 後端可能回傳
   */
  team_no?: string;

  /**
   * TEAM 名稱
   */
  team_name: string;

  /**
   * 組別編號
   *
   * 後端可能回傳
   */
  division_no?: string;

  /**
   * 組別 / 部門名稱
   */
  division_name: string;


  // =========================================================
  // 分類
  // =========================================================

  /**
   * 櫃別
   */
  tlt_kind: string;

  /**
   * 大分類代碼
   *
   * 後端 TLS26050Response 有回傳
   */
  bus_type?: string;

  /**
   * 大分類名稱
   *
   * 後端 TLS26050Response 有回傳
   */
  bus_type_name?: string;

  /**
   * 分類名稱
   */
  bus_class_name: string;


  // =========================================================
  // 當期
  // =========================================================

  /**
   * 當期預算 / 目標
   */
  budget_now: number;

  /**
   * 當期預售金額（含稅）
   */
  preorder_amt_now: number;

  /**
   * 當期預售金額（未稅）
   */
  preorder_namt_now: number;

  /**
   * 目標達成率（含稅）
   */
  Achievement_rate_now: number;

  /**
   * 目標達成率（未稅）
   */
  nAchievement_rate_now: number;

  /**
   * 當期交易筆數
   */
  preorder_custcnt_now: number;

  /**
   * 當期客單價（含稅）
   */
  avg_ordervalue_now: number;

/**
 * 當期客單價（未稅）
 */
navg_ordervalue_now: number;


  // =========================================================
  // 去年同期
  // =========================================================

  /**
   * 去年同期預售金額（含稅）
   */
  preorder_amt_last: number;

  /**
   * 去年同期預售金額（未稅）
   */
  preorder_namt_last: number;

  /**
   * 去年同期交易筆數
   */
  preorder_custcnt_last: number;

  /**
   * 去年同期客單價（含稅）
   */
  avg_ordervalue_last: number;

  /**
   * 去年同期客單價（未稅）
   */
  navg_ordervalue_last: number;


  // =========================================================
  // 差異 / 成長
  // =========================================================

  /**
   * 成長比（含稅）
   */
  Growth: number;

  /**
   * 成長比（未稅）
   */
  nGrowth: number;

  /**
   * 業績差異（含稅）
   */
  PerformanceDiff: number;

  /**
   * 業績差異（未稅）
   */
  nPerformanceDiff: number;

  /**
   * 交易筆數差異
   */
  TransactionsNumber: number;

  /**
   * 客單差異（含稅）
   */
  OrdervalueDiff: number;

  /**
   * 客單差異（未稅）
   */
  nOrdervalueDiff: number;


  // =========================================================
  // 坪效
  // =========================================================

  /**
   * 營業坪數
   */
  tlt_space: number;

  /**
   * 月坪效（含稅）
   */
  MonthlyFloorEffect: number;

  /**
   * 月坪效（未稅）
   */
  nMonthlyFloorEffect: number;
}


/**
 * TLS26050 Service
 */
@Injectable({
  providedIn: 'root'
})
export class TLS26050Service {

  private readonly apiUrl: string =
    environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(
    private http: HttpClient
  ) {}


  /**
   * 查詢組織預售業績總表資料
   *
   * POST
   * /TLS0000/TLS2000/queryTLS26050
   */
  queryTLS26050(
    data: TLS26050QueryRequest
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/queryTLS26050`,
      data
    );
  }


  /**
   * 查詢週報表起訖日期
   *
   * POST
   * /TLS0000/TLS2000/queryTLS26050Week
   */
  queryTLS26050Week(
    data: TLS26050WeekQueryRequest
  ): Observable<ApiResponse<TLS26050WeekResponse[]>> {

    return this.http.post<
      ApiResponse<TLS26050WeekResponse[]>
    >(
      `${this.apiUrl}/queryTLS26050Week`,
      data
    );
  }


  /**
   * 匯出 Excel
   */
  exportExcelTLS26050(
    payload: TLS26050QueryRequest
  ): Observable<HttpResponse<Blob>> {

    return this.http
      .post(
        `${this.apiUrl}/exportTLS26050_Excel`,
        payload,
        {
          responseType: 'blob',
          observe: 'response'
        }
      )
      .pipe(
        take(1)
      );
  }


  /**
   * 匯出 PDF
   */
  exportPDFTLS26050(
    payload: TLS26050QueryRequest
  ): Observable<HttpResponse<Blob>> {

    return this.http
      .post(
        `${this.apiUrl}/exportTLS26050_PDF`,
        payload,
        {
          responseType: 'blob',
          observe: 'response'
        }
      )
      .pipe(
        take(1)
      );
  }
}