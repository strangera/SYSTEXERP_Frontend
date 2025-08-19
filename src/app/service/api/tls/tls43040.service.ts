import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls43040Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) {}

  // 查詢 TLS43040 資料
  queryTLS43040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS43040`, data);
  }

  // 新增 TLS43040 資料
  insertTLS43040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS43040`, data);
  }

  // 更新 TLS43040 資料
  updateTLS43040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS43040`, data);
  }

  // 刪除 TLS43040 資料
  deleteTLS43040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS43040`, data);
  }
}
