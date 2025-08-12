import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23010Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS23010(body: any, displayMode: 'Detail' | 'Summary' = 'Detail'): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010`;

    return this.http.post<any>(url, body).pipe(
      tap(response => console.log(`🎯 TLS23010 ${displayMode} 查詢結果:`, response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }

  // ✅ 新增：點展開才打的明細 API
  queryTLS23010Detail(body: {
    SYS_StoreNo: string;
    TXN_Date: string;
    ECR_No: string;
    TXN_No: number;
  }): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010_Detail`;
    return this.http.post<any>(url, body).pipe(
      tap(r => console.log('🎯 TLS23010 明細查詢結果:', r)),
      catchError(err => this.errorHandler.handleError(err))
    );
  }
}
