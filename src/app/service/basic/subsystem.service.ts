import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubsystemService {
  apiUrl: string = environment.ApiUrl;
  title: string = '子系統';
  options: any[] = [
    { value: 1, label: '即時業績查詢' },
    { value: 2, label: '報表查詢' },
    { value: 3, label: '庫存管理' },
    { value: 4, label: '通報提醒' },
    { value: 5, label: '即時溝通' },
    { value: 6, label: '人資相關' },
    { value: 7, label: '各系統資料維護管理' },
    { value: 8, label: '個人工作區' },
    { value: 9, label: '協同作業區' },
    { value: 10, label: '簽核管理' },
    { value: 11, label: '企業管理' },
    { value: 12, label: '系統管理' },
    { value: 13, label: '基本設定' },
    { value: 14, label: '權限設定' },
    { value: 15, label: '員工設定' },
    { value: 16, label: '商品設定' },
    { value: 17, label: '客戶設定' },
    { value: 18, label: '廠商設定' },
    { value: 19, label: '分倉設定' },
    { value: 20, label: '簽核設定' },
    { value: 21, label: '基本資料' },
    { value: 22, label: '庫存查詢' },
    { value: 23, label: '採購處理' },
    { value: 24, label: '進貨處理' },
    { value: 25, label: '同業調撥' },
    { value: 26, label: '盤點處理' },
    { value: 27, label: '商品販促' },
    { value: 28, label: '銷售處理' },
    { value: 29, label: '日結處理' },
    { value: 30, label: '存貨處理' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getSubsystems(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getSubsystemById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createSubsystem(subsystem: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, subsystem).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateSubsystem(id: number, subsystem: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, subsystem).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
