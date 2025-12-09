import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * 統一的盤點統計表 請求參數 (QueryTLS57150Request)
 */
export interface QueryTLS57150Request {
  ReportType: '明細' | '彙總'; // 必填：'明細' 或 '彙總'

  HOS_No?: string[];         // 倉別代碼 (多選)
  LOGO_No?: string[];        // 品牌代碼 (多選)
  PST_Date_Start?: string;   // 盤點調整日期起 (YYYY-MM-DD 字串)
  PST_Date_End?: string;     // 盤點調整日期迄 (YYYY-MM-DD 字串)
  PST_NO?: string;           // 盤點單號 (單選，模糊或精確)
  PLU_MagNo?: string;        // 商品管理編號 (單選，模糊或精確)
  IsOnlyShowDiff: boolean;   // 是否只顯示差異 (true: 只顯示盤差數量 ≠ 0, false: 顯示全部)

  pageIndex: number,
  pageSize: number,
  SortBy: SortMeta[]
}

/**
 * 盤點統計表 (明細) 單筆資料模型 (QueryTLS57150DetailResponse)
 */
export interface QueryTLS57150DetailResponse {
  PST_Date: string;           // 盤點調整日期
  HOS_No?: string;            // 倉別代碼
  LOGO_No?: string;           // 品牌代碼
  LOGO_CH_NAME?: string;      // 品牌名稱
  PST_NO: string;             // 盤點單號
  PLU_MagNo?: string;         // 商品管理編號
  PLU_NO?: string;            // 國際條碼
  PLU_OrgPLUNo?: string;      // 廠商貨號
  PLU_Name?: string;          // 品名
  DIFF_Qty: number;           // 盤差數量
  DIFF_AMT: number;           // 盤差成本
  DIFF_SalePrc: number;       // 盤差售價
}

/**
 * 盤點統計表 (彙總) 單筆資料模型 (QueryTLS57150SummaryResponse)
 */
export interface QueryTLS57150SummaryResponse {
  PST_Date: string;           // 盤點調整日期
  LOGO_No?: string;           // 品牌代碼
  LOGO_CH_NAME?: string;      // 品牌名稱
  PST_NO: string;             // 盤點單號
  DIFF_Qty: number;           // 盤差數量
  DIFF_AMT: number;           // 盤差成本
  DIFF_SalePrc: number;       // 盤差售價
}

/**
 * 盤點統計表 (明細) 總計模型 (GrandTotal)
 */
export interface QueryTLS57150DetailGrandTotal {
  DIFF_Qty: number;           // 盤差數量總計
  DIFF_AMT: number;           // 盤差成本總計
  DIFF_SalePrc: number;       // 盤差售價總計
}

/**
 * 盤點統計表 (彙總) 總計模型 (SummaryTotal)
 */
export interface QueryTLS57150SummaryTotal {
  DIFF_Qty: number;           // 盤差數量總計
  DIFF_AMT: number;           // 盤差成本總計
  DIFF_SalePrc: number;       // 盤差售價總計
}

export interface QueryTLS57150DetailSubTotal {
  PST_Date: string;        // 群組鍵 1
  LOGO_No?: string;        // 群組鍵 2
  PST_NO: string;          // 群組鍵 3
  DIFF_Qty: number;        // 盤差數量小計
  DIFF_AMT: number;        // 盤差成本小計
  DIFF_SalePrc: number;    // 盤差售價小計
}

/**
 * API 回傳給前端的資料模型 (包裹了明細或彙總資料)
 */
export interface QueryTLS57150ApiResponse {
  DetailData?: QueryTLS57150DetailResponse[]; // 明細報表數據 (當 ReportType 為 '明細' 時填充)
  SummaryData?: QueryTLS57150SummaryResponse[]; // 彙總報表數據 (當 ReportType 為 '彙總' 時填充)
  GrandTotal?: QueryTLS57150DetailGrandTotal; // 明細總計
  SummaryTotal?: QueryTLS57150SummaryTotal; // 彙總總計
  SubTotals?: QueryTLS57150DetailSubTotal[]; // 當 ReportType 為 '明細' 時填充
}

export interface QueryTLS57150MappedResult {
  Data: QueryTLS57150DetailResponse[] | QueryTLS57150SummaryResponse[];
  TotalCount: number;
  Message: string;
  GrandTotal: QueryTLS57150DetailGrandTotal | QueryTLS57150SummaryTotal | undefined;
  SubTotals?: QueryTLS57150DetailSubTotal[];
}

@Injectable({
  providedIn: 'root'
})
export class Tls57150Service {
  // 根據 Swagger，API 路徑為 /TLS0000/TLS57150
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS57150`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢盤點統計表資料的 API 呼叫
   * @param body 統一的查詢請求物件 (QueryTLS57150Request)
   * @returns 包含表格數據和總計資訊的物件
   */
  queryTLS57150(body: QueryTLS57150Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57150`, body).pipe(
      map(res => {
        // 根據 ReportType 取得對應的數據列表 (DetailData 或 SummaryData)
        const data = body.ReportType === '明細' ? res.Data.DetailData : res.Data.SummaryData;

        // 根據 ReportType 取得對應的總計數據 (GrandTotal 或 SummaryTotal)
        const grandTotal = body.ReportType === '明細' ? res.Data.GrandTotal : res.Data.SummaryTotal;
        const subTotals = body.ReportType === '明細' ? res.Data.SubTotals : undefined;
        return {
          Data: data,
          TotalCount: res.TotalCount,
          Message: res.Message,
          GrandTotal: grandTotal,
          SubTotals: subTotals, //  新增回傳 SubTotals
        } as QueryTLS57150MappedResult; //  強制轉換型別
      })
    );
  }

  /**
   * 匯出盤點統計報表 (PDF) 的 API 呼叫
   * @param body 統一的匯出請求物件 (QueryTLS57150Request)
   * @returns 包含 PDF 檔案的 Blob 物件
   */
  exportTLS57150PDF(
    body: QueryTLS57150Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS57150PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob' // 預期回傳檔案的 Blob 格式
      }
    );
  }

  /**
   * 匯出盤點統計報表 (Excel) 的 API 呼叫
   * @param body 統一的匯出請求物件 (QueryTLS57150Request)
   * @returns 包含 Excel 檔案的 Blob 物件
   */
  exportTLS57150Excel(
    body: QueryTLS57150Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS57150Excel`,
      body,
      {
        observe: 'response',
        responseType: 'blob' // 預期回傳檔案的 Blob 格式
      }
    );
  }
}
