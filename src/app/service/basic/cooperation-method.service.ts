import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CooperationMethodService {

  apiUrl: string = environment.ApiUrl;
  title: string = '合作方式';
  options: any[] = [
    { value: 1, label: '專櫃' },
    { value: 2, label: '自營' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getCooperationMethods(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getCooperationMethodById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createCooperationMethod(cooperationMethod: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, cooperationMethod).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateCooperationMethod(id: number, cooperationMethod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, cooperationMethod).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
