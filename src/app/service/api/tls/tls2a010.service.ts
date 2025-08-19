import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Tls2a010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  /** 查詢 各支付工具審核作業 */
  queryTLS2A010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A010`, data);
  }

  /** 查詢明細 */
  queryDetailTLS2A010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryDetailTLS2A010`, data);
  }

  /** 新增 */
  insertTLS2A010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2A010`, data);
  }

  /** 更新 */
  updateTLS2A010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2A010`, data);
  }
}
