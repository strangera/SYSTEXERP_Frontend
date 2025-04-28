import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BigCategoryCodeService {
  apiUrl: string = environment.ApiUrl;
  queryApiUrl: string = `${environment.ApiUrl}/TLS0000/TLS5000/queryTLS51010`;
  title: string = '大分類代碼';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getSystemTypes(): Observable<{ value: string, label: string }[]> {
    const params = {
      PageSize: 999,
      PageIndex: 0,
      SortBy: [{ field: 'CAT_LNo', order: 1 }],
      CAT_LNo: '',
      CAT_LName: ''
    };

    return this.http.post<any>(this.queryApiUrl, params).pipe(
      tap(data => console.debug('queryTLS51010 response', data)),
      map(response => {
        // 檢查回傳數據結構
        if (!response || typeof response !== 'object') {
          throw new Error('無效的 API 回傳格式');
        }
        // 確保 Data 存在且為陣列
        const data = response.Data || [];
        if (!Array.isArray(data)) {
          throw new Error('API 回傳的 Data 不是陣列');
        }
        // 轉換為 { value, label } 格式
        return data.map((item: any) => ({
          value: item.CAT_LNo || '',
          label: item.CAT_LName || ''
        }));
      }),
      // catchError((error: HttpErrorResponse | Error) => {
      //   console.error('getSystemTypes error:', error);
      //   return this.errorHandler.handleError(error);
      // })
    );
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
