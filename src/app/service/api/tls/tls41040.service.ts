import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls41040Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) { }

  // 查詢收銀機基本資料管理 (發票訊息及通告維護作業)
  queryTLS41040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS41040`, data);
  }

  // 新增收銀機基本資料管理
  insertTLS41040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS41040`, data);
  }

  // 更新收銀機基本資料管理
  updateTLS41040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS41040`, data);
  }

  // 刪除收銀機基本資料管理
  deleteTLS41040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS41040`, data);
  }
  posTLS41040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/posTLS41040`, data);
  }
}
