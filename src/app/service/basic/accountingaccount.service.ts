import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountingaccountService {
  apiUrl: string = `${environment.ApiUrl}/queryGLS1005_DropDownList`;
  title: string = '會計科目';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getOptions(): Observable<any[]> {
    return this.http.post<any>(this.apiUrl, {}).pipe(
      tap((res) => console.debug('API 回傳:', res)),
      // 只取出 Data 並轉換為 { value, label, formLabel }
      tap((res) => {
        if (res.Status !== '0000') throw new Error('資料狀態異常');
      }),
      // 將 Data 映射為 dropdown 所需格式
      // ⛳ 若需要轉換請交由組件處理，這裡只回傳原始 Data
      map((res) => res.Data || []),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleError(error);
        return throwError(() => error);
      })
    );
  }
}
