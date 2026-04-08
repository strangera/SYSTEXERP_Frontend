import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { convertYYYYMMToDate } from '@shared/componentkit/table/table.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設此路徑正確
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// =================================================================
// 1. queryTLS55030 (主查詢介面)
// =================================================================

/**
 * queryTLS55030 請求參數 (更新: 新增 OrderBy, Offset)
 */
export interface Tls55030QueryBody {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  TABTYPE?: string; // 單據別
  PUR_GUINo?: string; // 發票號碼
  PUR_GUIDate?: string; // 發票日期 (格式: yyyy-MM-dd)
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
 * queryTLS55030 回應資料項 (更新: 新增 PUR_VoucherType, Rebate_Amt)
 */
export interface Tls55030ListData {
  id: number;
  DIS_No: string; // 折讓單號
  ACP_YYYYMM: string; // 結帳年月
  VEN_No: string; // 廠商編號
  VEN_Name: string; // 廠商名稱
  TABTYPE: string; // 單據別
  PUR_VoucherType: string; // 發票格式代碼 (新增)
  DIS_Status: string; // 狀態
  Rebate_Amt: number; // 折讓金額 (新增)
  // 這裡應加入其他需要的欄位
}

// =================================================================
// 2. queryTLS55030ReturnDetailOption (退貨明細-選項查詢介面)
// =================================================================

/**
 * queryTLS55030ReturnDetailOption 請求參數 (更新: 新增 OrderBy, Offset)
 */
export interface ReturnDetailOptionQueryBody {
  PageSize: number;
  PageIndex: number;
  SortBy?: { field: string; order: number }[];
  ACP_YYYYMM: string; // 結帳年月
  VEN_No: string; // 廠商編號
}

/**
 * queryTLS55030ReturnDetail (基於 DIS_No 查詢折讓單退貨明細) 請求參數
 */
export interface ReturnDetailByDisNoQueryBody {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  DIS_No: string; // 折讓單號
}

/**
 * IReturnDetailData (用於 Option 或 NotRebate 查詢)
 * 注意：部分 API (如 Option) 回傳金額可能是 string，應用層需處理轉換。
 * 另，NotRebate API 回傳中包含 VEN_NO 和 HOS_No。
 */
export interface IReturnDetailData {
  id: number;
  RJM_No: string; // 退貨單號
  APRV_Date: string; // 審核日期
  HOS_NAME: string; // 醫院/門市名稱
  // 以下欄位在不同 API 回應中型別可能不一致，暫以 number 處理以利計算，若遇到 string 需在 service 或元件中轉型
  RJM_TotalBuyNet: number; // 總進貨淨額
  RJM_TotalBuyTax: number; // 總進貨稅額
  RJM_TotalBuyAmt: number; // 總進貨總額
  // 僅在 queryTLS55030ReturnNotRebate 回應中出現
  VEN_NO?: string; // 廠商編號 (NotRebate 回應中的欄位名為 VEN_NO)
  HOS_No?: string; // 門市編號
  [key: string]: string | number | undefined;
}


/**
 * IReturnDetailByDisNoData (用於 基於 DIS_No 查詢折讓單退貨明細)
 * 注意：此 API 回傳的 Rebate 金額欄位是 string 型別。
 */
export interface IReturnDetailByDisNoData {
  id: number;
  RJM_No: string; // 退貨單號
  APRV_Date: string; // 審核日期
  HOS_NAME: string; // 醫院/門市名稱
  Rebate_Net: string; // 折讓淨額 (回傳型別為 string)
  Rebate_Tax: string; // 折讓稅額 (回傳型別為 string)
  Rebate_Amt: string; // 折讓總額 (回傳型別為 string)
}

// =================================================================
// 3. queryTLS55030RebateDetailOption (發票/收據明細-選項查詢介面)
// =================================================================

/**
 * queryTLS55030RebateDetailOption 請求參數
 */
export interface RebateDetailOptionQueryBody {
  VEN_No: string; // 廠商編號\
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
}

/**
 * IInvoiceDetail (用於 Option 查詢)
 */
export interface IInvoiceDetail {
  SeqNo: number; // 序號
  id: number;
  PUR_GUINo: string; // 發票/收據號碼
  PUR_GUIDate: string; // 發票日期
  TABTYPE: string; // 單據別
  TABTYPE_TEXT: string; // 單據別說明 (新增)
  PUR_TaxType: string; // 稅別
  PUR_TaxType_TEXT: string; // 稅別說明 (新增)
  PUR_DirectType: string; // 發票用途
  PUR_VoucherType: string; // 發票格式代碼
  Rebate_GUIDate: Date;
  PUR_Amt: number; // 發票金額
  Rebate_Amt: number; // 已折讓金額
  Rebate_Name: string | null;    // 新增/輸入的折讓名稱

  // 應用層計算欄位 (從介面中移除，改在應用層定義或元件中計算)
  // Rebate_Amt_New?: number;
  // Rebate_Net?: number;
  // Rebate_Tax?: number;
}


/**
 * IInvoiceDetailByDisNo (用於 基於 DIS_No 查詢折讓單發票明細)
 */
export interface IInvoiceDetailByDisNo {
  id: number;
  SeqNo: number; // 序號
  PUR_GUINo: string; // 發票/收據號碼
  PUR_GUIDate: string; // 發票日期
  TABTYPE: string; // 單據別
  TABTYPE_TEXT: string; // 單據別說明
  PUR_TaxType: string; // 稅別
  PUR_TaxType_TEXT: string; // 稅別說明
  PUR_DirectType: string; // 發票用途
  PUR_Amt: number; // 發票金額
  PUR_VoucherType: string; // 發票格式代碼
  Rebate_Amt_Existed: number; // 已折讓金額
  Rebate_Amt: number; // 折讓金額
  Rebate_Net: number;
  Rebate_Tax: number;
  Rebate_GUIDate: string;
  Rebate_Name: string | null;    // 新增/輸入的折讓名稱
  // 注意: 此 API 回傳不包含 PUR_Amt
}


// =================================================================
// 4. insertTLS55030 (新增介面)
// =================================================================

/**
 * insertTLS55030 - 折讓單明細
 */
export interface RebateDetailPayload {
  id: number;
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
  id: number;
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

/**
 * insertTLS55030 回應資料 (更新: 回傳包含 DIS_No 的物件)
 */
export interface Tls55030InsertResponse {
  DIS_No: string;
}

// =================================================================
// 5. updateTLS55030 (更新介面)
// =================================================================

/**
 * updateTLS55030 - 明細
 */
export interface Tls55030UpdateDetail {
  DIS_No: string;
  PUR_GUINo: string;
  Rebate_Amt: number;
  Rebate_Net: number;
  Rebate_Tax: number;
}

/**
 * updateTLS55030 請求參數
 */
export interface Tls55030UpdateBody {
  details: Tls55030UpdateDetail[];
}

// =================================================================
// 6. queryTLS55030ReturnNotRebate (退貨未折讓查詢介面)
// =================================================================

/**
 * queryTLS55030ReturnNotRebate 請求參數
 */
export interface ReturnNotRebateQueryBody {
  APRV_Date_Start: string; // 格式: yyyy-MM-dd
  APRV_Date_End: string; // 格式: yyyy-MM-dd
  VEN_NO: string; // 廠商編號
  HOS_No: string; // 門市編號
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
}


@Injectable({
  providedIn: 'root'
})
export class Tls55030Service {
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
    return this.http.post<ApiResponse<Tls55030ListData[]>>(`${this.apiUrl}/queryTLS55030`, body).pipe(
      map(response => {
        // 將回傳的金額欄位從 string 轉換為 number
        const convertedData = response.Data.map(item => ({
          ...item,
          ACP_YYYYMM: this.datePipe.transform(convertYYYYMMToDate(item.ACP_YYYYMM), 'yyyy/MM') || '',
        }));
        return { ...response, Data: convertedData };
      })
    )
  }

  /**
   * @method queryTLS55030ReturnDetail (更新：改為 Option 介面)
   * 帶入已審核且未開立折讓單的退貨驗收資料 (根據結帳年月和廠商編號)
   * POST /TLS0000/TLS5000/queryTLS55030ReturnDetailOption
   * @param body 包含 ACP_YYYYMM 和 VEN_No 的查詢參數
   * @returns Observable<ApiResponse<IReturnDetailData[]>> 退貨明細資料陣列
   */
  queryTLS55030ReturnDetailOption(body: ReturnDetailOptionQueryBody): Observable<ApiResponse<IReturnDetailData[]>> {
    return this.http.post<ApiResponse<IReturnDetailData[]>>(
      `${this.apiUrl}/queryTLS55030ReturnDetailOption`, // API 名稱更新
      body
    ).pipe(
      map(response => {
        // 將回傳的金額欄位從 string 轉換為 number
        const convertedData = response.Data.map(item => ({
          ...item,
          RJM_TotalBuyNet: Number(item.RJM_TotalBuyNet),
          RJM_TotalBuyTax: Number(item.RJM_TotalBuyTax),
          RJM_TotalBuyAmt: Number(item.RJM_TotalBuyAmt),
        }));
        return { ...response, Data: convertedData };
      })
    )
  }

  /**
   * @method queryTLS55030RebateDetail (更新：改為 Option 介面)
   * 查詢該廠商可開立折讓單的發票/收據明細
   * POST /TLS0000/TLS5000/queryTLS55030RebateDetailOption
   * @param body 包含 VEN_No 的查詢參數
   * @returns Observable<ApiResponse<IInvoiceDetail[]>> 發票明細資料陣列
   */
  queryTLS55030RebateDetailOption(body: RebateDetailOptionQueryBody): Observable<ApiResponse<IInvoiceDetail[]>> {
    return this.http.post<ApiResponse<IInvoiceDetail[]>>(
      `${this.apiUrl}/queryTLS55030RebateDetailOption`, // API 名稱更新
      body
    );
  }

  /**
   * @method insertTLS55030
   * 執行發票折讓單的新增操作
   * POST /TLS0000/TLS5000/insertTLS55030
   * @param body 包含折讓與退貨明細的更新資料
   * @returns Observable<ApiResponse<Tls55030InsertResponse>> 回傳包含 DIS_No 的物件
   */
  insertTLS55030(body: Tls55030InsertBody): Observable<ApiResponse<Tls55030InsertResponse>> {
    return this.http.post<ApiResponse<Tls55030InsertResponse>>( // 回傳型別更新
      `${this.apiUrl}/insertTLS55030`,
      body
    );
  }

  /**
   * @method updateTLS55030
   * 執行發票折讓單的新增操作
   * POST /TLS0000/TLS5000/insertTLS55030
   * @param body 包含折讓與退貨明細的更新資料
   * @returns Observable<ApiResponse<Tls55030InsertResponse>> 回傳包含 DIS_No 的物件
   */
  updateTLS55030(body: Tls55030InsertBody): Observable<ApiResponse<Tls55030InsertResponse>> {
    return this.http.post<ApiResponse<Tls55030InsertResponse>>( // 回傳型別更新
      `${this.apiUrl}/updateTLS55030`,
      body
    );
  }

  /**
   * @method deleteTLS55030
   * 執行發票折讓單的新增操作
   * POST /TLS0000/TLS5000/deleteTLS55030
   * @param body 包含折讓與退貨明細的更新資料
   */
  deleteTLS55030(body: { DIS_Nos: string[] }): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>( // 回傳型別更新
      `${this.apiUrl}/deleteTLS55030`,
      body
    );
  }

  /**
   * @method queryTLS55030ReturnNotRebate
   * 查詢指定時間範圍內未開立折讓單的退貨驗收資料
   * POST /TLS0000/TLS5000/queryTLS55030ReturnNotRebate
   * @param body 包含日期範圍、廠商編號和門市編號
   * @returns Observable<ApiResponse<IReturnDetailData[]>>
   */
  queryTLS55030ReturnNotRebate(body: ReturnNotRebateQueryBody): Observable<ApiResponse<IReturnDetailData[]>> {
    return this.http.post<ApiResponse<IReturnDetailData[]>>(
      `${this.apiUrl}/queryTLS55030ReturnNotRebate`,
      body
    );
  }

  /**
   * @method queryTLS55030ReturnDetailByDisNo (新增方法)
   * 查詢單一折讓單的退貨明細 (基於 DIS_No)
   * POST /TLS0000/TLS5000/queryTLS55030ReturnDetail
   * @param body 包含 DIS_No 的查詢參數
   * @returns Observable<ApiResponse<IReturnDetailByDisNoData[]>> 退貨明細資料陣列
   */
  queryTLS55030ReturnDetailByDisNo(body: ReturnDetailByDisNoQueryBody): Observable<ApiResponse<IReturnDetailByDisNoData[]>> {
    return this.http.post<ApiResponse<IReturnDetailByDisNoData[]>>(
      `${this.apiUrl}/queryTLS55030ReturnDetail`,
      body
    );
  }

  /**
   * @method queryTLS55030RebateDetailByDisNo (新增方法)
   * 查詢單一折讓單的發票/收據明細 (基於 DIS_No)
   * POST /TLS0000/TLS5000/queryTLS55030RebateDetail
   * @param body 包含 DIS_No 的查詢參數
   * @returns Observable<ApiResponse<IInvoiceDetailByDisNo[]>> 發票明細資料陣列
   */
  queryTLS55030RebateDetailByDisNo(body: { DIS_No: string }): Observable<ApiResponse<IInvoiceDetailByDisNo[]>> {
    return this.http.post<ApiResponse<IInvoiceDetailByDisNo[]>>(
      `${this.apiUrl}/queryTLS55030RebateDetail`,
      body
    );
  }
}
