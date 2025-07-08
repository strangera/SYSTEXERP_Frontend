import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { catchError, Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Sysb900DropdownService {
  apiUrl: string = environment.ApiUrl;
  queryApiUrl = `${environment.ApiUrl}/queryTLTBUSCLASS_DropDownList`;
  title = '中分類代碼';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getSystemTypesByBustype(busTypes: string[]): Observable<{ value: string, label: string }[]> {
    const params = {
      id: 0,
      No: '',
      Name: '',
      bus_type: busTypes || [] // 傳遞大分類代碼陣列
    };

    return this.http.post<any>(this.queryApiUrl, params).pipe(
      tap(data => console.debug('querySYSB900_DropDownList response', data)),
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
      //   console.error('getSystemTypesByBustype error:', error);
      //   return this.errorHandler.handleError(error);
      // })
    );
  }

  // 原有方法（保留，供其他地方使用）
  getSystemTypes(): Observable<{ value: string, label: string }[]> {
    return this.getSystemTypesByBustype([]); // 重用新方法，傳空陣列表示不過濾
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
