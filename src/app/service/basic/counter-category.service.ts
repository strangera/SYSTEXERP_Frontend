import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterCategoryService {

  apiUrl: string = environment.ApiUrl;
  title: string = '櫃別類型';
  options: any[] = [
    { value: 1, label: '正櫃' },
    { value: 2, label: '臨時櫃' },
    { value: 3, label: '特賣會' },
    { value: 4, label: '虛擬櫃' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getCounterCategories(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getCounterCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createCounterCategory(counterCategory: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, counterCategory).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateCounterCategory(id: number, counterCategory: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, counterCategory).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
