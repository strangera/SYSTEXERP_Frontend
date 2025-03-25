import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TicketStatusService {
  apiUrl: string = environment.ApiUrl;
  title: string = '券類(己開/未開)';

  // 本地數據的券類狀態選項
  options: any[] = [
    { value: 1, label: '全部' },
    { value: 2, label: '己開券類' },
    { value: 3, label: '未開券類' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getTicketStatuses(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
