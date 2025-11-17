import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS2B010Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // ✅ 查詢 - 明細
  queryTLS2B010(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS2B010`, query).pipe(
      tap(response => console.log('查詢結果:', response)),
    );
  }

  // ✅ 查詢 - 簡表
  simpleTLS2B010(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/simpleTLS2B010`, query).pipe(
      tap(response => console.log('簡表結果:', response)),
    );
  }

  // ✅ 取得最近關帳日期
  getCloseDate(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/GetTLS2C010Date`, {})
      .pipe(
        tap(res => console.log('關帳日期:', res)),
        catchError(this.errorHandler.handleError)
      );
  }

  // -------------------- 匯出（明細） --------------------
  exportTLS2B010Excel(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/TLS0000/TLS2000/exportTLS2B010`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }

  exportTLS2B010PDF(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/TLS0000/TLS2000/exportTLS2B010PDF`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }

  // -------------------- 匯出（簡表，若你後端有開）--------------------
  exportTLS2B010SimpleExcel(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/TLS0000/TLS2000/exportTLS2B010_Simple`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }

  exportTLS2B010SimplePDF(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/TLS0000/TLS2000/exportTLS2B010_SimplePDF`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }
}
