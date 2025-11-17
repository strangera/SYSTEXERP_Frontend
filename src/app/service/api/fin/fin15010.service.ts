import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse, DropdownOption } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15010 查詢參數 Model 定義 ---
export interface FIN15010QueryRequest extends BaseQueryRequest {
  MID: number;                        // 商場編號
  STO_No: string;                     // 分店編號
  PUR_GUIDate_S?: string;             // 發票日期起
  PUR_GUIDate_E?: string;             // 發票日期訖
  PUR_VoucherType?: string[];         // 發票格式
  GUI_Track?: string;                 // 字軌
  InvoiceNo_S?: string;               // 發票號碼起
  InvoiceNo_E?: string;               // 發票號碼訖
  PUR_RepYYYYMM?: string;             // 申報年月
  PUR_GUIDateYYYYMM_S?: string;       // 資料所屬年月起
  PUR_GUIDateYYYYMM_E?: string;       // 資料所屬年月訖
  PUR_Uniform_S?: string;             // 廠商統一編號起
  PUR_Uniform_E?: string;             // 廠商統一編號訖
  PUR_DiscNo?: string[];              // 扣抵代號
  PUR_Type?: string[];                // 類別區分
  PUR_TaxType?: string[];             // 課稅別
  Source_Doc_No_S?: string;           // 憑證單號起
  Source_Doc_No_E?: string;           // 憑證單號訖
  Voucher_No_S?: string;              // 傳票號碼起
  Voucher_No_E?: string;              // 傳票號碼訖
  CRT_USR_Name?: string;              // 傳票建立者
  PUR_DirectType?: string[];                // 直接扣抵法稅額分攤種類
  CRT_Date_S?: string;                // 建立日期起
  CRT_Date_D?: string;                // 建立日期訖
  SYS_ORIGIN?: string[];              // 系統別
}

// --- FIN15010 列印參數 Model 定義 ---
export interface FIN15010PrintRequest extends FIN15010QueryRequest {
  IsMerge: boolean;                   // 是否合併列印
  IsExcel: boolean;                   // 是否為EXCEL
}

// --- FIN15010 回應資料 Model 定義 ---
export interface FIN15010Data {
  No: number;                   // 序號
  PUR_VoucherType: string;      // 發票格式
  GUI_Track: string;            // 字軌
  InvoiceNo: string;            // 發票號碼
  PUR_GUIDate: string;          // 發票日期
  PUR_GUIDateYYYYMM: string;    // 資料所屬年月
  PUR_RepYYYYMM: string;        // 申報年月
  PUR_Uniform: string;          // 廠商統一編號
  PUR_Net: number;              // 發票金額
  PUR_Tax: number;              // 發票稅額
  PUR_Amt: number;              // 發票總金額
  PUR_TaxType: string;          // 課稅別
  Source_Doc_No: string;        // 憑證單號
  Voucher_No: string;           // 傳票號碼
  PUR_DirectType: string;             // 系統別
}

// --- 列印回應 Model 定義 ---
export interface FIN15010PrintResponse {
  Status: string;
  Data: {
    Print_URL: string;
  };
  Message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FIN15010Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN15010(data: FIN15010QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN15010`, data);
  }

  // 列印
  printFIN15010(data: FIN15010PrintRequest): Observable<FIN15010PrintResponse> {
    return this.http.post<FIN15010PrintResponse>(`${this.apiUrl}/printFIN15010`, data);
  }
}