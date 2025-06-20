import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Tls46010Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(
    private http: HttpClient,
  ) { }

  // POS10015資料表查詢條件
  queryTLS0000(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS46010`, data);
  }

  //新增POS10015
  insertTLS0000(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS46010`, data);
  }

  // 更新POS10015資料
  updateTLS46010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS46010`, data);
  }

  // 刪除POS10015資料
  deleteTLS46010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS46010`, data);
  }
}
