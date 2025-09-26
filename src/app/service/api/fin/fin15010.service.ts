import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse, DropdownOption } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15010 查詢參數 Model 定義 ---
export interface FIN15010QueryRequest extends BaseQueryRequest {
  MID: number;
  STO_No: string;
  PUR_GUIDate_S?: string;             // 發票日期_起
  PUR_GUIDate_E?: string;             // 發票日期_迄
  PUR_VoucherType?: string[];         // 發票格式 (修正為陣列)
  GUI_Track?: string;                 // 字軌
  InvoiceNo_S?: string;               // 發票號碼_起
  InvoiceNo_E?: string;               // 發票號碼_迄
  PUR_RepYYYYMM?: string;             // 申報年月
  PUR_GUIDateYYYYMM_S?: string;       // 資料所屬年月_起
  PUR_GUIDateYYYYMM_E?: string;       // 資料所屬年月_迄
  PUR_Uniform_S?: string;             // 廠商統一編號_起
  PUR_Uniform_E?: string;             // 廠商統一編號_迄
  PUR_DiscNo?: string;                // 扣抵代號
  PUR_Type?: string;                  // 類別區分
  PUR_TaxType?: string;               // 課稅別
  Source_Doc_No_S?: string;           // 憑證單號_起
  Source_Doc_No_E?: string;           // 憑證單號_迄
  Voucher_No_S?: string;              // 傳票號碼_起
  Voucher_No_E?: string;              // 傳票號碼_迄
  CRT_USR_Name?: string;              // 傳票建立者
  SAL_Type?: string;                  // 系統別
  CRT_Date_S?: string;                // 建立日期_起
  CRT_Date_D?: string;                // 建立日期_迄
}

// --- FIN15010 列印參數 Model 定義 ---
export interface FIN15010PrintRequest extends FIN15010QueryRequest {
  IsMerge: boolean;                   // 合併列印
  IsExcel: boolean;                   // Excel格式
}

// --- FIN15010 回應資料 Model 定義 ---
export interface FIN15010Data {
  No: number;                   // 序號 (修正欄位名稱)
  PUR_VoucherType: string;      // 格式代號
  GUI_Track: string;            // 字軌
  InvoiceNo: string;            // 發票號碼
  PUR_GUIDate: string;          // 發票日期
  PUR_RepYYYYMM: string;        // 申報年月
  PUR_GUIDateYYYYMM: string;    // 資料所屬年月
  PUR_Uniform: string;          // 廠商統一編號
  PUR_Net: number;              // 發票金額
  PUR_Tax: number;              // 發票稅額
  PUR_Amt: number;              // 總金額 (修正欄位名稱)
  PUR_Type: string;             // 類別區分
  PUR_TaxType: string;          // 課稅別
  PUR_DiscNo: string;           // 扣抵代號
  Source_Doc_No: string;        // 憑證單號
  Voucher_No: string;           // 傳票號碼
  CRT_USR_Name: string;         // 傳票建立者
  SAL_Type: string;             // 系統別
  CRT_Date: string;             // 建立日期
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
  queryFIN15010(data: FIN15010QueryRequest): Observable<BaseQueryResponse<FIN15010Data>> {
    return this.http.post<BaseQueryResponse<FIN15010Data>>(`${this.apiUrl}/queryFIN15010`, data);
  }

  // 列印
  printFIN15010(data: FIN15010PrintRequest): Observable<FIN15010PrintResponse> {
    return this.http.post<FIN15010PrintResponse>(`${this.apiUrl}/printFIN15010`, data);
  }
}