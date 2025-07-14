import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class TLS14020Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS14020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS14020`, data).pipe(
      tap(response => console.log('查詢結果:', response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }
  exportTLS14020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportTLS14020`, data).pipe(
      tap(response => console.log('查詢結果:', response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }
}
