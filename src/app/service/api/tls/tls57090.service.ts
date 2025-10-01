import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SortMeta } from 'primeng/api';

/**
 * 統一的進貨退貨單據統計表 請求參數
 * 包含所有明細和彙總可能需要的篩選條件，透過 ReportType 區分
 */
export interface QueryTLS57090Request {
  ReportType: '明細' | '彙總'; // 必填：'明細' 或 '彙總'

  HOS_No?: string[];         // 倉別代碼 (多選)
  LOGO_No?: string[];        // 品牌代碼 (多選)
  VEN_No?: string;           // 廠商編號 (單選)
  ODM_Date_Start?: string;   // 申請日期起 (YYYY-MM-DD 字串)
  ODM_Date_End?: string;     // 申請日期迄 (YYYY-MM-DD 字串)
  APRV_Date_Start?: string;  // 審核日期起 (YYYY-MM-DD 字串)
  APRV_Date_End?: string;    // 審核日期迄 (YYYY-MM-DD 字串)
  ODM_Type?: number[];       // 單據類型 (1: 進貨單, 2: 退貨單) (多選)
  Status?: string[];         // 單據狀態 ('1': 已申請, '2': 已審核, '9': 已作廢) (多選)
  pageIndex: number,
  pageSize: number,
  SortBy: SortMeta[]
}

/**
 * 進貨退貨單據統計表 (明細) 單筆資料模型 (Response)
 * 與後端 QueryTLS57090DetailResponse 一致
 */
export interface QueryTLS57090DetailResponse {
  TypeOrder: string;        // 排序類型 (1: 進貨單, 2: 退貨單)
  HOS_No?: string;          // 倉別代碼
  HOS_NAME?: string;        // 倉庫名稱
  LOGO_No?: string;         // 品牌代碼
  LOGO_CH_NAME?: string;    // 品牌名稱
  ODM_Date: string;         // 申請日期 (API 回傳為字串)
  APRV_Date?: string;       // 審核日期 (API 回傳為字串，可選)
  ODM_No: string;           // 單號
  ODM_Type: string;         // 單據類型 ('進貨單' / '退貨單')
  ODM_Status: string;       // 單據狀態 (已申請/已審核/已作廢)
  ODD_ConfirmQty?: number;  // 數量

  PLU_MagNo?: string;       // 商品管理編號
  PLU_Name?: string;        // 品名
  ODD_BuyNet?: number;      // 未稅金額
  ODD_BuyTax?: number;      // 稅額
  ODD_BuyAmt?: number;      // 應稅金額
  ODD_SalePrc?: number;     // 售價
  ODD_SaleAmt?: number;     // 售價小計
}

/**
 * 進貨退貨單據統計表 (彙總) 單筆資料模型 (Response)
 * 與後端 QueryTLS57090SummaryResponse 一致
 */
export interface QueryTLS57090SummaryResponse {
  TypeOrder: string;        // 排序類型 (1: 進貨單, 2: 退貨單)
  HOS_No?: string;          // 倉別代碼
  HOS_NAME?: string;        // 倉庫名稱
  LOGO_No?: string;         // 品牌代碼
  LOGO_CH_NAME?: string;    // 品牌名稱
  ODM_Date: string;         // 申請日期 (API 回傳為字串)
  APRV_Date?: string;       // 審核日期 (API 回傳為字串，可選)
  ODM_No: string;           // 單號
  ODM_Type: string;         // 單據類型 ('進貨單' / '退貨單')
  ODM_Status: string;       // 單據狀態 (已申請/已審核/已作廢)
  ODD_ConfirmQty?: number;  // 數量

  ODM_TotalBuyNet?: number; // 進價未稅金額
  ODM_TotalBuyTax?: number; // 進價稅額
  ODM_TotalBuyAmt?: number; // 進價含稅
}

/**
 * API 回傳給前端的資料模型 (包裹了明細或彙總資料)
 * 與後端 QueryTLS57090ApiResponse 一致
 */
export interface QueryTLS57090ApiResponse {
  DetailData?: QueryTLS57090DetailResponse[]; // 明細報表數據 (當 ReportType 為 '明細' 時填充)
  SummaryData?: QueryTLS57090SummaryResponse[]; // 彙總報表數據 (當 ReportType 為 '彙總' 時填充)
  SumData?: any; // 可以是 null 或其他彙總數據 (保持與後端一致性)
  AllData?: any; // 可以是 null 或其他所有數據的彙總 (保持與後端一致性)
}

@Injectable({
  providedIn: 'root'
})
export class Tls57090Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS57090`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢進貨/退貨單據統計表資料的 API 呼叫
   * 現在請求參數和回傳類型都已統一
   * @param body 統一的查詢請求物件 (QueryTLS57090Request)
   * @returns 包含 QueryTLS57090ApiResponse 結構的 API 回傳結果
   */
  queryTLS57090(body: QueryTLS57090Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57090`, body).pipe(
      map(res => {
        const data = body.ReportType === '明細' ? res.Data.DetailData : res.Data.SummaryData;
        return {
          Data: data,
          TotalCount: res.TotalCount,
          Message: res.Message,
          GrandTotal: body.ReportType === '明細' ? res.Data.GrandTotal : res.Data.SummaryTotal,
        };
      })
    );
  }

  /**
   * 匯出進貨/退貨單據統計報表 (PDF) 的 API 呼叫
   * 請求參數與查詢介面 (QueryTLS57090Request) 相同
   * @param body 統一的匯出請求物件 (QueryTLS57090Request)
   * @returns 包含 PDF 檔案的 Blob 物件
   */
  exportTLS57090PDF(
    body: QueryTLS57090Request
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportTLS57090PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
  /**
   * 匯出進貨/退貨單據統計報表 (Excel) 的 API 呼叫
   * 請求參數與查詢介面 (QueryTLS57090Request) 相同
   * @param body 統一的匯出請求物件 (QueryTLS57090Request)
   * @returns 包含 Excel 檔案的 Blob 物件
   */
  exportTLS57090Excel(
    body: QueryTLS57090Request
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportTLS57090Excel`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
