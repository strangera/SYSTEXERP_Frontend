import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  apiUrl: string = environment.ApiUrl;
  title: string = 'Deduction Code Name';
  options: any[] = [
    { value: 1, label: '全部' },
    { value: 2, label: '有欠落' },
    { value: 3, label: '無欠落' },

  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getDisplay(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getDisplayById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createDisplayName(deductionCodeName: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, deductionCodeName).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateDisplayName(id: string, deductionCodeName: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, deductionCodeName).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
