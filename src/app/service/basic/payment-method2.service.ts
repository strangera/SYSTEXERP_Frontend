import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethod2Service {

  apiUrl: string = environment.ApiUrl;
  title: string = '付款方式';
  options: any[] = [
    { value: 1, label: '匯款' },
    { value: 2, label: '支票' },
    { value: 3, label: '現金' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getPaymentMethods(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getPaymentMethodById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createPaymentMethod(paymentMethod: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, paymentMethod).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updatePaymentMethod(id: number, paymentMethod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, paymentMethod).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
