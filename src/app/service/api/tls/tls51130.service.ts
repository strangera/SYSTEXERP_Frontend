import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

@Injectable({ providedIn: 'root' })
export class TLS51130Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * 查詢 TLS51130 主資料
   */
  queryTLS51130(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS5000/queryTLS51130`, payload).pipe(
      tap(res => console.log('查詢結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 新增 TLS51130 資料
   */
  insertTLS51130(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS5000/insertTLS51130`, data).pipe(
      tap(res => console.log('新增結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 更新 TLS51130 資料
   */
  updateTLS51130(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS5000/updateTLS51130`, data).pipe(
      tap(res => console.log('更新結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 刪除 TLS51130 資料
   */
  deleteTLS51130(idList: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS5000/deleteTLS51130`, { idList }).pipe(
      tap(res => console.log('刪除結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }
}
