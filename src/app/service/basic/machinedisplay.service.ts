import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MachinedisplayService {
  apiUrl: string = environment.ApiUrl;
  title: string = '機台顯示';
  options: any[] = [
    { value: 1, label: '只顯示有交易之機台' },
    { value: 2, label: '顯示所有之機台' },
    { value: 3, label: '顯示可能離線之機台' },
    { value: 4, label: '顯示未清機之機台' },


  ];
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getMachinedisplay(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getMachinedisplayById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createMachinedisplay(options: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, options).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateMachinedisplay(id: number, options: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, options).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
