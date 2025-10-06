import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataTypeService {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getDataOptions(): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/queryDEFTBL_DropDownList`, {}).pipe(
      map(res => res?.Data || []),
      tap(data => console.debug('getTLS47010TableOptions response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
