import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardCategoryService {
  apiUrl: string = environment.ApiUrl;
  title: string = '卡別';

  // 本地數據的卡別選項
  options: any[] = [
    { value: 1, label: '普卡' },
    { value: 2, label: '金卡' },
    { value: 3, label: '白金卡' },
    
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

 
  getCardCategory(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }


}





