import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse, DropdownOption } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// 查詢參數 Model
export interface TLS26070QueryRequest extends BaseQueryRequest {
  // 報表類型
  reportType?: string; // 報表類型

  // 日期查詢條件
  onedatedd?: string; // 日期（日報表）
  onedateyy?: string[]; // 年度（週報表）
  weeks?: string[]; // 週數
  startdate?: string; // 開始日期（週報表用）
  enddate?: string; // 結束日期（週報表用）
  onedatemm?: string[]; // 年月（月報表）
  halfyear_onedateyy?: string[]; // 半年報表年度
  halfyear?: string[]; // 半年別
  year_onedateyy?: string[]; // 年報表年度
  sad_startdate?: string; // 區間開始日期
  sad_enddate?: string; // 區間結束日期
  eventID?: string[]; // 活動ID
  event_startdate?: string; // 活動開始日期
  event_enddate?: string; // 活動結束日期

  // 合約查詢條件
  floor?: string[]; // 樓層
  region?: string[]; // 區域
  bus_type?: string[]; // 大分類/中分類
  tlt_kind?: string[]; // 櫃別
  tlt_term_type?: string[]; // 抽成別
  org_id?: string[]; // 組織代號
  tlt_no?: string[]; // 專櫃編號
  tax?: boolean; // 是否含稅
}

// 查詢結果 Model
export interface TLS26070Data {
  id: number; // ID
  talent_id: string; // 專櫃編號
  tlt_building: string; // 樓別
  TEAM: string; // TEAM
  tlt_kind: string; // 櫃別
  bus_class_name: string; // 大分類/中分類名稱
  bus_sclass_name: string; // 業種中分類名稱
  tlt_name: string; // 專櫃名稱
  total_amt: number; // 合約總金額
  sad_preorder_amts: number; // 預售金額(含稅)
  sad_preorder_notaxamts: number; // 預售金額(未稅)
  sad_preorder_custs: number; // 預售客數
  tlt_space: number; // 坪數
}

@Injectable({
  providedIn: 'root'
})
export class TLS26070Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢各櫃預售業績總表資料
  queryTLS26070(data: TLS26070QueryRequest): Observable<BaseQueryResponse<TLS26070Data>> {
    return this.http.post<BaseQueryResponse<TLS26070Data>>(`${this.apiUrl}/queryTLS26070`, data);
  }
}