import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeductionbigCategoryService {
  apiUrl: string = `${environment.ApiUrl}/deduction-categories`; // 假設 API 的路徑為 /deduction-categories
  title: string = 'Deduction Categories';
  options: any[] = [
    { value: 0, label: '類別0' },
    { value: 1, label: '類別1' },
    { value: 2, label: '類別2' },
    { value: 3, label: '類別3' },
    { value: 4, label: '類別4' },
    { value: 5, label: '類別5' },
    { value: 6, label: '類別6' },
    { value: 7, label: '類別7' },
    { value: 8, label: '類別8' },
    { value: 9, label: '類別9' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有抽成類別（本地數據）
  getLocalDeductionCategories(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 從伺服器獲取所有抽成類別
  getDeductionCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((data) => console.debug('get categories response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 根據value獲取抽成類別
  getDeductionCategoryByValue(value: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${value}`).pipe(
      tap((data) => console.debug('get by value response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 創建新的抽成類別
  createDeductionCategory(deductionCategory: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, deductionCategory).pipe(
      tap((data) => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 更新指定value的抽成類別
  updateDeductionCategory(value: number, deductionCategory: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${value}`, deductionCategory).pipe(
      tap((data) => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
