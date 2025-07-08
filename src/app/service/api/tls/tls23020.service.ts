import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23020Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS23020(body: any, displayMode: 'Detail' | 'Summary' = 'Detail'): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23020`;

    return this.http.post<any>(url, body).pipe(
      tap(response => console.log(`🎯 TLS23020 ${displayMode} 查詢結果:`, response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }
}
