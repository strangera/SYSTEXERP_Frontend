import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DecorationMethodService {

  apiUrl: string = environment.ApiUrl;
  title: string = '裝潢方式';
  options: any[] = [
    { value: 1, label: '統設統裝(A統)' },
    { value: 2, label: '統設自裝' },
    { value: 3, label: '自設統裝' },
    { value: 4, label: '自設自裝' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getDecorationMethods(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getDecorationMethodById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createDecorationMethod(decorationMethod: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, decorationMethod).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateDecorationMethod(id: number, decorationMethod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, decorationMethod).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
