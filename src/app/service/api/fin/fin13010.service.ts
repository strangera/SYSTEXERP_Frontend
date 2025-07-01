import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FIN13010Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  queryFIN13010(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/FIN13010/queryFIN13010`, query)
      .pipe(
        tap(res => console.log('查詢結果:', res)),
        catchError(error => this.errorHandler.handleError(error))
      );
  }
}
