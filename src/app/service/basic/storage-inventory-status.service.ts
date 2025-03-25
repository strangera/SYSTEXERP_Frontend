import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageInventoryStatusService {
  apiUrl: string = environment.ApiUrl;
  title: string = '儲盤單狀態';
  options: any[] = [
    { value: 1, label: '尚未結案' },
    { value: 2, label: '結案' },
    { value: 3, label: '作廢' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getStorageInventoryStatusOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getStorageInventoryStatusById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createStorageInventoryStatus(status: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, status).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateStorageInventoryStatus(id: number, status: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, status).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
