import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PriceChangeStatusService {

  apiUrl: string = environment.ApiUrl;
  title: string = '進價變價單狀態';
  options: any[] = [
    { value: 1, label: '已申請' },
    { value: 2, label: '已確認' },
    { value: 3, label: '已審核' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getPriceChangeStatusOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getPriceChangeStatusOptionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createPriceChangeStatusOption(priceChangeStatusOption: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, priceChangeStatusOption).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updatePriceChangeStatusOption(id: number, priceChangeStatusOption: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, priceChangeStatusOption).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
