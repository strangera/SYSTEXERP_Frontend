import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls22030Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  // 查詢 TLS22030 序號異常報表
  queryTLS22030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22030`, data);
  }

  // 匯出 TLS22030 PDF
  exportTLS22030PDF(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS22030PDF`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  exportTLS22030(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS22030`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
