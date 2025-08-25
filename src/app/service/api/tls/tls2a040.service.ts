import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Tls2a040Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  /** 查詢 缺單據/作廢發票報表 */
  queryTLS2A040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A040`, data);
  }
  /** 匯出切結書*/
  exportTLS2A040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportTLS2A040`, data);
  }
}
