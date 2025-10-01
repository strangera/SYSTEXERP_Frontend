import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommissionTypeService {

  apiUrl: string = environment.ApiUrl;
  title: string = '抽成類型';
  options: any[] = [
    { value: '1', label: '固定租金' },
    { value: '2', label: '底租抽成取高者' },
    { value: '3', label: '一般抽成' },
    { value: '4', label: '包底抽成' },
    { value: '5', label: '層級抽成' },
    { value: '6', label: '包底加層級' },
  ];


  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getCommissionTypes(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getCommissionTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createCommissionType(commissionType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, commissionType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateCommissionType(id: number, commissionType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, commissionType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
