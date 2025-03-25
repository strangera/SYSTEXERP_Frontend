import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IssuanceNoteStatusService {
  apiUrl: string = environment.ApiUrl;
  title: string = '領用單狀態';
  options: any[] = [
    { value: 1, label: '已申請' },
    { value: 2, label: '已審核' },
    { value: 3, label: '已領用' },
    { value: 4, label: '已發貨' },
    { value: 5, label: '已收貨確認' },
    // Add more options as needed
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getIssuanceNoteStatuses(): Observable<any[]> {
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

  getIssuanceNoteStatusById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap((data) => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createIssuanceNoteStatus(issuanceNoteStatus: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, issuanceNoteStatus).pipe(
      tap((data) => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateIssuanceNoteStatus(id: number, issuanceNoteStatus: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, issuanceNoteStatus).pipe(
      tap((data) => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
