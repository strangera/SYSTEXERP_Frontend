import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QueryAngleService {

  apiUrl: string = environment.ApiUrl;
  title: string = '查詢角度';
  options: any[] = [
    { value: 1, label: '依使用者查詢=>子系統分析' },
    { value: 2, label: '依使用者查詢=>作業分析' },
    { value: 3, label: '依使用者查詢=>主系統分析' },
    { value: 4, label: '依作業查詢=>子系統分析' },
    { value: 5, label: '依作業查詢=>作業分析' },
    { value: 6, label: '依作業查詢=>主系統分析' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getQueryAngle(): Observable<any[]> {
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

  getQueryAngleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createQueryAngle(systemType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, systemType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateQueryAngle(id: number, systemType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, systemType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
