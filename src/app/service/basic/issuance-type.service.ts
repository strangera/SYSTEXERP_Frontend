import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IssuanceTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '領用類別';
  options: any[] = [
    { value: 1, label: '公開活動' },
    { value: 2, label: '贈品領用' },
    // Add more options as needed
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getIssuanceTypes(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    /*
    // Uncomment if you need to fetch data from API
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.debug('get response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    */
  }

  getIssuanceTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap((data) => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createIssuanceType(issuanceType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, issuanceType).pipe(
      tap((data) => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateIssuanceType(id: number, issuanceType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, issuanceType).pipe(
      tap((data) => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
