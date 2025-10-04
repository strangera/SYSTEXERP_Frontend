import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusFlagService {
  apiUrl: string = environment.ApiUrl
  title: string = '狀態旗標';

  // 本地數據的狀態旗標選項
  options: any[] = [
    { value: '1', label: '外交官零稅' },
    { value: '2', label: '事後登錄' },
    { value: '3', label: '預售' },
    // 根據圖片可見的狀態旗標繼續添加
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有狀態旗標（本地數據）
  getStatusFlags(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
