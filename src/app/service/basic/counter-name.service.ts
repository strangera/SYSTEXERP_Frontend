import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterNameService {
  apiUrl: string = environment.ApiUrl + '/queryTLTTALENT_DropDownList';
  title: string = '專櫃';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getCounters(): Observable<any[]> {
    return this.http.post<any>(this.apiUrl, {}).pipe(
      tap(response => console.debug('post response', response)),
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
