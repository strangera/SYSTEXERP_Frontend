import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorHandlerService } from '../system/error-handler.service';
import { environment } from '../../../environments/environment'; // Added import for environment

@Injectable({
  providedIn: 'root'
})
export class ReconciliationMethodService {
  // Use environment API URL
  apiUrl: string = environment.ApiUrl;
  title: string = '對帳方式';

  // Dropdown options matching the image content
  options: any[] = [
    { value: 1, label: '傳真' },
    { value: 2, label: '郵寄' },
    { value: 3, label: '網路' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // Method to get the options for ReconciliationMethod dropdown
  getReconciliationMethods(): Observable<any[]> {
    // Returning options directly. Replace with HTTP call if needed.
    return of(this.options).pipe(
      tap(data => console.debug('ReconciliationMethod options:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // Example methods for interacting with a backend (Optional)
  getReconciliationMethodById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('getReconciliationMethodById response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createReconciliationMethod(reconciliationMethod: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, reconciliationMethod).pipe(
      tap(data => console.debug('createReconciliationMethod response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateReconciliationMethod(id: number, reconciliationMethod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, reconciliationMethod).pipe(
      tap(data => console.debug('updateReconciliationMethod response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
