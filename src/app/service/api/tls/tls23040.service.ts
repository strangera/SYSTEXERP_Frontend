import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap, forkJoin, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23040Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS23040(query: any): Observable<any> {
    const storeNo = JSON.parse(localStorage.getItem('UserInfo') || '{}').SYS_StoreNo;
    if (storeNo) {
      query.SYS_StoreNo = storeNo;
    }
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23040`, query).pipe(
      tap(response => console.log('查詢結果:', response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }

  queryTLS23040Detail(query: any): Observable<any> {
    const storeNo = JSON.parse(localStorage.getItem('UserInfo') || '{}').SYS_StoreNo;
    if (storeNo) {
      query.SYS_StoreNo = storeNo;
    }
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23040_Detail`, query).pipe(
      tap(response => console.log('明細查詢結果:', response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }

  queryCombined(query: any): Observable<any> {
    const storeNo = JSON.parse(localStorage.getItem('UserInfo') || '{}').SYS_StoreNo;
    if (storeNo) {
      query.SYS_StoreNo = storeNo;
    }
    return forkJoin({
      main: this.queryTLS23040(query),
      detail: this.queryTLS23040Detail(query)
    }).pipe(
      map(({ main, detail }) => {
        const mainData = main.Data || [];
        const detailData = detail.Data || [];

        const combined = mainData.map((mainItem: any) => {
          const related = detailData.find((detailItem: any) =>
            detailItem.TXN_Date === mainItem.TXN_Date &&
            detailItem.ECR_No === mainItem.ECR_No &&
            detailItem.TXN_No === mainItem.TXN_No
          );

          return {
            ...mainItem,
            ...(related || {})
          };
        });

        return {
          Status: main.Status === '0000' && detail.Status === '0000' ? '0000' : '9999',
          Data: combined,
          TotalCount: combined.length
        };
      }),
      tap(result => console.log('📦 合併後資料:', result)),
      catchError(error => {
        console.error('❌ 合併查詢失敗:', error);
        return of({
          Status: '9999',
          Data: [],
          TotalCount: 0
        });
      })
    );
  }
}
