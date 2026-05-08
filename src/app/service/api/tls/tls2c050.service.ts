import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS2C050Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * 執行發票彙總作業
   * @param cls_date 日期字串，格式為 "YYYY-MM-DD"
   * @returns 回傳 HTTP 響應
   */
  invoiceTLS2C050(cls_date: string): Observable<ApiResponse<number>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/invoiceTLS2C050`;
    const body = { cls_date };
    return this.http.post<ApiResponse<number>>(url, body);
  }

  /**
   * 取得原匯檔發票日期(發票日期)此日期為最後發票鎖定日期的次日
   * @returns 回傳最近匯入日期的 HTTP 響應
   */
  GetTLS2C050ImportDate(): Observable<ApiResponse<{ CLS_DATE: string }>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/GetTLS2C050ImportDate`;
    return this.http.post<ApiResponse<{ CLS_DATE: string }>>(url, {});
  }

  /**
   * 取得發票彙總作業最近關帳日期
   * @returns 回傳最近關帳日期的 HTTP 響應
   */
  getTLS2C050Date(): Observable<ApiResponse<{ CLS_DATE: string }>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/GetTLS2C050Date`;
    return this.http.post<ApiResponse<{ CLS_DATE: string }>>(url, {});
  }

  /**
   * 取得發票彙總作業最近彙總日期
   * @returns 回傳最近彙總日期的 HTTP 響應
   */
  getTLS2C050Date_invoice(): Observable<ApiResponse<{ invoice_lock_date: string }>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/GetTLS2C050Date_invoice`;
    return this.http.post<ApiResponse<{ invoice_lock_date: string }>>(url, {});
  }

  /**
   * 執行發票鎖定 (LockTLS2C050)
   * @param cls_date 日期字串，格式為 "YYYY-MM-DD"
   * @returns 回傳 HTTP 響應
   */
  lockTLS2C050(cls_date: string): Observable<ApiResponse<number>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/LockTLS2C050`;
    const body = { cls_date };
    return this.http.post<ApiResponse<number>>(url, body);
  }

  /**
   * 執行發票反鎖定 (UnLockTLS2C050)
   * @param cls_date 日期字串，格式為 "YYYY-MM-DD"
   * @returns 回傳 HTTP 響應
   */
  unLockTLS2C050(cls_date: string): Observable<ApiResponse<number>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/UnLockTLS2C050`;
    const body = { cls_date };
    return this.http.post<ApiResponse<number>>(url, body);
  }
}
