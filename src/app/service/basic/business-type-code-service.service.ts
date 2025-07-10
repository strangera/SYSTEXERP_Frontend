import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessTypeCodeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '大分類代碼';
  options: any[] = [
    { value: 1, label: '物販' },
    { value: 2, label: '餐飲' },
    { value: 3, label: '娛樂' },
    { value: 4, label: '服務' },
    { value: 5, label: '停車管理' },
    { value: 6, label: '服務台' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getBusinessTypeCodes(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getBusinessTypeCodeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createBusinessTypeCode(businessTypeCode: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, businessTypeCode).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateBusinessTypeCode(id: number, businessTypeCode: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, businessTypeCode).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
