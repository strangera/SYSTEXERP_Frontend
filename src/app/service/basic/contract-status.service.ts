import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractStatusService {
  apiUrl: string = environment.ApiUrl;
  title: string = '合約狀態';

  contractStatuses: any[] = [
    { value: 1, label: '未審核' },
    { value: 2, label: '已審核' },
    { value: 3, label: '已作廢' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getContractStatuses(): Observable<any[]> {
    return of(this.contractStatuses).pipe(
      tap(data => console.debug('get contract statuses response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getContractStatusById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createContractStatus(contractStatus: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, contractStatus).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateContractStatus(id: number, contractStatus: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, contractStatus).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
