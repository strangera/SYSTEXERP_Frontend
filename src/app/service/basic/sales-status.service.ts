import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesStatusService {
  apiUrl: string = environment.ApiUrl;
  title: string = '銷售狀況';

  // 本地數據的銷售狀況選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '一般銷售' },
    { value: 2, label: '退貨銷售' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有銷售狀況（本地數據）
  getSalesStatus(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
