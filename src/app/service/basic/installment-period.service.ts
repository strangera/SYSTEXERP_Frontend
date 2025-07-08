import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstallmentPeriodService {
  apiUrl: string = environment.ApiUrl;
  title: string = '分期期數';

  // 本地數據的分期期數選項，使用數字作為 value

  options: any[] = [
    { value: 0, label: '不分期' },
    { value: 3, label: '3期' },
    { value: 6, label: '6期' },
    { value: 12, label: '12期' },
    { value: 24, label: '24期' }
  ];
  // 可以繼續添加其他選項


  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有分期期數（本地數據）
  getInstallmentPeriods(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
