import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegionCodeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '區域代碼';
  options: any[] = [
    { value: 1, label: 'A區' },
    { value: 2, label: 'B區' },
    { value: 3, label: 'C區' },
    { value: 4, label: 'D區' },
    { value: 5, label: 'E區' },
    { value: 6, label: 'F區' },
    { value: 7, label: '電子商務區' },
    { value: 8, label: 'I區' },
    { value: 9, label: 'J區' },
    { value: 10, label: 'K區' },
    { value: 11, label: 'L區' },
    { value: 12, label: 'M區' },
    { value: 13, label: '虛擬櫃編及機台' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getRegionCodes(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getRegionCodeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createRegionCode(regionCode: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, regionCode).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateRegionCode(id: number, regionCode: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, regionCode).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
