import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * TLS13080 整批新增合約扣款作業 - 查詢條件 Request
 */
export interface Tls13080QueryRequest {
  /** 專櫃編號 (多選，以清單傳遞) */
  tlt_noList?: string[];
  /** 大分類 (單選) */
  bus_type?: string;
  /** 契約起始日 - 起 */
  tlt_bdate_Start?: string;
  /** 契約到期日 - 迄 */
  tlt_edate_End?: string;
  /** 抽成別 */
  tlt_term_type?: string;
  /** 廠商統一編號 */
  ven_uniform?: string; // 根據規格推測為廠商統一編號
  /** 組織代碼 */
  org_id?: string;
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
}

/**
 * TLS13080 整批新增合約扣款作業 - 查詢結果 Response Item
 */
export interface Tls13080Response {
  /** 合約編號系統 id (long) */
  talent_id: number;
  /** 專櫃編號 */
  tlt_no: string;
  /** 品牌名稱 */
  tlt_name: string;
  /** 契約起始日 (DateOnly) */
  tlt_bdate: string;
  /** 契約到期日 (DateOnly) */
  tlt_edate: string;
  /** 抽成別(代號) */
  tlt_term_type: string;
  /** 抽成別(名稱) */
  tlt_term_type_Name: string;
  /** 大分類(代號) */
  bus_type: string;
  /** 大分類(名稱) */
  bus_type_name: string;
  /** 合約編號 */
  contract_no: string;
  /** 合約版次 */
  contract_subno: string;
  /** 組織代碼 */
  org_id: string;
  /** 廠商統一編號 (補齊 Swagger Response 欄位) */
  ven_uniform: string;
}


/**
 * TLS13080 整批新增合約扣款作業 - selectList 內部的單一合約項目
 */
export interface Tls13080SelectListItem {
  talent_id: number;
  tlt_bdate: string; // 契約起始日 (YYYY-MM-DD)
  tlt_edate: string; // 契約到期日 (YYYY-MM-DD)
  org_id: string; // 組織代碼
}

/**
 * TLS13080 整批新增合約扣款作業 - 新增 Request (扁平化結構)
 * 修正: 新增 isAll 和 Query 欄位
 */
export interface Tls13080InsertRequest {
  /** 💡 新增: 是否全選查詢結果 */
  isAll: boolean;
  cap_item: string; // 扣款代號
  cap_saletype: string; // 銷售類型
  instms_type: string | null; // 期數
  edc_bank: string | null; // 收單行
  pay_no: string; // 支付編號
  gui_flag: string; // 需從 cap_item 帶出
  tpy_rate: number; // 抽成率 (%)
  /** 只有當 isAll=false 時，selectList 才有作用 */
  selectList: Tls13080SelectListItem[];
  /** 💡 新增: 查詢條件 (用於 isAll=true 時) */
  Query: Tls13080QueryRequest;
}


@Injectable({
  providedIn: 'root'
})
export class Tls13080Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢符合條件的專櫃合約清單
   * @param params 查詢條件
   * @returns 專櫃合約清單
   */
  queryTLS13080(params: Tls13080QueryRequest): Observable<ApiResponse<Tls13080Response[]>> {
    return this.http.post<ApiResponse<Tls13080Response[]>>(`${this.apiUrl}/queryTLS13080`, params);
  }

  /**
   * 整批新增合約扣款項目
   * @param data 要新增的合約扣款項目清單
   */
  insertTLS13080(data: Tls13080InsertRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS13080`, data);
  }
}
