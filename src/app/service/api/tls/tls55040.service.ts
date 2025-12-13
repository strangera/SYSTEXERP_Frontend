import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service'; // 假設 ApiResponse 來自這裡

// ====================================================================
// A. 廠商請款作業-查詢 (/queryTLS55040)
// 請求 Body
export interface Tls55040QueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
  VEN_NoList: string[];
  OTA_No: string;
  PUR_GUINo: string;
  ACP_YYYYMM: string;
}

// 響應 Data 項目
export interface Tls55040Data {
  OTA_No: string;
  ACP_YYYYMM: string;
  VEN_NAME: string;
  TABTYPE: string;
  PUR_VoucherType: string;
  OTA_Status: string;
  OTA_Status_Name: string; // 根據 API 響應補齊
  PUR_TotNet: number;
}

// ====================================================================
// B. 廠商請款作業-新增-查詢廠商資料 (/queryTLS55040VenData)
// 請求 Body
export interface Tls55040VenQueryBody {
  VEN_No: string;
}

// 響應 Data 項目
export interface Tls55040VenData {
  VEN_No: string;
  LOGO_CH_NAME: string;
  VEN_Name: string;
  VEN_Uniform: string;
  VEN_PayConditionDay: number;
  VEN_Flag: string;
}

// ====================================================================
// C. 廠商請款作業-新增-取付款日期 (/getPayDate)
// 請求 Body
export interface GetPayDateBody {
  ACP_YYYYMM: string;
  VEN_PayConditionDay: number;
}

// 響應 Data 類型是單純的日期字串
// ApiResponse<string>

// ====================================================================
// D. 廠商請款作業-新增-商品資料查詢 (/queryTLS55040GoodData)
// 請求 Body
export interface Tls55040GoodQueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
  VEN_No: string;
  ACP_YYYYMM: string;
}

// 響應 Data 項目
export interface Tls55040GoodData {
  SortFlag: string;
  ODM_No: string;
  APRV_Date: string; // "2025-12-10"
  VEN_Name: string;
  HOS_Name: string;
  TotalBuyNet: number;
  TotalBuyTax: number;
  TotalBuyAmt: number;
}

// ====================================================================
// E. 廠商請款作業-新增 (/insertTLS55040)
// APS30181List 項目
export interface APS30181 {
  EVENT_No: string;
  EVENT_TYPE: string;
  EVENT_Net: number;
  EVENT_Tax: number;
  EVENT_Amt: number;
  ADJ_Amt: number;
  EVENT_DATE: Date; // 改為 string 以匹配 API 格式 "2025-12-10T03:59:12.743Z"
}

// APS3018List 項目
export interface APS3018 {
  TABTYPE: string;
  PUR_GUINo: string;
  PUR_GUIDate: string; // "2025-12-10T03:59:12.743Z"
  OTA_TaxType: string;
  PUR_RepYYYYMM: string;
  PUR_TotAmt: number;
  PUR_TotNet: number;
  PUR_TotTax: number;
  PUR_VoucherType: string;
}

// 請求 Body
export interface Tls55040InsertBody {
  VEN_No: string;
  ACP_YYYYMM: string;
  PUR_Uniform: string;
  VEN_PayConditionDay: number;
  ACP_PayDate: string; // "2025-12-10T03:59:12.743Z"
  APS30181List: APS30181[];
  APS3018List: APS3018[];
}

// ====================================================================
// F. 廠商請款作業-刪除 (/deleteTLS55040)
// 請求 Body
export interface Tls55040DeleteBody {
  OTA_NoList: string[]; // 要刪除的請款單號列表
}

// ====================================================================
// G. 廠商請款作業-修改 (/updateTLS55040)
// APS30181List 項目 (修改)
export interface APS30181Update {
  id: number;
  ADJ_Amt: number;
}

// APS3018List 項目 (修改)
export interface APS3018Update {
  id: number;
  PUR_GUINo: string;
  PUR_GUIDate: string;
  PUR_RepYYYYMM: string;
  PUR_TotAmt: number;
  PUR_TotNet: number;
  PUR_VoucherType: string;
}

// 請求 Body
export interface Tls55040UpdateBody {
  APS30181List: APS30181Update[];
  APS3018List: APS3018Update[];
}

// ====================================================================
// H. 廠商請款作業-查詢明細 (/queryDetailTLS55040)
// 請求 Body
export interface Tls55040DetailQueryBody {
  OTA_No: string;
}

// APS30181List 項目 (明細)
export interface APS30181Detail {
  id: number;
  EVENT_TYPE: string;
  EVENT_TYPE_Name: string;
  EVENT_No: string;
  EVENT_DATE: Date; // "2025-12-11T12:52:15.172Z"
  EVENT_Net: number;
  EVENT_Tax: number;
  EVENT_Amt: number;
  ADJ_Amt: number;
}

// APS3018List 項目 (明細)
export interface APS3018Detail {
  ACP_YYYYMM: string;
  VEN_No: string;
  ACP_PayDate: string; // "2025-12-11T12:52:15.172Z"
  id: number;
  TABTYPE: string;
  PUR_GUINo: string;
  PUR_GUIDate: string; // "2025-12-11T12:52:15.172Z"
  PUR_RepYYYYMM: string;
  OTA_TaxType: string;
  PUR_DiscNo: string;
  PUR_TotAmt: number;
  PUR_TotNet: number;
  PUR_TotTax: number;
  PUR_VoucherType: string;
  PUR_DirectType: string;
}

// 響應 Data 項目 (明細)
export interface Tls55040DetailData {
  ACP_YYYYMM: string;
  VEN_No: string;
  ACP_PayDate: string; // "2025-12-11T12:52:15.172Z"
  APS30181List: APS30181Detail[];
  APS3018List: APS3018Detail[];
}

// ====================================================================
// Service 實作
@Injectable({
  providedIn: 'root'
})
export class Tls55040Service {
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(
    private readonly http: HttpClient,
  ) { }

  /**
   * 1. 廠商請款作業-查詢 (/queryTLS55040)
   * @param body 查詢條件
   * @returns Observable<ApiResponse<Tls55040Data[]>>
   */
  queryTLS55040(body: Tls55040QueryBody): Observable<ApiResponse<Tls55040Data[]>> {
    return this.http.post<ApiResponse<Tls55040Data[]>>(`${this.apiUrl}/queryTLS55040`, body);
  }

  /**
   * 2. 廠商請款作業-新增-查詢廠商資料 (/queryTLS55040VenData)
   * @param body 查詢條件 (VEN_No)
   * @returns Observable<ApiResponse<Tls55040VenData[]>>
   */
  queryTLS55040VenData(body: Tls55040VenQueryBody): Observable<ApiResponse<Tls55040VenData[]>> {
    return this.http.post<ApiResponse<Tls55040VenData[]>>(`${this.apiUrl}/queryTLS55040VenData`, body);
  }

  /**
   * 3. 廠商請款作業-新增-取付款日期 (/getPayDate)
   * @param body 參數 (ACP_YYYYMM, VEN_PayConditionDay)
   * @returns Observable<ApiResponse<string>> (Data 欄位為日期字串)
   */
  getPayDate(body: GetPayDateBody): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/getPayDate`, body);
  }

  /**
   * 4. 廠商請款作業-新增-商品資料查詢 (/queryTLS55040GoodData)
   * @param body 查詢條件
   * @returns Observable<ApiResponse<Tls55040GoodData[]>>
   */
  queryTLS55040GoodData(body: Tls55040GoodQueryBody): Observable<ApiResponse<Tls55040GoodData[]>> {
    return this.http.post<ApiResponse<Tls55040GoodData[]>>(`${this.apiUrl}/queryTLS55040GoodData`, body);
  }

  /**
   * 5. 廠商請款作業-新增 (/insertTLS55040)
   * @param body 新增資料
   * @returns Observable<ApiResponse<any>> (API 響應 200 OK，沒有明確 Data Schema)
   */
  insertTLS55040(body: Tls55040InsertBody): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS55040`, body);
  }

  // --- 以下是新增的方法 ---

  /**
   * 6. 廠商請款作業-刪除 (/deleteTLS55040)
   * @param body 刪除條件 (OTA_NoList)
   * @returns Observable<ApiResponse<any>> (API 響應 200 OK，沒有明確 Data Schema)
   */
  deleteTLS55040(body: Tls55040DeleteBody): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteTLS55040`, body);
  }

  /**
   * 7. 廠商請款作業-修改 (/updateTLS55040)
   * @param body 修改資料
   * @returns Observable<ApiResponse<any>> (API 響應 200 OK，沒有明確 Data Schema)
   */
  updateTLS55040(body: Tls55040UpdateBody): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS55040`, body);
  }

  /**
   * 8. 廠商請款作業-查詢明細 (/queryDetailTLS55040)
   * @param body 查詢條件 (OTA_No)
   * @returns Observable<ApiResponse<Tls55040DetailData[]>>
   */
  queryDetailTLS55040(body: Tls55040DetailQueryBody): Observable<ApiResponse<Tls55040DetailData[]>> {
    return this.http.post<ApiResponse<Tls55040DetailData[]>>(`${this.apiUrl}/queryDetailTLS55040`, body);
  }
}
