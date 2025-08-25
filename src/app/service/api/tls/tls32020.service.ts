import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// 查詢參數 Model
export interface TLS32020QueryRequest extends BaseQueryRequest {
  // 報表類型
  reportType?: string; // 報表類型

  // 日期查詢條件
  sad_startdate?: string; // 區間開始日期 - ISO 格式
  sad_enddate?: string; // 區間結束日期 - ISO 格式
  eventID?: string; // 活動ID
  event_startdate?: string; // 活動開始日期 - ISO 格式
  event_enddate?: string; // 活動結束日期 - ISO 格式

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
export interface TLS32020Data {
  id: number;
  sequence: number; // 序號
  date: string; // 日期

  // 目標差異
  a1_target_diff: number;
  a2_target_diff: number;
  total_target_diff: number;

  // 營業額差異
  a1_sales_diff: number;
  a2_sales_diff: number;
  total_sales_diff: number;

  // 交易筆數差異
  a1_transaction_diff: number;
  a2_transaction_diff: number;
  total_transaction_diff: number;

  // 客單價差異
  a1_unit_price_diff: number;
  a2_unit_price_diff: number;
  total_unit_price_diff: number;

  // 2024年資料
  current_target_a1: number;
  current_target_a2: number;
  current_target_total: number;
  current_sales_a1: number;
  current_sales_a2: number;
  current_sales_total: number;
  current_transaction_a1: number;
  current_transaction_a2: number;
  current_transaction_total: number;
  current_unit_price_a1: number;
  current_unit_price_a2: number;
  current_unit_price_total: number;

  // 2023年資料
  previous_sales_a1: number;
  previous_sales_a2: number;
  previous_sales_total: number;
  previous_transaction_a1: number;
  previous_transaction_a2: number;
  previous_transaction_total: number;
  previous_unit_price_a1: number;
  previous_unit_price_a2: number;
  previous_unit_price_total: number;

  // 比較分析
  sales_variance: number;
  achievement_rate: number;
  transaction_variance: number;
  unit_price_variance: number;
}

@Injectable({
  providedIn: 'root'
})
export class TLS32020Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢櫃位營業報表資料
  queryTLS32020(data: TLS32020QueryRequest): Observable<BaseQueryResponse<TLS32020Data>> {
    return of({
      Status: '0000',
      Message: '查詢成功',
      Data: [
        {
          id: 1,
          sequence: 1,
          date: '2024/5/13(一)',

          // 目標差異
          a1_target_diff: 11926472,
          a2_target_diff: 3788047,
          total_target_diff: 15714519,

          // 營業額差異
          a1_sales_diff: 11926472,
          a2_sales_diff: 3788047,
          total_sales_diff: 15714519,

          // 交易筆數差異
          a1_transaction_diff: 26973,
          a2_transaction_diff: 26973,
          total_transaction_diff: 554,

          // 客單價差異
          a1_unit_price_diff: 26973,
          a2_unit_price_diff: 26973,
          total_unit_price_diff: 554,

          // 2024年資料
          current_target_a1: 12781000,
          current_target_a2: 2829000,
          current_target_total: 15610000,
          current_sales_a1: 11926472,
          current_sales_a2: 3788047,
          current_sales_total: 15714519,
          current_transaction_a1: 26973,
          current_transaction_a2: 26973,
          current_transaction_total: 554,
          current_unit_price_a1: 26973,
          current_unit_price_a2: 26973,
          current_unit_price_total: 554,

          // 2023年資料
          previous_sales_a1: 11926472,
          previous_sales_a2: 3788047,
          previous_sales_total: 15714519,
          previous_transaction_a1: 26973,
          previous_transaction_a2: 26973,
          previous_transaction_total: 554,
          previous_unit_price_a1: 26973,
          previous_unit_price_a2: 26973,
          previous_unit_price_total: 554,

          // 比較分析
          sales_variance: 15403999,
          achievement_rate: 97.0,
          transaction_variance: 6973,
          unit_price_variance: 6973
        },
        {
          id: 2,
          sequence: 2,
          date: '2024/5/14(二)',

          // 目標差異
          a1_target_diff: 25841423,
          a2_target_diff: 7713149,
          total_target_diff: 33554572,

          // 營業額差異
          a1_sales_diff: 25841423,
          a2_sales_diff: 7713149,
          total_sales_diff: 33554572,

          // 交易筆數差異
          a1_transaction_diff: 4318,
          a2_transaction_diff: 4318,
          total_transaction_diff: 863,

          // 客單價差異
          a1_unit_price_diff: 4318,
          a2_unit_price_diff: 4318,
          total_unit_price_diff: 863,

          // 2024年資料
          current_target_a1: 22282800,
          current_target_a2: 5876000,
          current_target_total: 28158800,
          current_sales_a1: 25841423,
          current_sales_a2: 7713149,
          current_sales_total: 33554572,
          current_transaction_a1: 4318,
          current_transaction_a2: 4318,
          current_transaction_total: 863,
          current_unit_price_a1: 4318,
          current_unit_price_a2: 4318,
          current_unit_price_total: 863,

          // 2023年資料
          previous_sales_a1: 25841423,
          previous_sales_a2: 7713149,
          previous_sales_total: 33554572,
          previous_transaction_a1: 4318,
          previous_transaction_a2: 4318,
          previous_transaction_total: 863,
          previous_unit_price_a1: 4318,
          previous_unit_price_a2: 4318,
          previous_unit_price_total: 863,

          // 比較分析
          sales_variance: 15010000,
          achievement_rate: 24.8,
          transaction_variance: 318,
          unit_price_variance: 318
        }
      ],
      TotalCount: 2,
      TotalPage: 1
    });
  }
}
