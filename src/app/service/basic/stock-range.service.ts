import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockRangeService {
  apiUrl: string = environment.ApiUrl + '/stockRange';
  title: string = '顯示庫存範圍';
  options: any[] = [
    { value: 1, label: '全顯示' },
    { value: 2, label: '僅顯示不為零庫存' },
    { value: 3, label: '僅顯示零庫存' },
    { value: 4, label: '僅顯示負庫存' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getStockRangeOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get stock range options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    /*
    If you want to fetch options from an API:
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.debug('get response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    */
  }

  getStockRangeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createStockRange(stockRange: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, stockRange).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateStockRange(id: string, stockRange: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, stockRange).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
