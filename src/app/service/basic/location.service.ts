import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  apiUrl: string = environment.ApiUrl;
  title: string = '位置';
  locations: any[] = [
    { value: 1, label: 'B1F21' },
    { value: 2, label: 'B1F28' },
    { value: 3, label: 'B1Z01' },
    { value: 4, label: 'B1F08' },
    { value: 5, label: 'B1F10' },
    { value: 6, label: 'B1F08b' },
    { value: 7, label: 'B1E07b' },
    { value: 8, label: 'B1F05' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getLocations(): Observable<any[]> {
    return of(this.locations).pipe(
      tap(data => console.debug('get locations response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getLocationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createLocation(location: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, location).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateLocation(id: number, location: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, location).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
