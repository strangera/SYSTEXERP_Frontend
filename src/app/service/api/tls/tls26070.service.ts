import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
import { environment } from '../../../../environments/environment';

/**
 * TLS26070 查詢參數
 *
 * 對應後端：
 * /TLS0000/TLS2000/queryTLS26070
 */
export interface TLS26070QueryRequest extends ApiRequest {

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
   * 樓層
   *
   * 後端：
   * string[]
   */
  floor?: string[];

  /**
   * 區域
   *
   * 後端：
   * string[]
   */
  region?: string[];

  /**
   * 大分類
   *
   * 後端：
   * string[]
   *
   * 例如：
   * ["40"]
   */
  bus_type?: string[];

  /**
   * 中分類
   *
   * 後端：
   * string[][]
   *
   * 注意是二維陣列
   */
  bus_class?: string[][];

  /**
   * 櫃別
   *
   * 後端：
   * string[]
   */
  tlt_kind?: string[];

  /**
   * 抽成別
   *
   * 後端：
   * string[]
   */
  tlt_term_type?: string[];

  /**
   * 組織代號
   *
   * 後端：
   * string[]
   *
   * 例如：
   * ["102120"]
   */
  org_id?: string[];

  /**
   * 專櫃編號
   *
   * 後端：
   * string[]
   */
  tlt_no?: string[];

  /**
   * 是否含稅
   */
  tax?: boolean;

  /**
   * 館別
   *
   * ★ 注意：
   * 後端 Swagger 是：
   *
   * "tlt_building": "string"
   *
   * 所以這裡是 string，
   * 不是 string[]。
   *
   * 正確：
   * tlt_building: "A1"
   *
   * 錯誤：
   * tlt_building: ["A1"]
   */
  tlt_building?: string;
}


/**
 * TLS26070 查詢結果
 */
export interface TLS26070Data {

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

  /**
   * TEAM 名稱
   */
  team_name: string;

  /**
   * 部門 / 組別名稱
   */
  division_name: string;

  /**
   * 櫃別
   */
  tlt_kind: string;

  /**
   * 大分類名稱
   */
  bus_class_name: string;

  /**
   * 小分類名稱
   */
  bus_sclass_name: string;

  /**
   * 專櫃名稱
   */
  tlt_name: string;


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
 * TLS26070 API Service
 */
@Injectable({
  providedIn: 'root'
})
export class TLS26070Service {

  /**
   * API：
   * /TLS0000/TLS2000
   */
  private readonly apiUrl: string =
    environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(
    private http: HttpClient
  ) { }


  /**
   * 查詢各櫃預售業績總表資料
   *
   * POST
   * /TLS0000/TLS2000/queryTLS26070
   */
  queryTLS26070(
    data: TLS26070QueryRequest
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/queryTLS26070`,
      data
    );
  }
}