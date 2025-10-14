import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@service/system/auth.service';
import { environment } from 'src/environments/environment';

// 定義 Request Body 的介面
export interface Tls2e050QueryBody {
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

// 定義單筆 Data 紀錄的介面 (API Response 中 Data 陣列的元素)
export interface Tls2e050Data {
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

const API_URL = environment.ApiUrl + '/TLS0000/TLS2000/queryTLS2E050'; // 假設基礎 URL 在 HttpClient 模組中配置

@Injectable({
  providedIn: 'root'
})
export class Tls2e050Service {

  constructor(private http: HttpClient) { }

  /**
   * 查詢專櫃帳款試算彙總表
   * @param queryBody 查詢條件
   * @returns 包含查詢結果的 Observable
   */
  queryTls2e050(queryBody: Tls2e050QueryBody): Observable<ApiResponse<Tls2e050Data[]>> {
    return this.http.post<ApiResponse<Tls2e050Data[]>>(API_URL, queryBody);
  }
}
