import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataTypeService {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getDataOptions(): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS4000/queryTLS47010`, {}).pipe(
      map(res => res?.Data || []),
      tap(data => console.debug('getTLS47010TableOptions response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
