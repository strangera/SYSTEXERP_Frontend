import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MidCategoryService {
  apiUrl: string = environment.ApiUrl;
  title: string = '中分類';
  options: any[] = [
    { value: 0, label: '未設定' },
    { value: 1, label: '彩妝品' },
    { value: 2, label: 'EC-3C' },
    { value: 3, label: 'EC-佰旺/醫療用品' },
    { value: 4, label: 'EC-靡瑟/彩妝品' },
    { value: 5, label: 'EC-靡瑟/臉部保養' },
    // Add the rest of your options here with the corresponding numeric values
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getSubCategories(): Observable<any[]> {
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

  getSubCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createSubCategory(subCategory: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, subCategory).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateSubCategory(id: number, subCategory: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, subCategory).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
