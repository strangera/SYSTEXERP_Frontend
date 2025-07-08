import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '資料類別';
  options: any[] = [
    { value: 1, label: '專櫃基本資料' },
    { value: 2, label: '中分類資料' },
    { value: 3, label: '快速鍵商品資料' },
    { value: 4, label: '單品資料異動下傳 異動區間：' },
    { value: 5, label: '贈品活動設定資料' },
    { value: 6, label: '贈品活動櫃號設定資料' },
    { value: 7, label: '收銀員資料' },
    { value: 8, label: '網管訊息(全館)' },
    { value: 9, label: '禮券黑白名單資料(全館)' },
    { value: 10, label: '發票配號安全存量資料' },
    { value: 11, label: '發票列印訊息' },
    { value: 12, label: '清機時間設定' },
    { value: 13, label: '發票字軌資料' },
    { value: 14, label: '停車時數選單設定檔' },
    { value: 15, label: '銀行CARD_BIN' },
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
