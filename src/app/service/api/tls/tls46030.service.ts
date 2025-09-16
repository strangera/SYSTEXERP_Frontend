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

  // 查詢 TLS46040
  queryTLS46040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS46040`, data);
  }

  // 新增 TLS46040
  insertTLS46040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS46040`, data);
  }

  // 更新 TLS46040
  updateTLS46040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS46040`, data);
  }
}
