import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { TLS2B030Request, TLS2B030Row, ApiResponse } from '../../../pages/tls/tls2b030/tls2b030.model';

@Injectable({ providedIn: 'root' })
export class TLS2B030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  queryTLS2B030(body: TLS2B030Request): Observable<ApiResponse<TLS2B030Row[]>> {
    return this.http
      .post<ApiResponse<TLS2B030Row[]>>(`${this.apiUrl}/queryTLS2B030`, body)
      .pipe(
        // 開發期想看 payload/response 再開啟
        // tap(res => console.log('TLS2B030 查詢結果:', res)),
        catchError((error) => this.errorHandler.handleError(error))
      );
  }
}
