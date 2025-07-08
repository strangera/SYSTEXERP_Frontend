import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TXN_SubtypeService {
  apiUrl: string = environment.ApiUrl; // 使用全局 API 路徑
  title: string = '交易附屬型態';

  // 本地數據的交易附屬型態選項
  options: any[] = [
    { value: '1', label: '退貨' },
    // 根據圖片顯示的選項繼續添加
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  //
  getTXNSubtype(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

}
