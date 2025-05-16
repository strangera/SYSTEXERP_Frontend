import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemTypeDetailService {

  apiUrl: string = environment.ApiUrl;
  title: string = '中分類';
  options: any[] = [
    { value: 1, label: 'APP服務' },
    { value: 2, label: '出庫系統設定' },
    { value: 3, label: 'EIP模組' },
    { value: 4, label: '權限管理系統' },
    { value: 5, label: '決策支援管理-營運管理及銷售分析報表' },
    { value: 6, label: '專櫃營運管理' }, { value: 1, label: 'APP服務' },
    { value: 7, label: '贈品管理系統' },
    { value: 8, label: '會員管理系統' },
    { value: 9, label: 'POS網管系統' },
    { value: 10, label: '客服客訴系統' },
    { value: 11, label: '行銷活動管理系統' },
    { value: 12, label: '資材管理系統' },
    { value: 13, label: '基本資料管理系統' },
    { value: 14, label: '招商暨合約管理系統' },
    { value: 15, label: '電子商務系統' },
    { value: 16, label: '發票暨媒體申報系統' },
    { value: 17, label: '人資管理系統' },
    { value: 18, label: '能源管理系統' },
    { value: 19, label: '應負帳款系統' },
    { value: 20, label: '零用金管理系統' },
    { value: 21, label: '應收帳款系統' },
    { value: 22, label: '預算管理系統' },
    { value: 23, label: '總帳管理系統' },
    { value: 24, label: '票據管理系統' },
    { value: 25, label: '禮券管理系統' },
    { value: 26, label: '自營管理系統' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getSystemTypes(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    /*
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.debug('get response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    */
  }

  getSystemTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createSystemType(systemType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, systemType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateSystemType(id: number, systemType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, systemType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
