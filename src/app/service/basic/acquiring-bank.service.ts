import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AcquiringBankService {
  apiUrl: string = environment.ApiUrl;
  title: string = '收單銀行';

  // 本地數據的收單銀行選項，使用數字作為 value
  options: any[] = [
    { value: "1", label: '聯合' },
    { value: "2", label: '中信' },
  
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有收單銀行（本地數據）
  getAcquiringBanks(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
