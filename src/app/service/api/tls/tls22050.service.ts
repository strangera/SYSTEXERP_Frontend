import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls22050Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  // 查詢 第三方支付帳差報表
  queryTLS22050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22050`, data);
  }

  // 匯出 第三方支付帳差報表
  exportTLS22050(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS22050`, data, { responseType: 'blob' });
  }
}
