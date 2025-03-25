import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationCodeService {
  apiUrl: string = `${environment.ApiUrl}/location-codes`; // 假設 API 的路徑為 /location-codes
  title: string = 'Location Codes';
  options: any[] = [
    { value: 1, label: 'B1F21' },
    { value: 2, label: 'B1F28' },
    { value: 3, label: 'B1Z01' },
    { value: 4, label: 'B1F08' },
    { value: 5, label: 'B1F10' },
    { value: 6, label: 'B1F08b' },
    { value: 7, label: 'B1E07b' },
    { value: 8, label: 'B1F05' },
    { value: 9, label: 'B1F12' },
    { value: 10, label: 'B1F15' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getSystemTypes(): Observable<any[]> {
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

  getSystemTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createSystemType(systemType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, systemType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateSystemType(id: number, systemType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, systemType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
