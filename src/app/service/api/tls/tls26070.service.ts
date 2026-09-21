import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// 查詢參數 Model
export interface TLS26070QueryRequest extends ApiRequest {
  // 報表類型
  reportType?: string; // 報表類型
 tlt_building?: string[]; // 館別 A1 / A2
  // 日期查詢條件
  onedatedd?: string; // 日期（日報表）- ISO 格式
  onedatedd_c?: string; // 比較日期（日報表）- ISO 格式
  onedateyy?: string; // 年度（週報表）
  weeks?: string; // 週數
  startdate?: string; // 開始日期（週報表用）- ISO 格式
  enddate?: string; // 結束日期（週報表用）- ISO 格式
  onedateyy_c?: string; // 比較年度（週報表）
  weeks_c?: string; // 比較週數
  startdate_c?: string; // 比較開始日期（週報表用）- ISO 格式
  enddate_c?: string; // 比較結束日期（週報表用）- ISO 格式
  onedatemm?: string; // 年月（月報表）
  onedatemm_c?: string; // 比較年月（月報表）
  halfyear_onedateyy?: string; // 半年報表年度
  halfyear?: string; // 半年別
  halfyear_onedateyy_c?: string; // 比較半年報表年度
  halfyear_c?: string; // 比較半年別
  year_onedateyy?: string; // 年報表年度
  year_onedateyy_c?: string; // 比較年報表年度
  sad_startdate?: string; // 區間開始日期 - ISO 格式
  sad_enddate?: string; // 區間結束日期 - ISO 格式
  sad_startdate_c?: string; // 比較區間開始日期 - ISO 格式
  sad_enddate_c?: string; // 比較區間結束日期 - ISO 格式
  eventID?: string; // 活動ID
  event_startdate?: string; // 活動開始日期 - ISO 格式
  event_enddate?: string; // 活動結束日期 - ISO 格式
  eventID_c?: string; // 比較活動ID
  event_startdate_c?: string; // 比較活動開始日期 - ISO 格式
  event_enddate_c?: string; // 比較活動結束日期 - ISO 格式

  // 合約查詢條件
  floor?: string[]; // 樓層
  region?: string[]; // 區域
  bus_type?: string[]; // 大分類
  bus_class?: string[][]; // 中分類 - Changed from string[] to string[][]
  tlt_kind?: string[]; // 櫃別
  tlt_term_type?: string[]; // 抽成別
  org_id?: string[]; // 組織代號
  tlt_no?: string[]; // 專櫃編號
  tax?: boolean; // 是否含稅
}

// 查詢結果 Model
export interface TLS26070Data {
  id: number; // ID
  group_name: string; // 群組名稱
  tlt_building: string; // 館別
  talent_id: string; // 專櫃編號
  team_name: string; // TEAM名稱
  division_name: string; // 部門名稱
  tlt_kind: string; // 櫃別
  bus_class_name: string; // 大分類名稱
  bus_sclass_name: string; // 小分類名稱
  tlt_name: string; // 專櫃名稱
  budget_now: number; // 當期預算
  preorder_amt_now: number; // 當期預售金額(含稅)
  preorder_namt_now: number; // 當期預售金額(未稅)
  Achievement_rate_now: number; // 目標達成率(含稅)
  nAchievement_rate_now: number; // 目標達成率(未稅)
  preorder_custcnt_now: number; // 交易筆數
  avg_ordervalue_now: number; // 當期客單價(含稅)
  navg_ordervalue_now: number; // 當期客單價(未稅)
  preorder_amt_last: number; // 去年同期預售金額(含稅)
  preorder_namt_last: number; // 去年同期預售金額(未稅)
  preorder_custcnt_last: number; // 去年同期交易筆數
  avg_ordervalue_last: number; // 去年同期客單價(含稅)
  navg_ordervalue_last: number; // 去年同期客單價(未稅)
  Growth: number; // 成長比(含稅)
  nGrowth: number; // 成長比(未稅)
  PerformanceDiff: number; // 業績差異(含稅)
  nPerformanceDiff: number; // 業績差異(未稅)
  TransactionsNumber: number; // 交易筆數差異
  OrdervalueDiff: number; // 客單差異(含稅)
  nOrdervalueDiff: number; // 客單差異(未稅)
  tlt_space: number; // 營業坪數
  MonthlyFloorEffect: number; // 月坪效(含稅)
  nMonthlyFloorEffect: number; // 月坪效(未稅)
}

@Injectable({
  providedIn: 'root'
})
export class TLS26070Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢各櫃預售業績總表資料
  queryTLS26070(data: TLS26070QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS26070`, data);
  }
}