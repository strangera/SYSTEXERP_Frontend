import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS2B010Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // ✅ 查詢收銀員溢欠表(日) 詳細報表
  queryTLS2B010(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS2B010`, query).pipe(
      tap(response => console.log('查詢結果:', response)),
      
    );
  }

  // ✅ 查詢收銀員溢欠表(日) 簡表資料（群組後）
  simpleTLS2B010(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/simpleTLS2B010`, query).pipe(
      tap(response => console.log('簡表結果:', response)),
      
    );
  }

  // ✅ 取得最近關帳日期（如果你後端真的有這個 API）
// tls2-b010.service.ts
// tls2-b010.service.ts
getCloseDate(): Observable<any> {
 return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/GetTLS2C010Date`, {})
    .pipe(
      tap(res => console.log('關帳日期:', res)),
      catchError(this.errorHandler.handleError)
    );
}

}
