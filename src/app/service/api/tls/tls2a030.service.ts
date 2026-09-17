import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TLS2A030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2A030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A030`, data);
  }

  exportTLS2A030(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/exportTLS2A030`, data, {
      responseType: 'blob' as 'json',
      observe: 'response',
    });
  }

  lockTLS2A030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/lockTLS2A030`, data);
  }
  UnLockTLS2A030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UnLockTLS2A030`, data);
  }

  /** 溢欠彙總表第二層-每日資料 */
  queryTLS2A030_ByDay(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A030_ByDay`, data);
  }

  /** 溢欠彙總表第三層-每日支付別收銀機資料 */
  queryTLS2A030_ByDayAndPayNo(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A030_ByDayAndPayNo`, data);
  }
}
