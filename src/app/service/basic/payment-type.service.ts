import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '付款別';

  // 本地數據的付款別選項
  options: any[] = [
    { value: '0', label: '信用卡' },
    { value: '1', label: '現金' },
    { value: '2', label: '非信用卡' },
    { value: '5', label: '銷退單' },
    { value: '6', label: '禮券' },
    { value: '7', label: '分期付款' },
    { value: '8', label: '金融卡' },
    { value: 'A', label: '應收帳款' },
    { value: 'B', label: '抵用券' },
    { value: 'C', label: '紅利點' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getPaymentTypes(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
