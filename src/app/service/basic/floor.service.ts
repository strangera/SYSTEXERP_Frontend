import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  apiUrl: string = environment.ApiUrl;
  title: string = '樓層';
  options: any[] = [
    { value: 1, label: 'B1' },
    { value: 2, label: 'BM' },
    { value: 3, label: 'B1' },
    { value: 4, label: '1F' },
    { value: 5, label: '2F' },
    { value: 6, label: '3F' },
    { value: 7, label: '4F' },
    { value: 8, label: '5F' },
    { value: 9, label: '6F' },
    { value: 10, label: 'EC' },
    { value: 11, label: '1F' },
    { value: 12, label: '2F' },
    { value: 13, label: '3F' },
    { value: 14, label: '4F' },
    { value: 15, label: '5F' },
    { value: 16, label: '6F' },
    { value: 17, label: '7F' },
    { value: 18, label: '8F' },
    { value: 19, label: '9F' },
    { value: 20, label: 'XXX' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getFloors(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getFloorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createFloor(floor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, floor).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateFloor(id: number, floor: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, floor).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
