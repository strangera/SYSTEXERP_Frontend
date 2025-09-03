import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { ApiResponse, TLS23040Grouped } from '../../../pages/tls/tls23040/tls23040.model';

@Injectable({ providedIn: 'root' })
export class TLS23040Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

   queryTLS23040(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23040`;

    return this.http.post<any>(url, body).pipe(
      tap(response => console.log(`🎯 TLS23040  查詢結果:`, response)),
      
    );
  }
}
