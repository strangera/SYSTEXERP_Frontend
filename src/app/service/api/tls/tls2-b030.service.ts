import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
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
    return this.http
      .post<ApiResponse<TLS2B030Row[]>>(`${this.apiUrl}/queryTLS2B030`, body)
      .pipe(
      // 開發期想看 payload/response 再開啟
      // tap(res => console.log('TLS2B030 查詢結果:', res)),

    );
  }
  /** 取 SYS1000(FIN_PAY_Type) 清單，動態建欄用 */
  getPayTypes(): Observable<PayTypeItem[]> {
    // ⬇⬇ 路徑請照你實際 API 調整（若是同個 Controller，也可能是 `${this.apiUrl}/querySYS1000_DropDownList`）
    const url = `${environment.ApiUrl}/querySYS1000_DropDownList`;
    return this.http
      .post<ApiResponse<PayTypeItem[]>>(url, { SYS_Type: 'FIN_PAY_Type' })
      .pipe(
        map(res => (res?.Status === '0000' ? (res?.Data ?? []) : []))
      );
  }
}
