import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardTypeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '信用卡別';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 從後端 API 取得卡別下拉選單
  getCardType(): Observable<any[]> {
    const url = `${this.apiUrl}/querySYS1000_DropDownList`;
    const body = { SYS_Type: 'CREDIT_CRD_Type' };

    return this.http.post<any>(url, body).pipe(
      tap((res) => console.debug('getCardType response', res)),
      map((res) =>
        Array.isArray(res?.Data)
          ? res.Data.map((item: any) => ({
              value: item.No,
              label: item.Name,
            }))
          : []
      ),
      catchError((error: HttpErrorResponse) =>
        this.errorHandler.handleError(error)
      )
    );
  }
}
