import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls51080Service {
  // 分倉資料處理 WAREHOUSE
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';
  constructor(private http: HttpClient) { }

  // 查詢 WAREHOUSE 資料表
  queryTLS51080(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51080`, body);
  }

  // 新增 WAREHOUSE 資料表
  insertTLS51080(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51080`, body);
  }

  // 更新 WAREHOUSE 資料表
  updateTLS51080(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51080`, body);
  }

  // 刪除 WAREHOUSE 資料表
  deleteTLS51080(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51080`, body);
  }
}
