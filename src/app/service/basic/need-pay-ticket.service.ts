import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NeedPayTicketService {
  apiUrl: string = environment.ApiUrl;
  title: string = '應付票據';
  options: any[] = [
    { value: 0, label: '1101/庫存現金' },
    { value: 1, label: '110101/庫存現金-營收及正負差' },
    { value: 2, label: '110102/庫存現金-其他收入' },
    { value: 3, label: '110103/庫存現金-財務部' },
    { value: 4, label: '110111/庫存現金-外幣' },
    { value: 5, label: '110112/庫存現金-人民幣' },
    // Add the rest of your options here with the corresponding numeric values
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getNeedPayTickets(): Observable<any[]> {
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

  getNeedPayTicketById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createNeedPayTicket(subCategory: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, subCategory).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateNeedPayTicket(id: number, subCategory: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, subCategory).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
