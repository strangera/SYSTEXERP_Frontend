import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  apiUrl: string = environment.ApiUrl;
  title: string = '銀行';
  options: any[] = [
    { value: 1, label: '第一銀行' },
    { value: 2, label: '華南銀行' },
    { value: 3, label: '彰化銀行' },
    { value: 4, label: '台灣銀行' },
    { value: 5, label: '上海商業儲蓄銀行' },
    { value: 6, label: '國泰世華銀行' },
    { value: 7, label: '台灣中小企業銀行' },
    // 更多銀行選項...
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getBanks(): Observable<any[]> {
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

  getBankById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createBank(bank: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, bank).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateBank(id: number, bank: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, bank).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
