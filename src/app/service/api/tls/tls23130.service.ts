import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TLS23130Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 既有：TLS23130 查詢
  queryTLS23130(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23130`, query)
      .pipe(
        tap(res => console.log('查詢結果:', res)),
        catchError(err => this.errorHandler.handleError(err))
      );
  }

  // ✅ 新增：APS1001 下拉清單
  // 可傳入查詢條件（若無就給空物件）
  queryAPS1001_DropDownList(body: any = {}): Observable<any> {
    const url = `${this.apiUrl}/queryAPS1001NoBranch_DropDownList`;
    return this.http.post<any>(url, body).pipe(
      tap(res => console.log('[DDL] APS1001:', res)),
      catchError(err => this.errorHandler.handleError(err))
    );
  }
}
