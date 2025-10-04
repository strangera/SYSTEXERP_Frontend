import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViolationCategoryService {
  apiUrl: string = environment.ApiUrl;
  title: string = '違規類別編號';
  options: any[] = [
    { value: 1, label: '發票使用規範' },
    { value: 2, label: 'POS&EDC作業規範' },
    { value: 3, label: '出勤狀況' },
    { value: 4, label: '賣場禁忌' },
    { value: 5, label: '營業規範' },
    { value: 6, label: '後場須知' },
    { value: 7, label: '安全管理' },
    { value: 8, label: '衛生管理' },
    { value: 9, label: '人員管理' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getViolationCategories(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    /*
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.debug('get response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    */
  }

  getViolationCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createViolationCategory(violationCategory: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, violationCategory).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateViolationCategory(id: number, violationCategory: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, violationCategory).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
