import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  apiUrl: string = `${environment.ApiUrl}/discount-options`; // 假設 API 的路徑為 /discount-options
  title: string = '折扣別';
  options: any[] = [
    { value: 1, label: '正品' },
    { value: 2, label: '95折' },
    { value: 3, label: '90折' },
    { value: 4, label: '85折' },
    { value: 5, label: '80折' },
    { value: 6, label: '75折' },
    { value: 7, label: '70折' },
    { value: 8, label: '65折' },
    { value: 9, label: '60折' },
    { value: 10, label: '55折' },
    { value: 11, label: '50折' },
    { value: 12, label: '特價' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 獲取所有折扣選項（本地數據）
  getLocalDiscountOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 從伺服器獲取所有折扣選項
  getDiscountOptions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((data) => console.debug('get discount options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 根據value獲取折扣選項
  getDiscountOptionByValue(value: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${value}`).pipe(
      tap((data) => console.debug('get by value response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 創建新的折扣選項
  createDiscountOption(discountOption: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, discountOption).pipe(
      tap((data) => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 更新指定value的折扣選項
  updateDiscountOption(value: number, discountOption: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${value}`, discountOption).pipe(
      tap((data) => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
