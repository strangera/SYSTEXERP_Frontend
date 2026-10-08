import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FIN15040QueryRequest extends ApiRequest {
  MID?: number;                  // 商場編號
  STO_No?: string;               // 分店編號
  TXN_Date_S?: string;           // 發票日期起
  TXN_Date_E?: string;           // 發票日期訖
  PUR_VoucherType?: string[];    // 發票格式
  GUI_Track?: string;            // 字軌
  INV_GUINumber_S?: string;      // 發票號碼起
  INV_GUINumber_E?: string;      // 發票號碼訖
  INV_YM1_S?: string;            // 資料所屬年月起
  INV_YM1_E?: string;            // 資料所屬年月訖
  INV_YM2_S?: string;            // 申報年月起
  INV_YM2_E?: string;            // 申報年月訖
  PUR_Uniform?: string;          // 廠商統一編號
  PUR_TaxType?: string[];        // 課稅別
  Source_Doc_No_S?: string;      // 憑證單號起
  Source_Doc_No_E?: string;      // 憑證單號訖
  Voucher_No_S?: string;         // 傳票號碼起
  Voucher_No_E?: string;         // 傳票號碼訖
  SAL_Type?: string[];           // 使用別
  CrtVouUsrNo?: string;          // 傳票建立者
  AssetType?: string;            // 資產註記
  HasUniform?: boolean;          // 是否有統一編號
  PUR_DiscNo?: string;           // 扣抵代號
  SYS_ORIGIN?: string[];         // 系統別
  INV_Cancel?: string;           // 發票狀態
  ECR_No?: string[];             // 收銀機號
  IncludeNextDayVoid?: boolean;  // 包含隔日作廢
  OnlyB2B?: boolean;             // 僅有B2B發票 (INV_TXNType = '3')
}

export interface FIN15040PrintRequest extends FIN15040QueryRequest {
  IsMerge?: boolean; // 合併列印
  IsExcel?: boolean; // 匯出格式
}

export interface FIN15040Data {
  INV_GUIType: string;      // 格式代號
  INV_GUITrack: string;     // 字軌(發票號碼前兩碼)
  INV_GUINumber: string;    // 發票號碼
  TXN_Date: string;         // 發票日期
  INV_YM1: string;          // 資料所屬年月 yyyymm
  INV_YM2: string;          // 申報年月 yyyymm
  TXN_Uniform: string;      // 買受人統一編號
  TXN_Net: number;          // 發票金額
  TXN_Tax: number;          // 發票稅額
  TXN_SaleAmt: number;      // 發票總金額
  PLU_TaxType: string;      // 課稅別
  Voucher_No: string;       // 傳票號碼
  SAL_Type: string;         // 系統別
  Source_Doc_No: string;    // 憑證單號
  AssetType: string;        // 資產註記
  INV_Cancel?: string;           // 發票狀態
}

@Injectable({
  providedIn: 'root'
})
export class FIN15040Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) { }

  // 查詢銷項發票明細表
  queryFIN15040(data: FIN15040QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN15040`, data);
  }

  // 產出銷項發票明細表
  printFIN15040(data: FIN15040PrintRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/printFIN15040`, data);
  }
}