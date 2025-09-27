import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { catchError, Observable, tap, map, of } from 'rxjs';

export interface MiddleCategoryItem {
  value: string;        // 中分類代碼
  label: string;        // 中分類顯示名稱 (代碼 - 名稱)
  bus_type: string;     // 大分類代碼
  bus_type_name: string; // 大分類名稱
  bus_class: string;    // 中分類代碼 (和value相同，但更明確)
  bus_class_name: string; // 中分類名稱
}

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

  getSystemTypesByMultipleBusType(busTypes: string[]): Observable<MiddleCategoryItem[]> {
    if (!busTypes || busTypes.length === 0) {
      return of([]);
    }

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

        //  修改：回傳更完整的資訊
        return data.map((item: any) => ({
          value: item.No || '',                                    // 中分類代碼
          label: `${item.No || ''} - ${item.Name || ''}`,         // 原始格式：001 - 中分類名稱
          bus_type: item.bus_type || '',                           // 大分類代碼
          bus_type_name: item.bus_type_name || '',                 // 大分類名稱
          bus_class: item.No || '',                                // 中分類代碼 (明確欄位)
          bus_class_name: item.Name || ''                          // 中分類名稱 (明確欄位)
        }));
      }),
      catchError((error: HttpErrorResponse | Error) => {
        console.error('getSystemTypesByMultipleBusType error:', error);
        return of([]);
      })
    );
  }

  // 原有方法（保留，供其他地方使用）
  getSystemTypesByBustype(busTypes: string[]): Observable<{ value: string, label: string }[]> {
    return this.getSystemTypesByMultipleBusType(busTypes).pipe(
      map(items => items.map(item => ({
        value: item.value,
        label: item.label
      })))
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
