import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

export interface TLS57020Request {
  ACP_YYYYMM: string; // 結帳年月
  VEN_No?: string;    // 廠商編號
}

export interface Tls57020TableReportData {
  Header: any[];
  PaymentDetails: any[];
  PaymentFooters: any[];
  InvoiceDetails: any[];
}

@Injectable({
  providedIn: 'root'
})
export class Tls57020Service {
  // 修正 API 路由，根據 Swagger 的路徑定義
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢廠商請款單據相關資料
   * @param request 查詢參數 (包含 ACP_YYYYMM, VEN_No 等)
   * @returns 包含 Header, PaymentDetails, PaymentFooter, InvoiceDetails 的物件
   */
  queryTLS57020(request: TLS57020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryTLS57020`, request);
  }

  exportTLS57020PDF(
    body: TLS57020Request
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportTLS57020PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
  exportTLS57020Excel(
    body: TLS57020Request
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportTLS57020Excel`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
