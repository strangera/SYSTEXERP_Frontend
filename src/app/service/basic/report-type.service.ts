import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '報表型態';
  options: any[] = [
    { value: 1, label: '專櫃編號修正報表' },
    { value: 2, label: '折扣別資料修正報表' },
    { value: 3, label: '付款別資料修正報表' },
    { value: 4, label: '商品抽成類別資料修正報表' },
    { value: 5, label: '交易資料作廢報表' },
    { value: 6, label: '發票資料修正報表' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getReportTypes(): Observable<any[]> {
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

  getReportTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createReportType(reportType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, reportType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateReportType(id: number, reportType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, reportType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
