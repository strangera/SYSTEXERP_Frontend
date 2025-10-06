import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionMachineService {
  apiUrl: string = `${environment.ApiUrl}/transactionMachines`;
  title: string = '交易機號';
  options: any[] = [
    { value: 1, label: '000011' },
    { value: 2, label: '000012' },
    { value: 3, label: '000021' },
    { value: 4, label: '000022' },
    { value: 5, label: '000031' },
    { value: 6, label: '000041' },
    { value: 7, label: '000051' },
    { value: 8, label: '000061' },
    { value: 9, label: '000071' },
    // Add more machine numbers here...
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getTransactionMachines(): Observable<any[]> {
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

  getTransactionMachineById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createTransactionMachine(machine: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, machine).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateTransactionMachine(id: number, machine: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, machine).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
