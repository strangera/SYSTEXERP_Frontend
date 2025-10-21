import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

// 請求主體的介面 (與匯出共用)
// 為了遵循 API 規範，我們需要將 QueryFIN55020Request 擴充，納入分頁/排序參數。
// 由於您提供的匯出 API Schema 包含 PageSize, PageIndex, OrderBy 等，我們假設 QueryFIN55020Request 應該是包含這些參數的。
// 這裡我們定義一個 ExportRequest 介面，它包含 QueryFIN55020Request 的參數以及分頁和排序參數。

export interface SortBy {
  field: string;
  order: number;
}

export interface ExportFIN55020Request {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: SortBy[];
  VOUDATE_Start: string,
  VOUDATE_End: string,
  ORG_ID?: string,
  ProjectNo?: string,
  vouno?: string,
  DetailNo?: string,
  VOUCHER_KIND?: string,
  PostFlag?: string
}

// 假設原有的 queryFIN55020 是基於此介面，為了簡潔，我們將其視為 ExportFIN55020Request 的子集
export interface QueryFIN55020Request {
  VOUDATE_Start: string,
  VOUDATE_End: string,
  ORG_ID: string,
  ProjectNo: string,
  vouno: string,
  DetailNo: string,
  VOUCHER_KIND: string,
  PostFlag: string
}


export interface FIN55020Data {
  VouDate: string,
  VouNo: string,
  PostFlag: string,
  AccCName: string,
  ORG_ID: string,
  Org_Name: string,
  ProjectNo: string,
  NoteDesc: string,
  D_AMT: number,
  C_AMT: number,
  PTA: string
}

@Injectable({
  providedIn: 'root'
})
export class Fin55020Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(
    private http: HttpClient
  ) { }

  // 1. 查詢 API (原有的邏輯)
  queryFIN55020(data: QueryFIN55020Request): Observable<ApiResponse<FIN55020Data[]>> {
    return this.http.post<ApiResponse<FIN55020Data[]>>(`${this.apiUrl}/queryFIN55020`, data).pipe(
      map(response => ({
        ...response,
        Data: response.Data.map((item) => ({
          ...item,
          D_AMT: item.D_AMT ?? null,
          C_AMT: item.C_AMT ?? null,
        })),

      }))
    );
  }

  // 2. 匯出 PDF API
  /**
   * 匯出 FIN55020 報表為 PDF 檔案
   * @param data 查詢參數 (包含篩選條件、分頁資訊等)
   * @returns Observable<Blob> PDF 檔案的二進制資料
   */
  exportFIN55020PDF(data: ExportFIN55020Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN55020PDF`, data, {
      observe: 'response',
      responseType: 'blob' // <--- 關鍵：設定回傳類型為 Blob
    });
  }

  // 3. 匯出 Excel API
  /**
   * 匯出 FIN55020 報表為 Excel 檔案
   * @param data 查詢參數 (包含篩選條件、分頁資訊等)
   * @returns Observable<Blob> Excel 檔案的二進制資料
   */
  exportFIN55020Excel(data: ExportFIN55020Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN55020Excel`, data, {
      observe: 'response',
      responseType: 'blob' // <--- 關鍵：設定回傳類型為 Blob
    });
  }
}
