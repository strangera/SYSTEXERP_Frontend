import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// 查詢參數 Model
export interface TLS32030QueryRequest extends BaseQueryRequest {
  // 報表類型
  reportType?: string; // 報表類型

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
  floor?: string; // 樓層
  region?: string; // 區域
  bus_type?: string; // 大分類/中分類
  tlt_kind?: string; // 櫃別
  tlt_term_type?: string; // 抽成別
  org_id?: string; // 組織代號
  tlt_no?: string; // 專櫃編號
  tax?: boolean; // 是否含稅
}

// 查詢結果 Model
export interface TLS32030Data {
  id: number; // ID

  // 基本資訊欄位
  building: string; // 館別
  organization: string; // 組織
  counterType: string; // 櫃別
  counterNumber: string; // 專櫃編號
  counterName: string; // 專櫃名稱

  // 比較欄位群組 (2024/05/14)
  compare_salesAmount: number; // 銷售金額
  compare_salesCount: number; // 銷售筆數
  compare_customerCount: number; // 來客數
  compare_unitPrice: number; // 日坪效
  compare_conversionRate: number; // 達成率
  compare_averageSpend: number; // 客單價
  compare_position: number; // 位置排名

  // 基準欄位群組 (2024/05/13)
  baseline_salesAmount: number; // 銷售金額
  baseline_salesCount: number; // 銷售筆數
  baseline_customerCount: number; // 來客數
  baseline_unitPrice: number; // 日坪效
  baseline_conversionRate: number; // 達成率
  baseline_averageSpend: number; // 客單價
  baseline_position: number; // 位置排名

  // 成長率欄位群組
  growth_salesAmount: number; // 銷售金額
  growth_salesCount: number; // 銷售筆數
  growth_customerCount: number; // 來客數
  growth_unitPrice: number; // 日坪效
  growth_conversionRate: number; // 達成率
  growth_averageSpend: number; // 客單價
  growth_position: number; // 位置排名

  // 差異欄位群組
  diff_salesAmount: number; // 銷售金額
  diff_salesCount: number; // 銷售筆數
  diff_customerCount: number; // 來客數
  diff_unitPrice: number; // 日坪效
  diff_conversionRate: number; // 達成率
  diff_averageSpend: number; // 客單價
  diff_position: number; // 位置排名
}

@Injectable({
  providedIn: 'root'
})
export class TLS32030Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢組織預售業績總表資料
  queryTLS32030(data: TLS32030QueryRequest): Observable<any> {
    // return this.http.post<any>(`${this.apiUrl}/queryTLS32030`, data);
    // 回傳假資料
    return of({
      Data: [
        {
          id: 1,
          building: '信義A13',
          organization: 'A001',
          counterType: '專櫃',
          counterNumber: 'A001',
          counterName: '時尚精品',

          // 比較欄位群組
          compare_salesAmount: 1350000,
          compare_salesCount: 450,
          compare_customerCount: 420,
          compare_unitPrice: 87096,
          compare_conversionRate: 90.0,
          compare_averageSpend: 3000,
          compare_position: 5,

          // 基準欄位群組
          baseline_salesAmount: 1200000,
          baseline_salesCount: 400,
          baseline_customerCount: 380,
          baseline_unitPrice: 77419,
          baseline_conversionRate: 80.0,
          baseline_averageSpend: 3000,
          baseline_position: 8,

          // 成長率欄位群組
          growth_salesAmount: 12.5,
          growth_salesCount: 12.5,
          growth_customerCount: 10.5,
          growth_unitPrice: 12.5,
          growth_conversionRate: 12.5,
          growth_averageSpend: 0.0,
          growth_position: -37.5,

          // 差異欄位群組
          diff_salesAmount: 150000,
          diff_salesCount: 50,
          diff_customerCount: 40,
          diff_unitPrice: 9677,
          diff_conversionRate: 10.0,
          diff_averageSpend: 0,
          diff_position: -3
        },
        {
          id: 2,
          building: '信義A13',
          organization: 'B002',
          counterType: '專櫃',
          counterNumber: 'B002',
          counterName: '美妝保養',

          // 比較欄位群組
          compare_salesAmount: 1800000,
          compare_salesCount: 600,
          compare_customerCount: 580,
          compare_unitPrice: 150000,
          compare_conversionRate: 90.0,
          compare_averageSpend: 3000,
          compare_position: 2,

          // 基準欄位群組
          baseline_salesAmount: 1600000,
          baseline_salesCount: 533,
          baseline_customerCount: 510,
          baseline_unitPrice: 133333,
          baseline_conversionRate: 80.0,
          baseline_averageSpend: 3000,
          baseline_position: 3,

          // 成長率欄位群組
          growth_salesAmount: 12.5,
          growth_salesCount: 12.6,
          growth_customerCount: 13.7,
          growth_unitPrice: 12.5,
          growth_conversionRate: 12.5,
          growth_averageSpend: 0.0,
          growth_position: -33.3,

          // 差異欄位群組
          diff_salesAmount: 200000,
          diff_salesCount: 67,
          diff_customerCount: 70,
          diff_unitPrice: 16667,
          diff_conversionRate: 10.0,
          diff_averageSpend: 0,
          diff_position: -1
        },
        {
          id: 3,
          building: '信義A13',
          organization: 'C003',
          counterType: '專櫃',
          counterNumber: 'C003',
          counterName: '運動休閒',

          // 比較欄位群組
          compare_salesAmount: 1080000,
          compare_salesCount: 360,
          compare_customerCount: 340,
          compare_unitPrice: 60000,
          compare_conversionRate: 90.0,
          compare_averageSpend: 3000,
          compare_position: 8,

          // 基準欄位群組
          baseline_salesAmount: 960000,
          baseline_salesCount: 320,
          baseline_customerCount: 300,
          baseline_unitPrice: 53333,
          baseline_conversionRate: 80.0,
          baseline_averageSpend: 3000,
          baseline_position: 10,

          // 成長率欄位群組
          growth_salesAmount: 12.5,
          growth_salesCount: 12.5,
          growth_customerCount: 13.3,
          growth_unitPrice: 12.5,
          growth_conversionRate: 12.5,
          growth_averageSpend: 0.0,
          growth_position: -20.0,

          // 差異欄位群組
          diff_salesAmount: 120000,
          diff_salesCount: 40,
          diff_customerCount: 40,
          diff_unitPrice: 6667,
          diff_conversionRate: 10.0,
          diff_averageSpend: 0,
          diff_position: -2
        }
      ],
      TotalCount: 3
    });
  }
}