import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorHandlerService } from '../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class BaseTypeService {
  // Simulated API URL (Replace with your actual API URL if needed)
  apiUrl: string = environment.ApiUrl;
  title: string = '包底類別';

  // Dropdown options matching the image content
  options: any[] = [
    { value: 1, label: '年包' },
    { value: 2, label: '月包' },
    { value: 3, label: '區間包' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // Method to get the options for BaseType dropdown
  getBaseTypes(): Observable<any[]> {
    // Returning options directly. Replace with HTTP call if needed.
    return of(this.options).pipe(
      tap(data => console.debug('BaseType options:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // Example methods for interacting with a backend (Optional)
  getBaseTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('getBaseTypeById response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createBaseType(baseType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, baseType).pipe(
      tap(data => console.debug('createBaseType response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateBaseType(id: number, baseType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, baseType).pipe(
      tap(data => console.debug('updateBaseType response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
