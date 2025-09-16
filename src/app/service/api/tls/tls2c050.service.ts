import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '@service/system/auth.service';

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
}
