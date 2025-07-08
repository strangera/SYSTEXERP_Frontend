import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TxnStatusService {

  apiUrl: string = environment.ApiUrl;
  title: string = '交易狀態';

  options: any[] = [
    { value: 'N', label: '正常交易' },
    { value: 'C', label: '交易取消' },
    { value: 'D', label: '發票作廢' },
    { value: 'E', label: '隔日發票作廢' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getTxnStatusOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get txn status options', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getTxnStatusById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createTxnStatus(status: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, status).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateTxnStatus(id: string, status: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, status).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
