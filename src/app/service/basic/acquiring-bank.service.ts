import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface DropdownItem {
  value: string;
  label: string;
}

interface Sys1000Item {
  No: string;
  Name: string;
}
interface ApiResponse<T> {
  Status: string;
  Data: T;
  Error?: { Code?: string; Message?: string; Details?: string };
  Meta?: { Timestamp?: string; RequestId?: string };
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}


@Injectable({
  providedIn: 'root',
})
export class AcquiringBankService {
  apiUrl: string = environment.ApiUrl;
  title: string = '收單銀行';

  // 本地數據的收單銀行選項，使用數字作為 value
  private localOptions: DropdownItem[] = [
    { value: "1", label: '聯合' },
    { value: "2", label: '中信' },
  
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

    getAcquiringBanks(): Observable<DropdownItem[]> {
      const url = `${this.apiUrl}/querySYS1000_DropDownList`;
      const body = { SYS_Type: 'T113' };
  
      return this.http
        .post<ApiResponse<Sys1000Item[]>>(url, body)
        .pipe(
          tap((res) => console.debug('[InstallmentPeriodService] raw response', res)),
          map((res) => {
            const list = Array.isArray(res?.Data) ? res.Data : [];
            return list.map<DropdownItem>((x) => ({
              value: x.No,
              label: x.Name,
            }));
          }),
          tap((data) => console.debug('[InstallmentPeriodService] mapped options', data)),
          catchError((error: HttpErrorResponse) => {
            // 記錄錯誤並退回本地選項
            this.errorHandler.handleError(error);
            return of(this.localOptions);
          })
        );
    }

  // // 獲取所有收單銀行（本地數據）
  // getAcquiringBanks(): Observable<any[]> {
  //   return of(this.options).pipe(
  //     tap((data) => console.debug('get options response', data)),
  //     catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
  //   );
  // }
}
