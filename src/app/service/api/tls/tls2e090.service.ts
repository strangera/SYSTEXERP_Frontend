import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '@service/system/auth.service';

// 定義 Request Body 的介面 (與 TLS2E050 相同)
export interface Tls2e090QueryBody {
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

// 定義單筆 Data 紀錄的介面 (與 TLS2E050 相同)
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

export interface TotalData {
  group_name: string; // 統計名稱 (通常是 "總計")
  sam_sales_namt: number; // 銷貨淨額
  sam_sales_notaxamt: number; // 銷貨未稅淨額
  sam_sales_tax: number; // 銷項稅額
  sam_profit: number; // 佣金淨額
  sam_notax_profit: number; // 佣金未稅淨額
  sam_profit_tax: number; // 佣金稅額
  sam_ap_namt: number; // 應付總淨額
  sam_ap_notaxamt: number; // 應付未稅淨額
  sam_ap_tax: number; // 應付稅額
  sam_ap_amt: number; // 應付總金額
  sam_fare_namt: number; // 費用淨額
  sam_fare_tax: number; // 費用稅額
  sam_fare_notaxamt: number; // 費用未稅淨額
  sam_rent_namt: number; // 租金淨額
  sam_rent_tax: number; // 租金稅額
  acc_receivable: number; // 應收金額
  sam_under_limit_amt: number; // 未達保底金額
  acc_payable: number; // 應付金額
}

const API_URL = environment.ApiUrl + '/TLS0000/TLS2000/queryTLS2E090'; // 假設基礎 URL 在 HttpClient 模組中配置

@Injectable({
  providedIn: 'root'
})
export class Tls2e090Service {

  constructor(private http: HttpClient) { }

  /**
   * 查詢專櫃帳款結算彙總表
   * @param queryBody 查詢條件
   * @returns 包含查詢結果的 Observable
   */
  queryTls2e090(queryBody: Tls2e090QueryBody): Observable<any> {
    return this.http.post<any>(API_URL, queryBody);
  }
}
