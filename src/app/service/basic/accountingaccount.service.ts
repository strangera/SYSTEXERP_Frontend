import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountingaccountService {
  apiUrl: string = `${environment.ApiUrl}/accounting-periods`; // 假設 API 的路徑為 /accounting-periods
  title: string = '帳次';

// 選項
options: any[] = [
  { value: 1, label: '1101_庫存現金' },
  { value: 2, label: '110101_庫存現金-營收及正負差' },
  { value: 3, label: '110102_庫存現金-其他收入' },
  { value: 4, label: '110103_庫存現金-財務部' },
  { value: 5, label: '110111_庫存現金-外幣' },
  { value: 6, label: '110112_庫存現金-人民幣' },
  { value: 7, label: '110199_庫存現金-其他' },
  { value: 8, label: '1102_零用金' },
  { value: 9, label: '110200_零用金-總經理室' },
  { value: 10, label: '110201_零用金-採購組' }
];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 獲取所有帳次（本地數據）
  getOptions(): Observable<any[]> {
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
