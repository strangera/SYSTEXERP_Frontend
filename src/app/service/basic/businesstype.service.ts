import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessTypeService {

  apiUrl: string = environment.ApiUrl;
  title: string = '大分類代碼';
  options: any[] = [
    { value: 1, label: '專門大店' },
    { value: 2, label: '專櫃' },
    { value: 3, label: '小吃' },
    { value: 4, label: '主題餐廳' },
    { value: 5, label: '咖啡輕食' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getBusinessTypes(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getBusinessTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createBusinessType(businessType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, businessType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateBusinessType(id: number, businessType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, businessType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
