import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設路徑
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * FIN55120 查詢請求參數 (與 FIN55090 相同)
 */
export interface QueryFIN55120Request {
  YM: string;
  Category: '1' | '2' | '3';
  PrintSign: 1 | 0;
  ShowZero: 1 | 0;
}

/**
 * FIN55120 查詢回應單筆資料 (與 FIN55090 相同)
 */
export interface QueryFIN55120Response {
  ItemTitle: string | null;
  AccNo: string | null;
  AccCName: string | null;
  Balance: number | null;
  Pct: number | null;
}

// 由於後端 FileResult 回傳的是 byte[]，我們前端用 Blob 包裹的 HttpResponse<Blob> 接收
export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Fin55120Service {
  // API 的基礎路徑 (假設與 FIN55090 相同的前綴)
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢預算損益比較表資料 (FIN55120)
   * @param request 查詢請求參數
   * @returns 損益表資料列表
   */
  queryFIN55120(request: QueryFIN55120Request): Observable<ApiResponse<QueryFIN55120Response[], QueryFIN55120Response>> {
    return this.http.post<ApiResponse<QueryFIN55120Response[], QueryFIN55120Response>>(`${this.apiUrl}/queryFIN55120`, request);
  }

  /**
   * 匯出預算損益比較表檔案 (PDF)
   * @param request 查詢請求參數
   * @returns 報表檔案的位元組陣列 (透過 HttpResponse<Blob> 接收)
   */
  exportFIN55120PDF(request: QueryFIN55120Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportFIN55120PDF`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /**
   * 匯出預算損益比較表檔案 (Excel)
   * @param request 查詢請求參數
   * @returns 報表檔案的位元組陣列 (透過 HttpResponse<Blob> 接收)
   */
  exportFIN55120Excel(request: QueryFIN55120Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportFIN55120PDF`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
