import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  apiUrl: string = environment.ApiUrl;
  title: string = '倉別';
  options: any[] = [
    { value: 1, label: '化妝品' },
    { value: 2, label: '內睡衣' },
    { value: 3, label: 'EC倉' },
    { value: 4, label: '來雅倉' },
    { value: 5, label: '壹體倉' },
    { value: 6, label: '東方美倉' },
    { value: 7, label: '侍販倉' },
    { value: 8, label: '佰旺倉' },
    { value: 9, label: '麥茱莉倉' },
    { value: 10, label: '沃盛倉' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getWarehouseOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getWarehouseOptionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createWarehouseOption(warehouseOption: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, warehouseOption).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateWarehouseOption(id: number, warehouseOption: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, warehouseOption).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
