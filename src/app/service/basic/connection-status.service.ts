import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService {
  apiUrl: string = environment.ApiUrl;
  title: string = '連線狀態';

  options: any[] = [
    { value: 'online', label: '連線' },
    { value: 'offline', label: '離線' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getConnectionStatusOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get connection status options', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
