import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BigCategoryService {
  apiUrl: string = environment.ApiUrl;  // Replace with the actual API URL
  title: string = '大分類';

  // Example options where value is numeric
  options: any[] = [
    { value: 0, label: '未設定' },
    { value: 1, label: '化妝品' },
    { value: 2, label: '內睡衣' },
    { value: 3, label: '電子商務EC' },
    { value: 4, label: '電子商務EC-萊雅' },
    { value: 5, label: '電子商務EC-壹塵' },
    { value: 6, label: '電子商務EC-東方美' },
    { value: 7, label: '特販大' },
    { value: 8, label: '電子商務EC-佰旺' },
    { value: 9, label: '電子商務EC-愛茉莉' },
    { value: 10, label: '電子商務EC-泛盛' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // Fetch categories from the local list
  getCategories(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get categories response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    /*
    // Uncomment and modify the below code to fetch from an API
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      tap(data => console.debug('get response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    */
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, category).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, category).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
