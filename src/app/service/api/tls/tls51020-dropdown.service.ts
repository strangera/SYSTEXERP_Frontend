import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, map, throwError, forkJoin, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class Tls51020DropDownService {
  apiUrl: string = environment.ApiUrl;
  queryApiUrl: string = `${environment.ApiUrl}/queryPOS20031_DropDownList`;
  title: string = '中分類代碼';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 🆕 新增：支援多個大分類代碼查詢中分類（後端直接支援陣列）
  getSystemTypesByMultipleCatLNo(catLNoArray: string[]): Observable<{ value: string, label: string }[]> {
    if (!catLNoArray || catLNoArray.length === 0) {
      return of([]); // 返回空陣列
    }

    // 直接傳送陣列給後端 API
    const params = {
      id: 0,
      No: '',
      Name: '',
      CAT_LNo: catLNoArray // 直接傳遞大分類代碼陣列
    };

    return this.http.post<any>(this.queryApiUrl, params).pipe(
      tap(data => console.debug('queryTLS51020_DropDownList (multiple) response', data)),
      map(response => {
        if (!response || typeof response !== 'object') {
          throw new Error('無效的 API 回傳格式');
        }
        const data = response.Data || [];
        if (!Array.isArray(data)) {
          throw new Error('API 回傳的 Data 不是陣列');
        }
        return data.map((item: any) => ({
          value: item.No || '',
          label: `${item.No || ''} - ${item.Name || ''}`
        }));
      }),
      catchError((error: HttpErrorResponse | Error) => {
        console.error('getSystemTypesByMultipleCatLNo error:', error);
        return of([]); // 發生錯誤時返回空陣列
      })
    );
  }

  // 🔄 原有方法（保持單一大分類查詢功能）
  getSystemTypesByCatLNo(catLNo: string): Observable<{ value: string, label: string }[]> {
    const params = {
      id: 0,
      No: '',
      Name: '',
      CAT_LNo: catLNo || '' // 傳遞大分類代碼
    };

    return this.http.post<any>(this.queryApiUrl, params).pipe(
      tap(data => console.debug('queryTLS51020_DropDownList response', data)),
      map(response => {
        if (!response || typeof response !== 'object') {
          throw new Error('無效的 API 回傳格式');
        }
        const data = response.Data || [];
        if (!Array.isArray(data)) {
          throw new Error('API 回傳的 Data 不是陣列');
        }
        return data.map((item: any) => ({
          value: item.No || '',
          label: `${item.No || ''} - ${item.Name || ''}`
        }));
      }),
      catchError((error: HttpErrorResponse | Error) => {
        console.error('getSystemTypesByCatLNo error:', error);
        return of([]); // 發生錯誤時返回空陣列
      })
    );
  }

  // 🔄 原有方法（保留，供其他地方使用）
  getSystemTypes(): Observable<{ value: string, label: string }[]> {
    return this.getSystemTypesByCatLNo(''); // 重用新方法，傳空值表示不過濾
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
