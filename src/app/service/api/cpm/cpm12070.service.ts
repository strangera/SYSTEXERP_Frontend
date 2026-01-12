import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

export interface CPM12070Request {
  query: string;
}

export interface CPM12070Response {
  id: number;
  name: string;
}

export interface InsertCPM12070Request {
  name: string;
}

export interface UpdateCPM12070Request {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Cpm12070Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  queryCPM12070(body: CPM12070Request): Observable<ApiResponse<CPM12070Response[]>> {
    return this.http.post<ApiResponse<CPM12070Response[]>>(`${this.apiUrl}/queryCPM12070`, body);
  }

  insertCPM12070(body: InsertCPM12070Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertCPM12070`, body);
  }

  updateCPM12070(body: UpdateCPM12070Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateCPM12070`, body);
  }

  /**
   * 匯出進貨/退貨單據統計報表 (PDF) 的 API 呼叫
   * 請求參數與查詢介面 (QueryCPM12070Request) 相同
   * @param body 統一的匯出請求物件 (QueryCPM12070Request)
   * @returns 包含 PDF 檔案的 Blob 物件
   */
  exportCPM12070PDF(
    body: CPM12070Request
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportCPM12070PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
  /**
   * 匯出進貨/退貨單據統計報表 (Excel) 的 API 呼叫
   * 請求參數與查詢介面 (QueryCPM12070Request) 相同
   * @param body 統一的匯出請求物件 (QueryCPM12070Request)
   * @returns 包含 Excel 檔案的 Blob 物件
   */
  exportCPM12070Excel(body: CPM12070Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM12070Excel`, body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
