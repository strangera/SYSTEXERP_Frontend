import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiveItemService {
  apiUrl: string = environment.ApiUrl;
  title: string = '收款項目';
  options: any[] = [
    { value: 1, label: '兆豐東台南/110301' },
    { value: 2, label: '中國信託/110303' },
    { value: 3, label: '應收票據-專櫃' },
    { value: 4, label: '應收票據-自營' },
    { value: 5, label: '應收票據-租金' },
    { value: 6, label: '應收票據-其他' },
    { value: 7, label: '應收票據-關係人' },
    { value: 8, label: '台新銀行(活)' },
    { value: 9, label: '預收款項-其他' },
    { value: 10, label: '玉山銀行(活)' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getReceiveItems(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getReceiveItemId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createReceiveItem(regionCode: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, regionCode).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateReceiveItem(id: number, regionCode: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, regionCode).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
