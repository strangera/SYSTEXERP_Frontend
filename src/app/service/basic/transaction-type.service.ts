import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '交易型態';

  // 本地數據的交易型態選項
  options: any[] = [
    { value: 1, label: '一般交易' },
    { value: 2, label: '退貨交易' },
    { value: 3, label: '作廢交易' },
    // 根據圖片可見的交易型態繼續添加
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有交易型態（本地數據）
  getTransactionTypes(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
