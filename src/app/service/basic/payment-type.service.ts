import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '付款別';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  /**
   * 取得付款別清單 (轉換成 {value, label} 格式)
   */
  getPaymentTypes(): Observable<any[]> {
    const url = `${this.apiUrl}/queryPOS1006_DropDownList`;

    return this.http.post<any>(url, {}).pipe(
      tap((res) => console.debug('getPaymentTypes raw response', res)),
      map((res) =>
        (res?.Data ?? []).map((item: any) => ({
          value: item.No,
          label: item.Name,
          PAY_Type: item.PAY_Type, // 保留原始欄位，若之後需要用得到
        }))
      ),
      tap((options) => console.debug('getPaymentTypes mapped options', options)),
      catchError((error: HttpErrorResponse) =>
        this.errorHandler.handleError(error)
      )
    );
  }
}
