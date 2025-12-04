import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

// 查詢參數 Model
export interface TLS32010QueryRequest extends BaseQueryRequest {
  // 報表類型
  reportType?: string; // 報表類型

  // 日期查詢條件
  sad_startdate?: string; // 區間開始日期 - ISO 格式
  sad_enddate?: string; // 區間結束日期 - ISO 格式
  eventID?: string; // 活動ID
  event_startdate?: string; // 活動開始日期 - ISO 格式
  event_enddate?: string; // 活動結束日期 - ISO 格式

  // 合約查詢條件
  floor?: string; // 樓層
  region?: string; // 區域
  bus_type?: string; // 大分類/中分類
  tlt_kind?: string; // 櫃別
  tlt_term_type?: string; // 抽成別
  org_id?: string; // 組織代號
  tlt_no?: string; // 專櫃編號
  tax?: boolean; // 是否含稅
}

// 查詢結果 Model
export interface TLS32010Data {
  館別: string,
  組織名稱: string,
  櫃別名稱: string,
  專櫃編號: string,
  櫃位名稱: string,
  位置編號: string,
  坪數: string,
  營業目標: string,
  營業實績: string,
  交易筆數: string,
  客單價: string,
  月坪效: string,
  達成率: string,
  坪數_排名: string,
  營業目標_排名: string,
  營業實績_排名: string,
  交易筆數_排名: string,
  客單價_排名: string,
  月坪效_排名: string,
  達成率_排名: string,
}

@Injectable({
  providedIn: 'root'
})
export class TLS32010Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢櫃位營業報表資料
  queryTLS32010(data: TLS32010QueryRequest): Observable<BaseQueryResponse<TLS32010Data>> {
    return this.http.post<BaseQueryResponse<TLS32010Data>>(this.apiUrl + '/queryTLS32010', data);
  }

  /**
     * 匯出進貨/退貨單據統計報表 (PDF) 的 API 呼叫
     * 請求參數與查詢介面 (QueryTLS32010Request) 相同
     * @param body 統一的匯出請求物件 (QueryTLS32010Request)
     * @returns 包含 PDF 檔案的 Blob 物件
     */
  exportTLS32010PDF(
    body: TLS32010QueryRequest
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportTLS32010PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
  /**
   * 匯出進貨/退貨單據統計報表 (Excel) 的 API 呼叫
   * 請求參數與查詢介面 (QueryTLS32010Request) 相同
   * @param body 統一的匯出請求物件 (QueryTLS32010Request)
   * @returns 包含 Excel 檔案的 Blob 物件
   */
  exportTLS32010Excel(
    body: TLS32010QueryRequest
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportTLS32010Excel`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
