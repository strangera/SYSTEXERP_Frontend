import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountingPeriodService {
  apiUrl: string = `${environment.ApiUrl}/accounting-periods`; // 假設 API 的路徑為 /accounting-periods
  title: string = '帳次';

  // 本地數據的帳次選項
  options: any[] = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 獲取所有帳次（本地數據）
  getLocalAccountingPeriods(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 從伺服器獲取所有帳次
  getAccountingPeriods(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((data) => console.debug('get accounting periods response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 根據 value 獲取帳次
  getAccountingPeriodByValue(value: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${value}`).pipe(
      tap((data) => console.debug('get by value response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 創建新的帳次
  createAccountingPeriod(accountingPeriod: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, accountingPeriod).pipe(
      tap((data) => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 更新指定 value 的帳次
  updateAccountingPeriod(value: string, accountingPeriod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${value}`, accountingPeriod).pipe(
      tap((data) => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
