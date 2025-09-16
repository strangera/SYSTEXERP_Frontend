import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ErrorHandlerService } from '../../system/error-handler.service';

interface ApiError {
  Code: string;
  Message: string;
  Details?: string;
}

interface DropDownItem {
  No: string;
  Name: string;
}

interface ApiResponse<T> {
  Status: string;
  Data: T;
  Error?: ApiError | null;
  Meta?: { Timestamp?: string; RequestId?: string };
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}

@Injectable({ providedIn: 'root' })
export class TLS13030Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * 查詢 TLS13030 主資料
   */
  queryTLS13030(payload: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13030`, payload)
      .pipe(
        tap((res) => console.log('查詢結果:', res)),
        catchError(this.errorHandler.handleError)
      );
  }

  /**
   * 刪除 TLS13030 資料
   */
  deleteTLS13030(idList: number[]): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/TLS0000/TLS1000/deleteTLS13030`, { idList })
      .pipe(
        tap((res) => console.log('刪除結果:', res)),
        catchError(this.errorHandler.handleError)
      );
  }

  /**
   * 取得 APS1003 下拉選單資料（原有）
   */
  getAPS1003DropDownList(): Observable<any[]> {
    return this.http
      .post<any[]>(`${this.apiUrl}/queryAPS1003_DropDownList`, {})
      .pipe(
        tap((res) => console.log('APS1003 下拉資料:', res)),
        catchError(this.errorHandler.handleError)
      );
  }

  /**
   * 取得 SYS3100 下拉選單（組織代碼/名稱）
   * 後端格式：
   * {
   *   "Status": "string",
   *   "Data": [ { "No": "string", "Name": "string" } ],
   *   ...
   * }
   * 前端需求：
   *   value => No
   *   label => Name
   */
  getSYS3100DropDownList(): Observable<Array<{ label: string; value: string }>> {
    return this.http
      .post<ApiResponse<DropDownItem[]>>(`${this.apiUrl}/querySYS3100_DropDownList`, {})
      .pipe(
        tap((res) => console.log('SYS3100 下拉資料:', res)),
        map((res) =>
          (res?.Data ?? []).map((x) => ({
            label: x?.Name ?? '',
            value: x?.No ?? ''
          }))
        ),
        catchError(this.errorHandler.handleError)
      );
  }
}
