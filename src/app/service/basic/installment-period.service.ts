import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstallmentPeriodService {
  apiUrl: string = environment.ApiUrl;
  title: string = '分期期數';

  // 本地數據的分期期數選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '三期' },
    { value: 2, label: '六期' },
    { value: 3, label: '十二期' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 獲取所有分期期數（本地數據）
  getInstallmentPeriods(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
