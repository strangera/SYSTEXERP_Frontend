import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS23090Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  /**
   * 根據查詢模式呼叫對應 API
   * @param query 查詢條件
   * @param mode 'CreditCardDetail' 或 'CounterCardAnalysis'
   */
  queryTLS23090(query: any, mode: 'CreditCardDetail' | 'CounterCardAnalysis'): Observable<any> {
    let endpoint = '';

    if (mode === 'CreditCardDetail') {
      endpoint = '/TLS0000/TLS2000/queryTLS23090_CreditCard';
    } else if (mode === 'CounterCardAnalysis') {
      endpoint = '/TLS0000/TLS2000/queryTLS23090_CounterCard';
    } else {
      console.error('查詢模式錯誤:', mode);
      return new Observable(observer => {
        observer.error('查詢模式錯誤');
      });
    }

    return this.http.post<any>(`${this.apiUrl}${endpoint}`, query).pipe(
      tap(response => console.log('查詢結果:', response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }
}
