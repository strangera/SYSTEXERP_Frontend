import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentToolTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '支付工具別';

  // 本地數據的支付工具別選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '現金' },
    { value: 2, label: '信用卡' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 獲取所有支付工具別（本地數據）
  getPaymentToolTypes(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
