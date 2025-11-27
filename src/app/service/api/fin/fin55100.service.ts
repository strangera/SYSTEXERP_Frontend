import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設路徑
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * FIN55100 查詢請求參數 (與 FIN55090 相同)
 */
export interface QueryFIN55100Request {
  DateFrom: string; // YYYY-MM-DD
  DateTo: string; // YYYY-MM-DD
  Ledger_MD: '0' | '1'; // '0'=統制, '1'=明細
  OrgId: string | null; // 部門
  ProjectNo: string | null; // 活動代碼
  ShowZero: boolean; // 是否顯示餘額為零的科目
  PrintSign: boolean; // 是否列印簽核欄
}

/**
 * FIN55100 查詢回應單筆資料 (與 FIN55090 相同)
 */
export interface QueryFIN55100Response {
  LTYPE_ID: string | null; // 大類別代碼
  LTYPE_NAME: string | null; // 大類別名稱
  MTYPE_ID: string | null; // 中類別代碼
  MTYPE_NAME: string | null; // 中類別名稱
  STYPE_ID: string | null; // 科目代碼
  STYPE_NAME: string | null; // 科目名稱
  Cur_AMT: number | string; // 當期金額
  Cur_LTYPE_SUM: number | string; // 當期類別總計
  Cur_PERCENT: number | null; // 當期百分比 (%)
  YTD_AMT: number | string; // 累計金額 (年度起)
  YTD_LTYPE_SUM: number | string | null; // 累計類別總計
  YTD_PERCENT: number | null; // 累計百分比 (%)
  Sign_Line1: string | null;
  // ... 其他簽核欄位
}

// 由於後端 FileResult 回傳的是 byte[]，我們前端用 Blob 包裹的 HttpResponse<Blob> 接收
export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Fin55100Service {
  // API 的基礎路徑 (假設與 FIN55090 相同的前綴)
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢預算損益比較表資料 (FIN55100)
   * @param request 查詢請求參數
   * @returns 損益表資料列表
   */
  queryFIN55100(request: QueryFIN55100Request): Observable<ApiResponse<QueryFIN55100Response[]>> {
    return this.http.post<ApiResponse<QueryFIN55100Response[]>>(`${this.apiUrl}/queryFIN55100`, request);
  }

  /**
   * 匯出預算損益比較表檔案 (PDF)
   * @param request 查詢請求參數
   * @returns 報表檔案的位元組陣列 (透過 HttpResponse<Blob> 接收)
   */
  exportFIN55100PDF(request: QueryFIN55100Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportFIN55100PDF`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
