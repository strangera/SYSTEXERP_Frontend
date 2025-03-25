import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CashierCodeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '收銀機代號';
  options: any[] = [
    { value: 1, label: '000221_TIGER虎牌' },
    { value: 2, label: '000211_LECREUSET' },
    { value: 3, label: '000181_dyson' },
    { value: 4, label: '000121_tokuyo' },
    { value: 5, label: '000101_集雅社' },
    { value: 6, label: '000091_翰林茶棧' },
    { value: 7, label: '000083_CoCo都可' },
    { value: 8, label: '000081_CoCo都可' },
    { value: 9, label: '000022_霹靂布袋戲' },
    { value: 10, label: '000021_霹靂布袋戲' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getCashierCodes(): Observable<any[]> {
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

  getCashierCodeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createCashierCode(cashierCode: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, cashierCode).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateCashierCode(id: number, cashierCode: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, cashierCode).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
