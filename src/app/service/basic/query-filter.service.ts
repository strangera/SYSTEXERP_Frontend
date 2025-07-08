import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QueryFilterService {
  apiUrl: string = environment.ApiUrl;
  title: string = '查詢篩選';

  // 本地數據的查詢篩選選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '收銀機號為空' },
    { value: 2, label: '專櫃編號為空' },
    { value: 3, label: '專櫃編號不存在' },
    { value: 4, label: '交易流水號為空' },
    { value: 5, label: '銷售日期為空' },
    { value: 6, label: '銷售日期與請款日不同' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有查詢篩選選項（本地數據）
  getQueryFilters(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
