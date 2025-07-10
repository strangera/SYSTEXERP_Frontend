import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class TLS11020Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) { }

  /** 查詢扣款項目資料 */
  queryTLS11020(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS11020`, payload).pipe(
      tap((res) => console.log('查詢結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 刪除扣款項目資料 */
  deleteTLS11020(idList: number[]) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/deleteTLS11020`, { idList }).pipe(
      tap((res) => console.log('刪除結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 新增扣款項目資料 */
  insertTLS11020(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/insertTLS11020`, payload).pipe(
      tap((res) => console.log('新增結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 更新扣款項目資料 */
  updateTLS11020(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/updateTLS11020`, payload).pipe(
      tap((res) => console.log('更新結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }
}
