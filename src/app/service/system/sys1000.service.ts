import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SYS1000, SYS1000Response } from '../../shared/models/SYS/SYS1000';

@Injectable({
  providedIn: 'root',
})
export class Sys1000Service {
  apiUrl: string = `${environment.ApiUrl}/SYS1000`; // 假設 API 的路徑為 /accounting-periods

  // 下拉選單
  options: SYS1000Response[] = [
    { id: 1, SYS_Type: 'T111', SYS_Code: '0', SYS_Name: '即期' },
    { id: 2, SYS_Type: 'T111', SYS_Code: '15', SYS_Name: '15天' },
    { id: 3, SYS_Type: 'T111', SYS_Code: '30', SYS_Name: '30天' },
    { id: 4, SYS_Type: 'T111', SYS_Code: '45', SYS_Name: '45天' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) {}

  // 獲取本地下拉選單數據
  getData(): Observable<SYS1000Response[]> {
    return of(this.options).pipe(
      tap((data) => {
        // console.debug('取得的下拉選單數據:', data);
      }),
      catchError((error: HttpErrorResponse) => {
        // console.error('獲取下拉選單數據失敗:', error);
        return this.errorHandler.handleError(error); // 使用錯誤處理服務來處理錯誤
      }),
    );
  }

  // 從伺服器獲取所有帳次
  getAccountingPeriods(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((data) => console.debug('get accounting periods response', data)),
      catchError((error: HttpErrorResponse) =>
        this.errorHandler.handleError(error),
      ),
    );
  }

  // 根據 value 獲取帳次
  getAccountingPeriodByValue(value: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${value}`).pipe(
      tap((data) => console.debug('get by value response', data)),
      catchError((error: HttpErrorResponse) =>
        this.errorHandler.handleError(error),
      ),
    );
  }

  // 創建新的帳次
  createData(accountingPeriod: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, accountingPeriod).pipe(
      tap((data) => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) =>
        this.errorHandler.handleError(error),
      ),
    );
  }

  // 更新指定 value 的帳次
  updateData(value: string, accountingPeriod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${value}`, accountingPeriod).pipe(
      tap((data) => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) =>
        this.errorHandler.handleError(error),
      ),
    );
  }
}
