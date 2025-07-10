import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '卡種';

  // 本地數據的卡種選項，使用數字作為 value
  options: any[] = [
    { value: 'V', label: 'VISA' },
    { value: 'M', label: 'MASTER' },
    { value: 'J', label: 'JCB' },
    { value: 'A', label: 'AE' },
    { value: 'D', label: 'DINVER' },
    { value: 'S', label: '銀聯卡' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有卡別（本地數據）
  getCardType(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
