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
export class InstallmentPeriodService {
  apiUrl: string = environment.ApiUrl;
  title: string = '分期期數';

  // 本地預設選項（當 API 不可用時做為 fallback）
  private localOptions: DropdownItem[] = [
    { value: '0', label: '不分期' },
    { value: '3', label: '3期' },
    { value: '6', label: '6期' },
    { value: '12', label: '12期' },
    { value: '24', label: '24期' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * 從後端 SYS1000 取得分期期數下拉資料
   * 會以 POST /querySYS1000_DropDownList，Body: { SYS_Type: 'T109' }
   * 並將 {No, Name} => {value, label}
   * 若失敗則回傳本地預設選項
   */
  getInstallmentPeriods(): Observable<DropdownItem[]> {
    const url = `${this.apiUrl}/querySYS1000_DropDownList`;
    const body = { SYS_Type: 'T109' };

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

  /** 需要時可直接取得本地預設（不打 API） */
  getLocalInstallmentPeriods(): Observable<DropdownItem[]> {
    return of(this.localOptions);
  }
}
