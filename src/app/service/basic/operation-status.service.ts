import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperationStatusService {

  apiUrl: string = environment.ApiUrl;
  title: string = '營運狀態';
  options: any[] = [
    { value: 0, label: '閉店/撤櫃' },
    { value: 1, label: '營業中' },
    { value: 2, label: '合約結束' },
    { value: 9, label: '核准時合約尚未開始' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getOperationStatuses(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getOperationStatusById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createOperationStatus(operationStatus: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, operationStatus).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateOperationStatus(id: number, operationStatus: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, operationStatus).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
