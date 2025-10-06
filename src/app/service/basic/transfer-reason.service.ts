import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransferReasonService {
  apiUrl: string = environment.ApiUrl;
  title: string = '調撥原因';
  options: any[] = [
    { value: 1, label: '庫存過高' },
    { value: 2, label: '同業調貨' },
    { value: 3, label: '同業缺貨' },
    // Add more options as needed
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getTransferReasons(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    /*
    // Uncomment if you need to fetch data from API
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.debug('get response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    */
  }

  getTransferReasonById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap((data) => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createTransferReason(transferReason: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, transferReason).pipe(
      tap((data) => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateTransferReason(id: number, transferReason: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, transferReason).pipe(
      tap((data) => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
