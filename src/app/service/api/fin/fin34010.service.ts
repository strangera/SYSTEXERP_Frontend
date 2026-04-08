import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

// 每列資料型別 (對應後端回傳)
export interface Fin34010Row {
  ARS_Date: string;      // 立帳日期
  VEN_No: string;        // 客戶/廠商編號
  VEN_Name: string;      // 客戶/廠商名稱
  ARS_No: string;        // 應收帳款單號
  AccNo: string;         // 科目代號
  ARS_Amt: number;       // 帳款金額
  REC_Amt: number;       // 收款金額
  ADJ_Amt: number;       // 調整金額
  Unpaid_Amt: number;    // 未收金額
  [key: string]: any;
}

// Request 型別 (命名以後端為主)
export interface Fin34010Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[]; // 後端 sample 是 0/1，這裡用 number

  ARSDateFrom?: string;   // 2025-11-27T...
  ARSDateTo?: string;
  VEN_No?: string;
  AccNo?: string;
  ShowArsAmt?: string;    // 顯示應收金額 (1:顯示 / 2:不顯示 等… 視後端定義)
  ShowZeroAmt?: string;   // 帳款餘額為零是否顯示 (1/2)

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin34010Service {
  // 對應後端 Controller: /FIN0000/ARS1000
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  /** 查詢應收帳款明細表 */
  queryFIN34010(
    body: Fin34010Request
  ): Observable<ApiResponse<Fin34010Row[]>> {
    return this.http.post<ApiResponse<Fin34010Row[]>>(
      `${this.apiUrl}/queryFIN34010`,
      body
    );
  }

  /** 匯出 Excel：與查詢 request 相同，但不傳 PageSize / PageIndex */
  exportFIN34010Excel(
    body: Fin34010Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportFIN34010Excel`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF：與查詢 request 相同，但不傳 PageSize / PageIndex */
  exportFIN34010PDF(
    body: Fin34010Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportFIN34010PDF`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }
}
export { ApiResponse };

