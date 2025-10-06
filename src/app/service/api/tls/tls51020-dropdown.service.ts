import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, map, throwError, forkJoin, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

export interface MiddleCategoryItem {
  value: string;        // 中分類代碼
  label: string;        // 中分類顯示名稱 (代碼 - 名稱)
  CAT_LNo: string;      // 大分類代碼
  CAT_LName: string;    // 大分類名稱
  CAT_MNo: string;      // 中分類代碼 (和value相同，但更明確)
  CAT_MName: string;    // 中分類名稱
}

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

  //  新增：支援多個大分類代碼查詢中分類（後端直接支援陣列）
  getSystemTypesByMultipleCatLNo(catLNoArray: string[]): Observable<MiddleCategoryItem[]> {
    if (!catLNoArray || catLNoArray.length === 0) {
      return of([]);
    }

    const params = {
      id: 0,
      No: '',
      Name: '',
      CAT_LNo: catLNoArray
    };

    return this.http.post<any>(this.queryApiUrl, params).pipe(
      tap(data => console.debug('queryTLS51020_DropDownList (with big category) response', data)),
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
          label: `${item.No || ''} - ${item.Name || ''}`,         // 原始格式：001 - 彩妝品
          CAT_LNo: item.CAT_LNo || '',                            // 大分類代碼
          CAT_LName: item.CAT_LName || '',                        // 大分類名稱
          CAT_MNo: item.No || '',                                 // 中分類代碼 (明確欄位)
          CAT_MName: item.Name || ''                              // 中分類名稱 (明確欄位)
        }));
      }),
      catchError((error: HttpErrorResponse | Error) => {
        console.error('getSystemTypesByMultipleCatLNo error:', error);
        return of([]);
      })
    );
  }
  // 🔄 原有方法（保持單一大分類查詢功能）
  getSystemTypesByCatLNo(catLNoList: string[]): Observable<{ value: string, label: string }[]> {
    const params = {
      id: 0,
      No: '',
      Name: '',
      CAT_LNo: catLNoList || [] // 傳遞大分類代碼陣列
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
  // getSystemTypes(): Observable<{ value: string, label: string }[]> {
  //   return this.getSystemTypesByCatLNo(''); // 重用新方法，傳空值表示不過濾
  // }

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
