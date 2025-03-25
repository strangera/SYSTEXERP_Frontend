import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeductionCategoryService {
  apiUrl: string = environment.ApiUrl;
  title: string = '扣款類別';
  options: any[] = [
    { value: 1, label: '一次扣款' },
    { value: 2, label: '每月扣款' },
    { value: 3, label: '平均分攤' },
    { value: 4, label: '比例分攤' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getDeductionCategories(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getDeductionCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createDeductionCategory(deductionCategory: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, deductionCategory).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateDeductionCategory(id: number, deductionCategory: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, deductionCategory).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
