import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23070Service {
  apiUrl: string = environment.ApiUrl;


  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS23070(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23070`, query).pipe(
      tap(response => console.log('查詢結果:', response)),
     
    );
  }

    /** 匯出 PDF（不分頁） */
    exporttls23070PDF(body: any): Observable<HttpResponse<Blob>> {
      const url = `${this.apiUrl}/TLS0000/TLS2000/exporttls23070PDF`;
      const payload = this.stripPaging(body);
      return this.http.post(url, payload, {
        observe: 'response',
        responseType: 'blob' as 'json',
      }) as Observable<HttpResponse<Blob>>;
    }
  
    /**
     * 匯出用：移除分頁相關欄位（大小寫都處理），保留 SortBy（若後端會依排序輸出）
     */
    private stripPaging<T extends Record<string, any>>(
      input: T
    ): Omit<T,
      'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset' |
      'pageSize' | 'pageIndex' | 'orderBy' | 'offset'
    > {
      if (!input) return input as any;
      const {
        PageSize, PageIndex, OrderBy, Offset,
        pageSize, pageIndex, orderBy, offset,
        ...rest
      } = input as any;
      return rest as any;
    }
}

