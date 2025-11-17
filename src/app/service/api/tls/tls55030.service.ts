import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // 假設您使用此方式導入環境變數

// =================================================================
// 1. queryTLS55030 (主查詢介面)
// =================================================================

/**
 * queryTLS55030 請求參數
 */
export interface Tls55030QueryBody {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  TABTYPE?: string; // 單據別
  PUR_GUINo?: string; // 發票號碼
  PUR_GUIDate?: string; // 發票日期
  ACP_YYYYMM?: string; // 結帳年月
  PUR_RepYYYYMM?: string;
  VEN_Uniform?: string;
  PUR_TaxType?: string[]; // 稅別
  GUI_Amt_Start?: number;
  GUI_Amt_End?: number;
  Rebate_Net_Start?: number;
  Rebate_Net_End?: number;
  Rebate_Tax_Start?: number;
  Rebate_Tax_End?: number;
  PUR_VoucherType?: string;
  DIS_Status?: string[]; // 狀態
  DIS_No?: string; // 折讓單號
}

/**
 * queryTLS55030 回應資料項
 */
export interface Tls55030ListData {
  id: number;
  DIS_No: string; // 折讓單號
  ACP_YYYYMM: string; // 結帳年月
  VEN_No: string; // 廠商編號
  TABTYPE: string; // 單據別
  DIS_Status: string; // 狀態
  // 這裡應加入其他需要的欄位
}

// =================================================================
// 2. queryTLS55030ReturnDetail (退貨明細查詢介面)
// =================================================================

/**
 * queryTLS55030ReturnDetail 請求參數
 */
export interface ReturnDetailQueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy?: { field: string; order: number }[];
  ACP_YYYYMM: string; // 結帳年月
  VEN_No: string; // 廠商編號
}


export interface ReturnNotRebateQueryBody {
  APRV_Date_Start: string,
  APRV_Date_End: string,
  VEN_NO: string,
  HOS_No: string
}

/**
 * queryTLS55030ReturnDetail 回應資料項 (對應原 IReturnDetailData)
 * 假設 RJM_TotalBuyAmt 等金額欄位在應用中仍應為 number 類型。
 */
export interface IReturnDetailData {
  RJM_No: string;    // 退貨單號
  APRV_Date: string;   // 審核日期
  VEN_NO: string;    // 廠商編號 (Swagger 似乎漏了此欄位，但邏輯需要，故保留)
  HOS_NAME: string;   // 醫院/門市名稱
  RJM_TotalBuyNet: number; // 總進貨淨額 (原 Swagger 範例為 string，但使用 number 以利計算)
  RJM_TotalBuyTax: number; // 總進貨稅額
  RJM_TotalBuyAmt: number; // 總進貨總額
  // 額外的欄位，用於處理邏輯
  [key: string]: string | number | undefined;
}


// =================================================================
// 3. queryTLS55030RebateDetail (發票/收據明細查詢介面)
// =================================================================

/**
 * queryTLS55030RebateDetail 請求參數
 */
export interface RebateDetailQueryBody {
  VEN_No: string; // 廠商編號
}

/**
 * queryTLS55030RebateDetail 回應資料項 (對應原 IInvoiceDetail)
 */
export interface IInvoiceDetail {
  SeqNo: number;     // 序號
  PUR_GUINo: string;   // 發票/收據號碼
  PUR_GUIDate: string;  // 發票日期
  PUR_VenNo?: string;   // 廠商編號 (Swagger 範例中未見，但原始程式碼有，故設為可選或在 service 內處理)
  TABTYPE: string;    // 單據別 ('收據' 或 '發票')
  PUR_TaxType: string;  // 稅別
  PUR_DirectType: string; // 發票用途
  PUR_VoucherType: string; // 發票格式代碼
  PUR_Amt: number;    // 發票金額
  Rebate_Amt: number;  // 已折讓金額

  // 應用層計算欄位
  Rebate_Amt_New?: number;
  Rebate_Net?: number;
  Rebate_Tax?: number;
}

// =================================================================
// 4. insertTLS55030 (新增/更新介面)
// =================================================================

/**
 * insertTLS55030 - 折讓單明細
 */
export interface RebateDetailPayload {
  PUR_GUINo: string;
  PUR_GUIDate: string;
  TABTYPE: string;
  PUR_TaxType: string;
  GUI_Amt: number;
  Rebate_GUIDate: string;
  Rebate_Amt: number;
  Rebate_Net: number;
  Rebate_Tax: number;
  Rebate_Name: string;
}

/**
 * insertTLS55030 - 退貨明細
 */
export interface ReturnDetailPayload {
  EVENT_ID: string; // 應為 RJM_No 或是其他唯一識別碼
  Rebate_Amt: number;
  Rebate_Net: number;
  Rebate_Tax: number;
}

/**
 * insertTLS55030 請求參數
 */
export interface Tls55030InsertBody {
  ACP_YYYYMM: string; // 結帳年月
  VEN_No: string; // 廠商編號
  DIS_EntryType: string; // 異動別
  rebateDetails: RebateDetailPayload[]; // 折讓單明細
  returnDetails: ReturnDetailPayload[]; // 退貨明細
}

@Injectable({
  providedIn: 'root'
})
export class Tls55030Service {
  // 將 apiUrl 定義為新的 API 基礎路徑
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(
    private readonly http: HttpClient,
    private readonly datePipe: DatePipe
  ) { }

  /**
   * @method queryTLS55030
   * 查詢廠商發票折讓清單 (主列表)
   * POST /TLS0000/TLS5000/queryTLS55030
   * @param body 查詢參數
   */
  queryTLS55030(body: Tls55030QueryBody): Observable<ApiResponse<Tls55030ListData[]>> {
    return this.http.post<ApiResponse<Tls55030ListData[]>>(`${this.apiUrl}/queryTLS55030`, body);
  }

  /**
   * @method queryTLS55030ReturnDetail
   * 帶入已審核且未開立折讓單的退貨驗收資料 (根據結帳年月和廠商編號)
   * POST /TLS0000/TLS5000/queryTLS55030ReturnDetail
   * @param body 包含 ACP_YYYYMM 和 VEN_No 的查詢參數
   * @returns Observable<ApiResponse<IReturnDetailData[]>> 退貨明細資料陣列
   */
  queryTLS55030ReturnDetail(body: ReturnDetailQueryBody): Observable<ApiResponse<IReturnDetailData[]>> {
    return this.http.post<ApiResponse<IReturnDetailData[]>>(
      `${this.apiUrl}/queryTLS55030ReturnDetail`,
      body
    );
  }

  /**
   * @method queryTLS55030RebateDetail
   * 查詢該廠商可開立折讓單的發票/收據明細 (發票金額– 已折讓金額 > 0 的近兩年資料)
   * POST /TLS0000/TLS5000/queryTLS55030RebateDetail
   * @param body 包含 VEN_No 的查詢參數
   * @returns Observable<ApiResponse<IInvoiceDetail[]>> 發票明細資料陣列
   */
  queryTLS55030RebateDetail(body: RebateDetailQueryBody): Observable<ApiResponse<IInvoiceDetail[]>> {
    return this.http.post<ApiResponse<IInvoiceDetail[]>>(
      `${this.apiUrl}/queryTLS55030RebateDetail`,
      body
    );
  }

  /**
   * @method insertTLS55030
   * 執行發票折讓單的新增/更新操作
   * POST /TLS0000/TLS5000/insertTLS55030
   * @param body 包含折讓與退貨明細的更新資料
   * @returns Observable<ApiResponse<number>> 回傳 Id 或其他狀態碼
   */
  insertTLS55030(body: Tls55030InsertBody): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(
      `${this.apiUrl}/insertTLS55030`,
      body
    );
  }

  // 如果未來需要用到 /queryTLS55030ReturnNotRebate，可以添加以下方法：
  queryTLS55030ReturnNotRebate(body: ReturnNotRebateQueryBody): Observable<ApiResponse<IReturnDetailData[]>> {
    const paramBody = {
      ...body,
      APRV_Date_Start: this.datePipe.transform(body.APRV_Date_Start, 'yyyy-MM-dd'),
      APRV_Date_End: this.datePipe.transform(body.APRV_Date_End, 'yyyy-MM-dd'),
    };
    return this.http.post<ApiResponse<IReturnDetailData[]>>(
      `${this.apiUrl}/queryTLS55030ReturnNotRebate`,
      paramBody
    );
  }
}
