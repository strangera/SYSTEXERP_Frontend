import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls2A050Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  // ================= TLS2A050 =================

  // 查詢 TLS2A050 第三方支付帳差報表
  queryTLS2A050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A050`, data);
  }

  // 匯出 TLS2A050 第三方支付帳差報表
  exportTLS2A050(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS2A050`, data, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  // ================= TLS22050 =================

  // 查詢 TLS22050 第三方支付帳差報表
  queryTLS22050(data: any): Observable<any> {
    console.log('🔍 queryTLS22050 payload:', data);
    return this.http.post<any>(`${this.apiUrl}/queryTLS22050`, data);
  }

  // 匯出 TLS22050 第三方支付帳差報表
  exportTLS22050(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS22050`, data, {
      responseType: 'blob'
    });
  }
}
