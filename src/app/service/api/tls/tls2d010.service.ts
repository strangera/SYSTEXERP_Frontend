import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Tls2d010Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  // 查詢 TLS2D010 序號異常報表
  queryTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2D010`, data);
  }
  insertTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2D010`, data);
  }
  deleteTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS2D010`, data);
  }
}
