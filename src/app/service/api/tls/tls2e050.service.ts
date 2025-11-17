import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- 共用 Request Body 介面 (從您提供的基礎上調整，移除分頁和排序欄位以保持查詢條件的純粹性) ---
export interface Tls2e050QueryBody {
  // 分頁排序欄位 (可選)
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: { field: string; order: number }[];

  // 查詢條件
  sam_yyymm_Start: string;
  sam_yyymm_End: string;
  money_typeList: string[];
  tlt_term_typeList: string[];
  ven_no: string;
  tlt_noList: string[];
  org_idList: string[];
  tlt_floorList: string[];
  tlt_buildingList: string[];
  bus_typeList: string[];
  bus_classList: string[][];
  rece_yn: string;
  cash_yn?: string; // queryTLS2E050 中未列出，但在其他 query 中出現
  acc_payableNeg: boolean;
  sam_ap_amtNeg: boolean;
  isNet?: boolean; // queryTLS2E050 中未列出，但在其他 query 中出現
  check_day: number;
  store_wayList?: string[]; // queryTLS2E050 中未列出，但在其他 query 中出現
  isUnderLimitAmt: boolean;
  invoice_type: string;
}

// --- queryTLS2E050 介面 (您已提供，為完整性在此列出) ---
export interface Tls2e050MainData {
  ven_no: string;
  VEN_Name: string;
  tlt_no: string;
  tlt_name: string;
  tlt_term_type_Name: string;
  sam_yyymm: string;
  bus_type_name: string;
  money_type_Name: string;
  sam_termno: number;
  check_day: number;
  sam_sales_namt: number;
  sam_sales_notaxamt: number;
  sam_sales_tax: number;
  sam_profit: number;
  sam_notax_profit: number;
  sam_profit_tax: number;
  sam_ap_namt: number;
  sam_ap_notaxamt: number;
  sam_ap_tax: number;
  sam_ap_amt: number;
  sam_fare_namt: number;
  sam_fare_tax: number;
  sam_fare_notaxamt: number;
  sam_rent_namt: number;
  sam_rent_tax: number;
  acc_receivable: number;
  sam_under_limit_amt: number;
  acc_payable: number;
}

export interface Tls2e050TotalData {
  group_name: string;
  sam_sales_namt: number;
  sam_sales_notaxamt: number;
  sam_sales_tax: number;
  sam_profit: number;
  sam_notax_profit: number;
  sam_profit_tax: number;
  sam_ap_namt: number;
  sam_ap_notaxamt: number;
  sam_ap_tax: number;
  sam_ap_amt: number;
  sam_fare_namt: number;
  sam_fare_tax: number;
  sam_fare_notaxamt: number;
  sam_rent_namt: number;
  sam_rent_tax: number;
  acc_receivable: number;
  sam_under_limit_amt: number;
  acc_payable: number;
}

// --- 專櫃銷貨彙總表-依抽成 Data 介面 (querySalCharge) ---
export interface SalChargeMainData {
  sad_date: string;
  floor_desc: string;
  tlt_no: string;
  tlt_name: string;
  Amt000: number; Namt000: number; Profit000: number; Per000: number;
  Amt095: number; Namt095: number; Profit095: number; Per095: number;
  Amt090: number; Namt090: number; Profit090: number; Per090: number;
  Amt085: number; Namt085: number; Profit085: number; Per085: number;
  Amt080: number; Namt080: number; Profit080: number; Per080: number;
  Amt075: number; Namt075: number; Profit075: number; Per075: number;
  Amt070: number; Namt070: number; Profit070: number; Per070: number;
  Amt060: number; Namt060: number; Profit060: number; Per060: number;
  Amt050: number; Namt050: number; Profit050: number; Per050: number;
  Amt999: number; Namt999: number; Profit999: number; Per999: number;
}

export interface SalChargeTotalData {
  group_name: string;
  Amt000: number; Namt000: number; Profit000: number;
  Amt095: number; Namt095: number; Profit095: number;
  Amt090: number; Namt090: number; Profit090: number;
  Amt085: number; Namt085: number; Profit085: number;
  Amt080: number; Namt080: number; Profit080: number;
  Amt075: number; Namt075: number; Profit075: number;
  Amt070: number; Namt070: number; Profit070: number;
  Amt060: number; Namt060: number; Profit060: number;
  Amt050: number; Namt050: number; Profit050: number;
  Amt999: number; Namt999: number; Profit999: number;
}

// --- 專櫃銷貨彙總表-依類別 Data 介面 (querySalChargeCategory) ---
export interface SalChargeCategoryMainData extends SalChargeMainData {
  tlt_id: string;
  tlt_id_desc: string;
}

export type SalChargeCategoryTotalData = SalChargeTotalData; // Total data 結構與 querySalCharge 相同


// --- 統一 Response 介面 ---
export interface ApiResponse<T, F> {
  Status: string;
  Message: string;
  Data: T[];
  footerData: F[];
  Error?: { Code: string; Message: string; Details: string };
  Meta?: { Timestamp: string; RequestId: string };
  TotalCount: number;
  TotalPage: number;
}


// --- Angular Service ---

const BASE_URL = environment.ApiUrl + '/TLS0000/TLS2000';

@Injectable({
  providedIn: 'root'
})
export class Tls2e050Service {

  constructor(private http: HttpClient) { }

  /**
   * 查詢專櫃帳款試算彙總表 (TLS2E050)
   * @param queryBody 查詢條件
   * @returns 包含查詢結果的 Observable
   */
  queryTls2e050(queryBody: Tls2e050QueryBody): Observable<ApiResponse<Tls2e050MainData, Tls2e050TotalData>> {
    const API_URL = `${BASE_URL}/queryTLS2E050`;
    return this.http.post<ApiResponse<Tls2e050MainData, Tls2e050TotalData>>(API_URL, queryBody);
  }

  // --- 您請求補齊的 Service 方法 ---

  /**
   * 查詢專櫃銷貨彙總表 - 依抽成
   * @param queryBody 查詢條件 (與 TLS2E050 相同)
   * @returns 包含查詢結果的 Observable
   */
  querySalCharge(queryBody: Tls2e050QueryBody): Observable<ApiResponse<SalChargeMainData, SalChargeTotalData>> {
    const API_URL = `${BASE_URL}/querySalCharge`;
    return this.http.post<ApiResponse<SalChargeMainData, SalChargeTotalData>>(API_URL, queryBody);
  }

  /**
   * 查詢專櫃銷貨彙總表 - 依類別
   * @param queryBody 查詢條件 (與 TLS2E050 相同)
   * @returns 包含查詢結果的 Observable
   */
  querySalChargeCategory(queryBody: Tls2e050QueryBody): Observable<ApiResponse<SalChargeCategoryMainData, SalChargeCategoryTotalData>> {
    const API_URL = `${BASE_URL}/querySalChargeCategory`;
    return this.http.post<ApiResponse<SalChargeCategoryMainData, SalChargeCategoryTotalData>>(API_URL, queryBody);
  }
}
