import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { TLS2B030Request, TLS2B030Row, ApiResponse, PayTypeItem } from '../../../pages/tls/tls2b030/tls2b030.model';

@Injectable({ providedIn: 'root' })
export class TLS2B030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS2B030(body: TLS2B030Request): Observable<ApiResponse<TLS2B030Row[]>> {
    return this.http.post<ApiResponse<TLS2B030Row[]>>(`${this.apiUrl}/queryTLS2B030`, body);
  }

  /** 取 SYS1000(FIN_PAY_Type) 清單，動態建欄用 */
  getPayTypes(): Observable<PayTypeItem[]> {
    const url = `${environment.ApiUrl}/querySYS1000_DropDownList`;
    return this.http
      .post<ApiResponse<PayTypeItem[]>>(url, { SYS_Type: 'FIN_PAY_Type' })
      .pipe(map(res => (res?.Status === '0000' ? (res?.Data ?? []) : [])));
  }

  /** ✅ 匯出 Excel：沿用查詢條件，不傳 pageIndex/pageSize */
  exportTLS2B030Excel(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS2B030`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }
}
