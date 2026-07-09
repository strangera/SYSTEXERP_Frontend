import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 假設路徑
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // 假設路徑
/**
 * FIN55080 查詢請求參數
 */
export interface QueryFIN55080Request {
  DateFrom: string; // YYYY-MM-DD (起始日期)
  DateTo: string; // YYYY-MM-DD (結束日期)
  Ledger_MD: '0' | '1'; // '0'=統制, '1'=明細
  OrgId: string | null; // 部門 (選填)
  IsCludeDownOrg: 'Y' | 'N'; // 是否含下層部門 (選填)
  ProjectNo: string | null; // 活動代碼 (選填)
  ShowZero: boolean; // 是否顯示餘額為零的科目 (Component 統一用 boolean)
  PrintSign: boolean; // 是否列印簽核欄 (Component 統一用 boolean)
}

/**
 * FIN55080 查詢回應單筆資料
 */
export interface QueryFIN55080Response {
  LTYPE_ID: string | null; // 大類別代碼 (例如: 營業收入)
  LTYPE_NAME: string | null; // 大類別名稱
  MTYPE_ID: string | null; // 中類別代碼
  MTYPE_NAME: string | null; // 中類別名稱
  STYPE_ID: string | null; // 科目代碼
  STYPE_NAME: string | null; // 科目名稱
  STYPE_AMT: number | string | null; // 損益表金額 (對應當期或累計單一數字)
  SUM_LTYPE_AMT: number | string | null; // 類別總計金額
  Percent_LTYPE: number | string | null; // 佔類別總計百分比 (%)
  Sign_Line1: string | null;
  Sign_Line2: string | null;
  Sign_Line3: string | null;
  Sign_Line4: string | null;
  Sign_Line5: string | null;
  // ... 其他簽核欄位
}

// 匯出檔案的標準回應型別
export type ExportFileResponse = HttpResponse<Blob>;
@Injectable({
  providedIn: 'root'
})
export class Fin55080Service {
  // 假設 API 的基礎路徑與 FIN55090 相同
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢損益表資料
   * @param request 查詢請求參數
   * @returns 損益表資料列表
   */
  queryFIN55080(request: QueryFIN55080Request): Observable<ApiResponse<QueryFIN55080Response[]>> {
    // API 路徑: /FIN0000/GLS1000/queryFIN55080
    return this.http.post<ApiResponse<QueryFIN55080Response[]>>(`${this.apiUrl}/queryFIN55080`, request);
  }

  /**
   * 匯出損益表檔案 (PDF)
   * @param request 查詢請求參數
   * @returns 報表檔案的位元組陣列 (透過 HttpResponse<Blob> 接收)
   */
  exportFIN55080PDF(request: QueryFIN55080Request): Observable<ExportFileResponse> {
    // 假設匯出 API 路徑為 /FIN0000/GLS1000/exportFIN55080PDF
    return this.http.post(`${this.apiUrl}/exportFIN55080PDF`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  /**
   * 匯出損益表檔案 (Excel)
   * @param request 查詢請求參數
   * @returns 報表檔案的位元組陣列 (透過 HttpResponse<Blob> 接收)
   */
  exportFIN55080(request: QueryFIN55080Request): Observable<ExportFileResponse> {
    // 假設匯出 API 路徑為 /FIN0000/GLS1000/exportFIN55080PDF
    return this.http.post(`${this.apiUrl}/exportFIN55080Execl`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
