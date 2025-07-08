import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeductionCodeNameService {

  apiUrl: string = environment.ApiUrl;
  title: string = 'Deduction Code Name';
  options: any[] = [
    { value: 'A01', label: '(A01)開幕贊助費' },
    { value: 'A02', label: '(A02)識別證' },
    { value: 'A03', label: '(A03)影印費' },
    { value: 'A04', label: '(A04)紙袋、包裝費' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getDeductionCodeNames(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getDeductionCodeNameById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createDeductionCodeName(deductionCodeName: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, deductionCodeName).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateDeductionCodeName(id: string, deductionCodeName: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, deductionCodeName).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
