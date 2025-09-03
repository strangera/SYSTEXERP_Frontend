import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// 查詢參數 Model
export interface TLS32010QueryRequest extends BaseQueryRequest {
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
export interface TLS32010Data {
  id: number; // ID
  tlt_building: string; // 館別
  org_name: string; // 組織名稱
  tlt_kind: string; // 櫃別
  talent_id: string; // 櫃位編號
  talent_name: string; // 櫃位名稱
  position_no: string; // 位置編號
  tlt_space: number; // 坪數
  sales_target: number; // 營業目標
  sales_actual: number; // 營業實績
  transaction_count: number; // 交易筆數
  avg_unit_price: number; // 客單價
  floor_efficiency: number; // 坪效
  achievement_rate: number; // 達成率
}

@Injectable({
  providedIn: 'root'
})
export class TLS32010Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢櫃位營業報表資料
  queryTLS32010(data: TLS32010QueryRequest): Observable<BaseQueryResponse<TLS32010Data>> {
    return of({
      Status: '0000',
      Message: '查詢成功',
      Data: [
        {
          id: 1,
          tlt_building: 'A館',
          org_name: '組織一',
          tlt_kind: '服飾櫃',
          talent_id: 'A001',
          talent_name: '時尚服飾',
          position_no: 'A-1F-001',
          tlt_space: 50.5,
          sales_target: 1000000,
          sales_actual: 850000,
          transaction_count: 120,
          avg_unit_price: 7083,
          floor_efficiency: 16832,
          achievement_rate: 85.0,
          tlt_space_t: 50.5,
          sales_target_t: 1000000,
          sales_actual_t: 850000,
          transaction_count_t: 120,
          avg_unit_price_t: 7083,
          floor_efficiency_t: 16832,
          achievement_rate_t: 85.0
        },
        {
          id: 2,
          tlt_building: 'B館',
          org_name: '組織二',
          tlt_kind: '美食櫃',
          talent_id: 'B001',
          talent_name: '美味餐廳',
          position_no: 'B-2F-005',
          tlt_space: 30.2,
          sales_target: 800000,
          sales_actual: 920000,
          transaction_count: 200,
          avg_unit_price: 4600,
          floor_efficiency: 30464,
          achievement_rate: 115.0,
          tlt_space_t: 30.2,
          sales_target_t: 800000,
          sales_actual_t: 920000,
          transaction_count_t: 200,
          avg_unit_price_t: 4600,
          floor_efficiency_t: 30464,
          achievement_rate_t: 115.0
        }
      ],
      TotalCount: 2,
      TotalPage: 1
    });
  }
}