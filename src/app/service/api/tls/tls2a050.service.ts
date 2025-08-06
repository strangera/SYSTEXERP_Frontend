import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls2A050Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  // 查詢 TLS2A050 第三方支付帳差報表
  queryTLS2A050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A050`, data);
  }

  // 匯出 第三方支付帳差報表
  exportTLS2A050(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2A050`, data, { responseType: 'blob' });
  }
}
