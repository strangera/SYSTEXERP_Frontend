import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentToolService {

  apiUrl: string = environment.ApiUrl
  title: string = '支付工具';
  
  // Payment tool options based on the image content
  options: any[] = [
    { value: 1, label: '現金' },
    { value: 2, label: '信用卡聯合' },
    { value: 3, label: '信用卡中信' },
    { value: 4, label: '會員折抵' },
    { value: 5, label: '禮券' },
    { value: 6, label: '禮券餘額卡' },
    { value: 7, label: '提貨單餘額卡' },
    { value: 8, label: '實體提貨單(應收帳款)' },
    { value: 9, label: '一卡通' },
    { value: 10, label: 'LINE PAY' },
    { value: 11, label: '商品提貨單' },
    { value: 12, label: '商品抵用券' },
    { value: 13, label: '外來提貨單(抵用券)' },
    { value: 14, label: '外來提貨券(抵用券)' },
    { value: 15, label: '商品券(省券)' },
    { value: 16, label: '折價券' },
    { value: 17, label: '現抵' },
    { value: 18, label: '國際抵用券' },
    { value: 19, label: 'APP抵用券' },
    { value: 20, label: 'APP提貨單' },
    { value: 21, label: '一卡通(停車場)' },
    { value: 22, label: 'LINE PAY(停車場)' },
    { value: 23, label: '信用卡中信(停車場)' },
    { value: 24, label: '收款機作廢藍票' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Get local payment tool options
  getPaymentToolOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // Fetch payment tool by ID
  getPaymentToolById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // Create a new payment tool
  createPaymentTool(paymentTool: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, paymentTool).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // Update an existing payment tool
  updatePaymentTool(id: number, paymentTool: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, paymentTool).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
