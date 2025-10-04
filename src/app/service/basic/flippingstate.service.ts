import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FlippingstateService {
  // Simulated API URL (Replace with your actual API URL if needed)
  apiUrl: string = environment.ApiUrl;
  title: string = '拋轉狀態';

  // Dropdown options matching the image content
  options: any[] = [
    { value: 1, label: '收款拋轉' },
    { value: 2, label: '退款拋轉' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // Method to get the options for ExcessHandlingMethod dropdown
  getOptions(): Observable<any[]> {
    // Returning options directly. Replace with HTTP call if needed.
    return of(this.options).pipe(
      tap(data => console.debug('ExcessHandlingMethod options:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // Example methods for interacting with a backend (Optional)
  getExcessHandlingMethodById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('getExcessHandlingMethodById response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createExcessHandlingMethod(excessHandlingMethod: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, excessHandlingMethod).pipe(
      tap(data => console.debug('createExcessHandlingMethod response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateExcessHandlingMethod(id: number, excessHandlingMethod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, excessHandlingMethod).pipe(
      tap(data => console.debug('updateExcessHandlingMethod response:', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
