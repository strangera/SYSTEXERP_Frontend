import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketPaymentService {
  apiUrl: string = environment.ApiUrl;
  title: string = '券別';
  options: any[] = [
    { value: 1, label: '禮券' },
    { value: 2, label: '禮券餘代卡' },
    { value: 3, label: '外來禮券(抵用券)' },
    { value: 4, label: '提貨單餘代卡' },
    { value: 5, label: '商品提貨單' },
    { value: 6, label: '商品抵用券' },
    { value: 7, label: '外來提貨單(抵用券)' },
    { value: 8, label: '活動券(自營)' },
    { value: 9, label: '折價券' },
    { value: 10, label: '現抵' },
    { value: 11, label: '感熱紙抵用券' },
    { value: 12, label: 'APP抵用券' },
    { value: 13, label: 'APP提貨單' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getTicketPayments(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    /*
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.debug('get response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    */
  }

  getTicketPaymentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createTicketPayment(systemType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, systemType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateTicketPayment(id: number, systemType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, systemType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
