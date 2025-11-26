import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設 ApiResponse 在這裡定義
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 定義 Request Body 的介面 (與 TLS2E050 相同，但補齊 Swagger 中多餘的欄位)
export interface Tls2e090QueryBody {
  // 分頁/排序欄位 (必須包含，即使在 Swagger 範例中是 0)
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: { field: string, order: number }[];
  cash_yn?: string; // Swagger 中有，但介面中缺少
  isNet?: boolean; // Swagger 中有，但介面中缺少
  store_wayList?: string[]; // Swagger 中有，但介面中缺少

  // 查詢欄位
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
  acc_payableNeg: boolean;
  sam_ap_amtNeg: boolean;
  check_day: number;
  isUnderLimitAmt: boolean;
  invoice_type: string;
}

// 1. 專櫃帳款結算彙總表 (queryTLS2E090) 的 Data 介面
export interface Tls2e090Data {
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

// Footer 總計資料介面
export interface TotalData {
  group_name: string; // 統計名稱 (通常是 "總計")
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


// 2. 專櫃銷貨彙總表-依抽成 (queryTLS2E090SalCharge) 的 Data 介面
export interface SalChargeData {
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

// 2/3. 專櫃銷貨彙總表-依抽成/依類別 的 Footer 介面
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

// 3. 專櫃銷貨彙總表-依類別 (queryTLS2E090SalChargeCategory) 的 Data 介面
export interface SalChargeCategoryData extends SalChargeData {
  tlt_id: string;
  tlt_id_desc: string;
}


const API_BASE = environment.ApiUrl + '/TLS0000/TLS2000';

@Injectable({
  providedIn: 'root'
})
export class Tls2e090Service {

  constructor(private http: HttpClient) { }

  /**
   * 1. 查詢專櫃帳款結算彙總表 (TLS2E090)
   */
  queryTls2e090(queryBody: Tls2e090QueryBody): Observable<ApiResponse<Tls2e090Data[], TotalData[]>> {
    const url = `${API_BASE}/queryTLS2E090`;
    return this.http.post<ApiResponse<Tls2e090Data[], TotalData[]>>(url, queryBody);
  }

  /**
   * 2. 查詢專櫃銷貨彙總表-依抽成 (TLS2E090SalCharge)
   */
  querySalCharge(queryBody: Tls2e090QueryBody): Observable<ApiResponse<SalChargeData[], SalChargeTotalData[]>> {
    const url = `${API_BASE}/queryTLS2E090SalCharge`;
    return this.http.post<ApiResponse<SalChargeData[], SalChargeTotalData[]>>(url, queryBody);
  }

  /**
   * 3. 查詢專櫃銷貨彙總表-依類別 (TLS2E090SalChargeCategory)
   */
  querySalChargeCategory(queryBody: Tls2e090QueryBody): Observable<ApiResponse<SalChargeCategoryData[], SalChargeTotalData[]>> {
    const url = `${API_BASE}/queryTLS2E090SalChargeCategory`;
    return this.http.post<ApiResponse<SalChargeCategoryData[], SalChargeTotalData[]>>(url, queryBody);
  }
}
