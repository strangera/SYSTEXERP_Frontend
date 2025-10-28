import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

// 請求主體的介面 (與匯出共用)
// 為了遵循 API 規範，我們需要將 QueryFIN55070Request 擴充，納入分頁/排序參數。
// 由於您提供的匯出 API Schema 包含 PageSize, PageIndex, OrderBy 等，我們假設 QueryFIN55070Request 應該是包含這些參數的。
// 這裡我們定義一個 ExportRequest 介面，它包含 QueryFIN55070Request 的參數以及分頁和排序參數。

export interface SortBy {
  field: string;
  order: number;
}

export interface ExportFIN55070Request {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: SortBy[];

  DateFrom: string; 
  DateTo: string;
  Ledger_MD?: string;
  OrgId?: string;
  AccNoFrom?: string;
  AccNoTo?: string;
  ShowAll: boolean;
  PrintSign: boolean;
}

// 假設原有的 queryFIN55070 是基於此介面，為了簡潔，我們將其視為 ExportFIN55070Request 的子集
export interface QueryFIN55070Request {
  /** 起日（含） */
  DateFrom: string; // 或 Date，視前端使用方式而定

  /** 迄日（含） */
  DateTo: string; // 或 Date

  /** 科目層級 ('0'=統制, '1'=明細, NULL=全部) */
  Ledger_MD?: string;

  /** 部門/組織代號 (NULL/空字串=全部) */
  OrgId?: string;

  /** 科目起號 */
  AccNoFrom?: string;

  /** 科目迄號 */
  AccNoTo?: string;

  /** 是否顯示全部 (1=全顯示；0=金額全為0則隱藏) */
  ShowAll: boolean;

  /** 是否顯示簽核欄 (1=顯示；0=不顯示) */
  PrintSign: boolean;
}

export interface FIN55070Data {
  /** 科目代號 */
  AccNo: string;

  /** 科目名稱 */
  AccCname: string;

  /** 前期 借方金額 */
  Prior_DAmt: number;

  /** 前期 貸方金額 */
  Prior_CAmt: number;

  /** 本期 借方金額 */
  Curr_DAmt: number;

  /** 本期 貸方金額 */
  Curr_CAmt: number;

  /** 累積 借方金額 */
  Total_DAmt: number;

  /** 累積 貸方金額 */
  Total_CAmt: number;
}


@Injectable({
  providedIn: 'root'
})
export class Fin55070Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(
    private http: HttpClient
  ) { }

  // 1. 查詢 API (原有的邏輯)
  queryFIN55070(data: QueryFIN55070Request): Observable<ApiResponse<FIN55070Data[]>> {
    return this.http.post<ApiResponse<FIN55070Data[]>>(`${this.apiUrl}/queryFIN55070`, data).pipe(
      map(response => ({
        ...response,
        Data: response.Data.map((item) => ({
          ...item,
        })),

      }))
    );
  }

  // 2. 匯出 PDF API
  /**
   * 匯出 FIN55070 報表為 PDF 檔案
   * @param data 查詢參數 (包含篩選條件、分頁資訊等)
   * @returns Observable<Blob> PDF 檔案的二進制資料
   */
  exportFIN55070PDF(data: ExportFIN55070Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN55070PDF`, data, {
      observe: 'response',
      responseType: 'blob' // <--- 關鍵：設定回傳類型為 Blob
    });
  }

  // 3. 匯出 Excel API
  /**
   * 匯出 FIN55070 報表為 Excel 檔案
   * @param data 查詢參數 (包含篩選條件、分頁資訊等)
   * @returns Observable<Blob> Excel 檔案的二進制資料
   */
  exportFIN55070Excel(data: ExportFIN55070Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN55070Excel`, data, {
      observe: 'response',
      responseType: 'blob' // <--- 關鍵：設定回傳類型為 Blob
    });
  }
}
