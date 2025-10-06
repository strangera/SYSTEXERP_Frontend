import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CashierService {
  apiUrl: string = environment.ApiUrl + '/queryPOS2001_DropDownList';
  title: string = '收銀員';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getCashierOptions(): Observable<any[]> {
    return this.http.post<any>(this.apiUrl, {}).pipe(
      tap(response => console.debug('getCashierOptions response', response)),
      map(response =>
        (response?.Data ?? []).map((item: any) => ({
          value: item.No,
          label: item.Name
        }))
      ),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
