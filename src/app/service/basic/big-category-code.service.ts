import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BigCategoryCodeService {
  apiUrl: string = environment.ApiUrl;
  queryApiUrl = `${environment.ApiUrl}/queryTLTBUSTYPE_DropDownList`;
  title = '大分類代碼';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getSystemTypes(): Observable<{ value: string, label: string }[]> {
    const payload = {};

    return this.http.post<any>(this.queryApiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(data => console.debug('/queryTLTBUSTYPE_DropDownList', data)),
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
    if (!systemType || !systemType.bus_type) {
      const error = new Error('缺少必要欄位 bus_type');
      console.error('❌ 錯誤：', error.message, systemType);
      return throwError(() => error);
    }

    return this.http.post<any>(this.apiUrl, systemType).pipe(
      tap(data => console.debug('✅ post response', data)),
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
