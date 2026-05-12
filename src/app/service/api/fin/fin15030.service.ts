import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FIN15030QueryRequest extends BaseQueryRequest {
  MID?: number;                // 商場編號
  STO_No?: string;             // 分店編號
  INV_Remark_S?: string;       // 退出/折讓單號起
  INV_Remark_E?: string;       // 退出/折讓單號訖
  INV_GUIType?: string[];      // 發票格式
  GUI_Track?: string;          // 字軌
  TXN_GUINo_S?: string;        // 發票號碼起
  TXN_GUINo_E?: string;        // 發票號碼訖
  TXN_Date_S?: string;         // 退出/折讓日期起
  TXN_Date_E?: string;         // 退出/折讓日期訖
  Credit_Type?: string[];      // 區別
  INV_YM?: string;             // 申報年月
  INV_Data_YM_S?: string;      // 資料所屬年月起
  INV_Data_YM_E?: string;      // 資料所屬年月訖
  Source_Doc_No_S?: string;    // 憑證單號起
  Source_Doc_No_E?: string;    // 憑證單號訖
  Voucher_No_S?: string;       // 傳票編號起
  Voucher_No_E?: string;       // 傳票編號訖
  SAL_Type?: string[];         // 使用別
  SYS_ORIGIN?: string[];       // 系統別
}

/**
 * 銷貨退回或折讓明細表資料清單細項
 */
export interface FIN15030Data {
  No?: number;                 // 序號
  INV_Remark?: string;         // 退出折讓單號
  INV_GUIType?: string;        // 發票格式
  GUI_Track?: string;          // 字軌
  TXN_GUINo?: string;          // 發票號碼
  TXN_Date?: string;           // 退出折讓日期
  Credit_Type?: string;        // 區別
  INV_YM?: string;             // 申報年月
  TXN_Net?: number;            // 退出折讓單金額
  TXN_Tax?: number;            // 退出折讓單稅額
  TXN_TotalAmt?: number;       // 折讓總金額
  Source_Doc_No?: string;      // 憑證單號
  Voucher_No?: string;         // 傳票編號
  SAL_Type?: string;           // 使用別
  TXN_Uniform?: string;        // 統一編號
  SYS_ORIGIN?: string;         // 系統別
  TXN_VoidDT?: string;         // 作廢日期
}

export interface FIN15030PrintRequest extends FIN15030QueryRequest {
  IsMerge?: boolean;           // 是否合併列印
  IsExcel?: boolean;           // 是否為EXCEL
}

@Injectable({
  providedIn: 'root'
})
export class FIN15030Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) { }

  // 查詢銷貨退回或折讓明細表
  queryFIN15030(data: FIN15030QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN15030`, data);
  }

  // 列印銷貨退回或折讓明細表
  printFIN15030(data: FIN15030PrintRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/printFIN15030`, data);
  }
}