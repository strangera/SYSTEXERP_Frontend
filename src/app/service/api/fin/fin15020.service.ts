import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

// --- FIN15020 查詢參數 Model 定義 ---
export interface FIN15020QueryRequest extends BaseQueryRequest {
  MID?: number;                         // 商場編號 (南紡固定帶0)
  STO_No?: string;                      // 分店編號 (南紡固定帶'10')
  TXN_Ret_No_S?: string;               // 退出/折讓單號起
  TXN_Ret_No_E?: string;               // 退出/折讓單號訖
  PUR_GUIDate?: string;                // 退出/折讓日期 (YYYY-MM-DD)
  PUR_VoucherType?: string;            // 發票格式
  GUI_Track?: string;                  // 字軌
  PUR_GUINo_S?: string;                // 發票號碼起
  PUR_GUINo_E?: string;                // 發票號碼訖
  PUR_GUIDate_S?: string;              // 退出/折讓日期起 (YYYY-MM-DD)
  PUR_GUIDate_E?: string;              // 退出/折讓日期訖 (YYYY-MM-DD)
  Credit_Type?: string;                // 區別 (1.退出 2.折讓)
  PUR_RepYYYYMM?: string;              // 申報年月
  PUR_GUIDateYYYYMM_S?: string;        // 資料所屬年月起
  PUR_GUIDateYYYYMM_E?: string;        // 資料所屬年月訖
  Source_Doc_No_S?: string;            // 憑證單號起
  Source_Doc_No_E?: string;            // 憑證單號訖
  Voucher_No_S?: string;               // 傳票號碼起
  Voucher_No_E?: string;               // 傳票號碼訖
  SAL_Type?: string;                   // 系統別
}

export interface FIN15020Data {
  No: number;                          // 序號
  TXN_Ret_No: string;                  // 退出折讓單號 (從 API 規格推測)
  PUR_VoucherType: string;             // 發票格式代號
  GUI_Track: string;                   // 字軌
  InvoiceNo: string;                   // 發票號碼
  PUR_GUIDate: string;                 // 退出折讓日期
  Credit_Type: string;                 // 區別
  PUR_RepYYYYMM: string;               // 申報年月
  PUR_Net: number;                     // 退出折讓單金額
  PUR_Tax: number;                     // 退出折讓單稅額
  Source_Doc_No: string;               // 憑證單號
  Voucher_No: string;                  // 傳票編號
  SAL_Type: string;                    // 系統別
  PUR_DiscNo: string;                  // 折抵代號
  PUR_Uniform: string;                 // 統一編號
}

export interface FIN15020PrintRequest extends FIN15020QueryRequest {
  IsMerge?: boolean;
  IsExcel?: boolean;
}

export interface FIN15020PrintResponse {
  Print_URL: string;
}

@Injectable({
  providedIn: 'root'
})
export class FIN15020Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢進貨退出或折讓明細表
  queryFIN15020(data: FIN15020QueryRequest): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/queryFIN15020`, data
    );
  }

  // 列印進貨退出或折讓明細表
  printFIN15020(data: FIN15020PrintRequest): Observable<FIN15020PrintResponse> {
    return this.http.post<FIN15020PrintResponse>(
      `${this.apiUrl}/printFIN15020`, data
    );
  }
}