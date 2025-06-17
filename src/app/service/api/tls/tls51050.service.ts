import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls51050Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';
  constructor(private http: HttpClient) { }

  // 查詢 PLUUNIT 資料表
  queryTLS51050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51050`, body);
  }

  // 新增 PLUUNIT 資料表
  insertTLS51050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51050`, body);
  }

  // 更新 PLUUNIT 資料表
  updateTLS51050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51050`, body);
  }

  // 刪除 PLUUNIT 資料表
  deleteTLS51050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51050`, body);
  }
}
