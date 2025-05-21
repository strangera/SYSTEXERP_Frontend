import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

@Injectable({ providedIn: 'root' })
export class TLS13030Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * 查詢 TLS13030 主資料
   */
  queryTLS13030(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13030`, payload).pipe(
      tap((res) => console.log('查詢結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 刪除 TLS13030 資料
   */
  deleteTLS13030(idList: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS1000/deleteTLS13030`, { idList }).pipe(
      tap((res) => console.log('刪除結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 取得 APS1003 下拉選單資料
   */
  getAPS1003DropDownList(): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/queryTLS13030_APS1003_DropDownList`, {}).pipe(
      tap((res) => console.log('APS1003 下拉資料:', res)),
      catchError(this.errorHandler.handleError)
    );
  }
}
