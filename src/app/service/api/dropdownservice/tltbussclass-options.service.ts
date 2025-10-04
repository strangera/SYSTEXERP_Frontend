import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { catchError, Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BussclassDropdownService {
  apiUrl: string = environment.ApiUrl;
  queryApiUrl = `${environment.ApiUrl}/queryTLTBUSSCLASS_DropDownList`;
  title = '小分類代碼';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  /**
   * 根據大分類和中分類取得小分類選項
   * @param busTypes 大分類代碼陣列
   * @param classTypes 中分類代碼陣列
   */
  getSystemTypesByBustype(busTypes: string[], classTypes: string[]): Observable<{ value: string, label: string }[]> {
    // 將 busTypes 和 classTypes 組合成新的參數格式
    const queryInfos = [];
    const maxLength = Math.max(busTypes.length, classTypes.length);

    for (let i = 0; i < maxLength; i++) {
      if (busTypes[i] && classTypes[i]) {
        queryInfos.push({
          bus_type: busTypes[i],
          bus_class: classTypes[i]
        });
      }
    }

    const params = {
      queryTLTBUSSCLASSInfos: queryInfos
    };

    console.log('小分類 API 請求參數:', params);

    return this.http.post<any>(this.queryApiUrl, params).pipe(
      tap(data => console.debug('queryTLTBUSSCLASS_DropDownList response', data)),
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
    );
  }

  /**
   * 取得所有小分類選項（不過濾大分類和中分類）
   * 只有在需要顯示所有小分類時才使用
   */
  getAllSystemTypes(): Observable<{ value: string, label: string }[]> {
    return this.getSystemTypesByBustype([], []); // 都傳空陣列表示不過濾
  }

  // 移除不合理的方法，因為你的 API 設計需要大分類+中分類
  // getSystemTypesByBustypeOnly() 這個方法不符合你的 API 設計

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
