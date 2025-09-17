import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls46030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) {}

  // 查詢 TLS46030
  queryTLS46030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS46030`, data);
  }

  // 新增 TLS46030
  insertTLS46030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS46030`, data);
  }

  // 更新 TLS46030
  updateTLS46030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS46030`, data);
  }
}
