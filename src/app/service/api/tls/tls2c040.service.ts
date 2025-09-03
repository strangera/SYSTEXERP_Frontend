import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS2C040Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  queryTLS2C040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS2C040`, data).pipe(
      tap(response => console.log('查詢結果:', response)),
      
    );
  }
}
