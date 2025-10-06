import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BagTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '領袋表類';

  // 本地數據的領袋表類選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '現金袋' },
    { value: 2, label: '帳務袋' },
    { value: 3, label: '零用金袋' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有領袋表類（本地數據）
  getBagTypes(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
