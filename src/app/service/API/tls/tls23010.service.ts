import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

@Injectable({ providedIn: 'root' })
export class TLS23010Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  queryTLS23010(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010`;
return this.http.post<any>(url, body).pipe(
  tap(res => console.log('🎯 TLS23010 查詢結果:', res)),
  catchError((error) => this.errorHandler.handleError(error))  // ✅ 正確
);
  }
}
