import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SortMeta } from 'primeng/api';
import { ApiResponse } from '@service/system/auth.service';

export interface Tls13070QueryRequest {
  "PageSize": number,
  "PageIndex": number,
  "SortBy": SortMeta[],
  "apply_no": string,
  "bus_typeList": [
    string
  ],
  "tlt_noList": [
    string
  ],
  "tlt_name": string,
  "ven_uniform_List": [
    string
  ],
  "contract_subno_Start": number,
  "contract_subno_End": number,
  "approve_status_List": [
    string
  ],
  "area_no_List": [
    string
  ],
  "tlt_floor_List": [
    string
  ],
  "contact_USR_No_List": [
    string
  ],
  "org_id_List": [
    string
  ],
  "tlt_openflag_List": [
    string
  ],
  "comm_comp_type_List": [
    string
  ],
  "feedback_date_Start": string,
  "feedback_date_End": string,
  "due_date_Start": string,
  "due_date_End": string,
  "contact_Date_Start": string,
  "contact_Date_End": string,
  "paper_type_List": [
    string
  ],
  "tlt_bdate_Start": string,
  "tlt_bdate_End": string,
  "tlt_edate_Start": string,
  "tlt_edate_End": string,
  "tlt_contract_bdate_Start": string,
  "tlt_contract_bdate_End": string,
  "tlt_contract_edate_Start": string,
  "tlt_contract_edate_End": string,
  "tlt_kind_List": [
    string
  ],
  "deco_type_List": [
    string
  ],
  "tlt_term_type_List": [
    string
  ],
  "money_type_List": [
    string
  ],
  "paytype_List": [
    string
  ],
  "store_way_List": [
    string
  ],
  "rece_yn": string,
  "pos_yn": string,
  "cash_yn": string
}

/**
 * 抽成條件 (cagList)
 */
export interface Tls13070Cag {
  talent_id: number;
  tlt_id: string;
  tlt_id_desc: string; // 例如: "廚房衛浴"
  tlt_bdate: string; // 帳務起 (日期時間字串)
  tlt_edate: string; // 帳務迄 (日期時間字串)
  cag_charge_rate: number; // 抽成比率
}

/**
 * 階梯條件 (levelList)
 */
export interface Tls13070Level {
  talent_id: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  level_bmount: number; // 起始金額
  level_eamount: number; // 終止金額
  level_charge_rate: number; // 抽成率
}

/**
 * 包底條件 (limitList)
 */
export interface Tls13070Limit {
  talent_id: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt_year: number; // 年包底
  limit_amt_range: number; // 區間包底
  limit_amt_month: number; // 月包底
}

/**
 * 固定租金條件 (rentList)
 */
export interface Tls13070Rent {
  talent_id: number;
  cag_bdate: string; // 帳務起
  cag_edate: string; // 帳務迄
  base_rent: number; // 租金
}

/**
 * 平均分攤 (C類費用) 結構
 */
export interface Tls13070FareC {
  tpy_totalamt: number | null; // 總金額
  down_payment: number | null; // 頭期款 (您的範例 JSON 中 key 名稱是 down_payment)
  month_payment: number | null; // 每月 (您的範例 JSON 中 key 名稱是 month_payment)
  advance?: number | null; // 預付款 (您的表格 HTML 裡有提到 advance，但 JSON 範例沒有，故設為可選)
}

/**
 * Tls13070 API 查詢結果的單筆資料介面
 */
export interface Tls13070Response {
  id: number;
  talent_id: number;
  apply_no: string; // 招募編號
  upd_date: string; // 更新時間 (日期時間字串)
  location_no: string; // 位置編號
  VEN_Name: string; // 廠商名稱
  ven_uniform: string; // 廠商統一編號
  tlt_name: string; // 品牌名稱
  tlt_no: string; // 專櫃編號
  tlt_space: number; // 秤數
  ECR_No?: string | null; // POS機號
  tlt_contract_bdate: string; // 營運期間(起) (日期時間字串)
  tlt_contract_edate: string; // 營運期間(迄) (日期時間字串)
  contract_term?: string | null; // 簽約年限 (您的 JSON 範例是 "2年")
  open_fees: number | null; // 準時開業保證金
  construct_fees: number | null; // 施工保證金
  expiration_fees: number | null; // 契約屆滿保證金
  tlt_term_type_Name: string | null; // 抽成別名稱
  tlt_ctype_mtotal?: string | null; // 未知欄位 (JSON範例有，但作用不明)

  // 租賃條件列表
  cagList: Tls13070Cag[];
  levelList: Tls13070Level[];
  limitList: Tls13070Limit[];
  rentList: Tls13070Rent[];

  total_amt: number | null;
  check_day: number; // 結帳後幾天匯款

  /**
   * 費用列表 (A/B/D 類為 number，C 類為 Tls13070FareC 物件)
   * 鍵值為 "A01", "B01", "C01", "D01" 等
   */
  fareList: Record<string, number | null | Tls13070FareC>;

  tlt_remark: string | null; // 備註
}

@Injectable({
  providedIn: 'root'
})
export class Tls13070Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) { }

  queryTLS13070(params: Tls13070QueryRequest): Observable<ApiResponse<Tls13070Response[]>> {
    return this.http.post<ApiResponse<Tls13070Response[]>>(`${this.apiUrl}/queryTLS13070`, params)
  }
}
