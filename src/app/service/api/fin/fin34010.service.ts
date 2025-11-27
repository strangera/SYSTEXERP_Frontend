import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

// 每列資料型別
export interface Fin34010Row {
  FactoryID: string;
  FactoryName: string;
  SubjectName: string;
  EstablishDate: string; // yyyy-MM-dd
  AccountAmt: number;
  PayAmt: number;
  AdjustAmt: number;
  BalanceAmt: number;
  [key: string]: any;
}

// Request 型別
export interface Fin34010Request {
  startFactoryID?: string;
  endFactoryID?: string;
  startEstablishDate?: string;
  endEstablishDate?: string;
  startSubjectID?: string;
  endSubjectID?: string;
  display?: number;
  showUp?: number;
  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: 1 | -1 }[];
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin34010Service {
  // 這裡請對應實際 Controller 路徑
  private apiUrl = `${environment.ApiUrl}/FIN3000/FIN34010`;

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

  /** 匯出 Excel：沿用查詢條件，不傳 pageIndex/pageSize */
  exportFIN34010Excel(
    body: Fin34010Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportFIN34010`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }
}
