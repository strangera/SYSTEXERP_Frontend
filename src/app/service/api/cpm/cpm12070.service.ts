import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service'; // 延用專案定義

/** 查詢與報表請求介面 */
export interface CPM12070Request {
  KIND_IDs?: string;       // 類別多選 (逗號分隔)
  DATE_FROM?: string;      // 查詢起始日期
  DATE_TO?: string;        // 查詢結束日期
  PageIndex: number;
  PageSize: number;
  SortBy: SortMeta[];
}

/** 查詢回傳單筆資料介面 */
export interface CPM12070Response {
  RowNum: number;
  KIND_ID: string;
  KIND_Name: string;
  TotalCount: number;
  DoneCount: number;
  PendingCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class Cpm12070Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) { }

  /** 查詢統計資料 */
  queryCPM12070(body: CPM12070Request): Observable<any> {
    return this.http.post<ApiResponse<CPM12070Response[]>>(`${this.apiUrl}/queryCPM12070`, body).pipe(
      map(res => {
        return {
          Data: res.Data,
          TotalCount: res.TotalCount,
          TotalPage: res.TotalPage,
          Message: res.Message
        };
      })
    );
  }

  /** 匯出 PDF */
  exportCPM12070PDF(body: Partial<CPM12070Request>): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM12070`, { ...body, ExportType: 'PDF' }, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /** 匯出 Excel */
  exportCPM12070Excel(body: Partial<CPM12070Request>): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM12070`, { ...body, ExportType: 'EXCEL' }, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
