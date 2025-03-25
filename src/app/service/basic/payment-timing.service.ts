import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentTimingService {
  apiUrl: string = environment.ApiUrl;
  title: string = '繳袋時機';

  // 本地數據的繳袋時機選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '中途繳款' },
    { value: 2, label: '清帳繳袋' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 獲取所有繳袋時機（本地數據）
  getPaymentTiming(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
