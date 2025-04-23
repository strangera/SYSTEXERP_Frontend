import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { catchError, Observable, tap } from 'rxjs';

// 查詢參數介面（可選，未來優化時使用）
export interface BigCategoryQuery {
  CAT_LNo?: string;
  CAT_LName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TLS5000Service {
  // API 主網址會被自動加上環境變數前綴
  apiUrl: string = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 查詢 POS20031
  queryPOS20031(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryPOS20031`, data).pipe(
      tap((data) => console.debug('TLS5000 queryPOS20031 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

}
