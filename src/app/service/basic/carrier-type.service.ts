import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarrierTypeService {
  apiUrl: string = environment.ApiUrl; // 使用全局 API 路徑
  title: string = '載具種類';

  // 本地數據的載具種類選項
  options: any[] = [
    { value: '3J0002', label: '手機條碼' },
    { value: 'CQ0001', label: '自然人憑證條碼' },
    { value: '1K0001', label: '悠遊卡載具' },
    { value: '1H0001', label: '一卡通載具' },
    { value: 'EK0002', label: '信用卡載具' },
    // 根據圖片顯示的選項繼續添加
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getCarrierType(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
