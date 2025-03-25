import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WillingnessLevelService {
  apiUrl: string = environment.ApiUrl;
  title: string = '意願等級';
  options: any[] = [
    { value: 1, label: '未確認' },		
    { value: 2, label: '交涉中(基本條件合意)' },		
    { value: 3, label: '交涉中(反應良好)' },		
    { value: 4, label: '交涉中(反應不好)' },		
    { value: 5, label: '保留' },		
    { value: 6, label: '無意進駐' },		
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getSystemTypes(): Observable<any[]> {
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

  getSystemTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createSystemType(systemType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, systemType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateSystemType(id: number, systemType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, systemType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
