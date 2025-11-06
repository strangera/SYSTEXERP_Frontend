import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * TLS13080 整批新增合約扣款作業 - 查詢條件 Request
 * 根據規格畫面上的查詢欄位定義。
 */
export interface Tls13080QueryRequest {
  /** 專櫃編號 (多選，以清單傳遞) */
  tlt_noList?: string[];
  /** 大分類 (單選) */
  bus_type?: string;
  /** 契約起始日 - 起 */
  tlt_bdate_Start?: string;
  /** 契約到期日 - 迄 */
  tlt_bdate_End?: string;
  /** 抽成別 */
  tlt_term_type?: string;
  /** 廠商統一編號 */
  ven_uniform?: string; // 根據規格推測為廠商統一編號
  /** 組織代碼 */
  org_id?: string;
}

/**
 * TLS13080 整批新增合約扣款作業 - 查詢結果 Response Item
 * 根據 C# 屬性定義 (合約資料清單)
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
  org_id: string; // TODO 後端可能要給(不確定建立需不需要)
}

/**
 * TLS13080 整批新增合約扣款作業 - 寫入資料庫的單一項目結構
 * 結構對應 tlttalent_fare table 的欄位
 */
export interface Tls13080CreateItem {
  talent_id: number;
  cap_type: string; // 固定為 'D'
  cap_item: string; // 扣款代號
  tpy_bdate: string; // 契約起始年月 (YYMM)
  tpy_edate: string; // 契約到期年月 (YYMM)
  tpy_amount: number; // 固定為 0
  tpy_totalamt: number; // 固定為 0
  down_payment: number; // 固定為 0
  period_nos: number; // 固定為 0
  cap_saletype: string; // 銷售類型
  edc_bank: string | null; // 收單行
  instms_type: string | null; // 期數
  pay_no: string; // 支付編號
  tpy_rate: number; // 抽成率 (已除以 100)
  org_id: string; // 組織代碼
}

export type Tls13080CreateRequest = Tls13080CreateItem[];

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
  createTLS13080(data: Tls13080CreateRequest): Observable<ApiResponse<number>> {
    // 假設後端新增 API 路徑為 /createTLS13080
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/createTLS13080`, data);
  }
}
