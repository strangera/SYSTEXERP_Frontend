import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS47010Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // ✅ 查詢收銀機資料
  queryTLS47010(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS47010/queryTLS47010`, query).pipe(
      tap(res => console.log('查詢結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // ✅ 新增（若有）
  insertTLS47010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS4000/insertTLS47010`, data).pipe(
      tap(res => console.log('新增結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // ✅ 更新（若有）
  updateTLS47010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS47010/updateTLS47010`, data).pipe(
      tap(res => console.log('更新結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // ✅ 明細查詢（若需要）
  queryTLS47010Detail(param: { ID: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS47010/queryTLS47010Detail`, param).pipe(
      tap(res => console.log('明細查詢結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // ✅ 對應查詢（若需要）
  queryTLS47010Correspond(param: { CorrespondKey: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS47010/queryTLS47010Correspond`, param).pipe(
      tap(res => console.log('對應查詢結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }
}
