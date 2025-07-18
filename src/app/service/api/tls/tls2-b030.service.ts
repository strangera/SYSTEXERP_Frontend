import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS2B030Service {
  apiUrl: string = environment.ApiUrl;


  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS2B030(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS2B030`, query).pipe(
      tap(response => console.log('查詢結果:', response)),
      catchError((error) => this.errorHandler.handleError(error))  // ✅ 正確
    );
  }
}
