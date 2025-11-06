import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls42010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) {}

  // 查詢 POS1004M 資料表
  queryTLS42010M(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS42010M`, data);
  }
  deleteTLS42010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS42010`, data);
  }

  // 查詢 POS1004M 資料表 - 明細
  queryTLS42010_Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS42010_Detail`, data);
  }

  // 新增 POS1004M 資料表
  insertTLS42010M(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS42010M`, data);
  }

  // 更新 POS1004M 資料表
  updateTLS42010M(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS42010M`, data);
  }
}
