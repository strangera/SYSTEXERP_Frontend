import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreditCardInputStatusService {
  apiUrl: string = environment.ApiUrl;
  title: string = '信用卡輸入狀態';

  // 本地數據的信用卡輸入狀態選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '手刷補登' },
    { value: 2, label: '轉檔' },
    { value: 3, label: '調整補登' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有信用卡輸入狀態（本地數據）
  getCreditCardInputStatuses(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
